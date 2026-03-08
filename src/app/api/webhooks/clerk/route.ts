import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import pino from "pino";

import { db } from "@/lib/db";
import {
  organizations,
  users,
  brandSettings,
  subscriptions,
} from "@/lib/db/schema";
import { checkAndMarkProcessed } from "@/lib/webhooks/idempotency";

const logger = pino({ name: "clerk-webhook" });

// ---------------------------------------------------------------------------
// Clerk webhook event payload types
// ---------------------------------------------------------------------------

interface OrganizationCreatedData {
  id: string;
  name: string;
  slug: string;
}

interface UserCreatedData {
  id: string;
  email_addresses: { email_address: string }[];
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
}

interface OrganizationMembershipCreatedData {
  organization: { id: string };
  public_user_data: { user_id: string };
  role: string;
}

type WebhookEvent =
  | { type: "organization.created"; data: OrganizationCreatedData }
  | { type: "user.created"; data: UserCreatedData }
  | {
      type: "organizationMembership.created";
      data: OrganizationMembershipCreatedData;
    }
  | { type: string; data: unknown };

// ---------------------------------------------------------------------------
// POST /api/webhooks/clerk
// ---------------------------------------------------------------------------

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    logger.error("CLERK_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  // ---- Verify Svix signature ------------------------------------------------

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    logger.warn("Missing Svix headers");
    return NextResponse.json(
      { error: "Missing Svix headers" },
      { status: 400 }
    );
  }

  const body = await req.text();

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    logger.warn({ err }, "Svix signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ---- Idempotency check ----------------------------------------------------

  const eventId = svixId;
  const eventType = evt.type;

  const { alreadyProcessed } = await checkAndMarkProcessed(
    "clerk",
    eventId,
    eventType
  );

  if (alreadyProcessed) {
    logger.info({ eventId, eventType }, "Duplicate event — skipping");
    return NextResponse.json({ received: true });
  }

  // ---- Handle event types ---------------------------------------------------

  try {
    switch (evt.type) {
      case "organization.created": {
        await handleOrganizationCreated(evt.data as OrganizationCreatedData);
        break;
      }

      case "user.created": {
        await handleUserCreated(evt.data as UserCreatedData);
        break;
      }

      case "organizationMembership.created": {
        await handleOrganizationMembershipCreated(evt.data as OrganizationMembershipCreatedData);
        break;
      }

      default:
        logger.info({ eventType }, "Unhandled event type — ignoring");
    }
  } catch (err) {
    // Return 200 even on processing errors to prevent Svix retries for
    // known-bad data. The error is logged so it can be investigated.
    logger.error({ err, eventType, eventId }, "Error processing webhook event");
  }

  return NextResponse.json({ received: true });
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

async function handleOrganizationCreated(data: OrganizationCreatedData) {
  logger.info({ clerkOrgId: data.id, name: data.name }, "Creating organization");

  // Insert the organization row
  const [org] = await db
    .insert(organizations)
    .values({
      clerkOrgId: data.id,
      name: data.name,
      slug: data.slug,
    })
    .returning({ id: organizations.id });

  // Create default brand settings with industry defaults
  await db.insert(brandSettings).values({
    organizationId: org.id,
    companyName: data.name,
    primaryColor: "#1e3a5f",
    secondaryColor: "#c9a84c",
    accentColor: "#ffffff",
    backgroundColor: "#f5f5f5",
  });

  // Create free-plan subscription
  await db.insert(subscriptions).values({
    organizationId: org.id,
    planTier: "free",
    status: "active",
    monthlyPostLimit: 3,
    monthlyCaptionLimit: 5,
  });

  logger.info({ orgId: org.id, clerkOrgId: data.id }, "Organization created");
}

async function handleUserCreated(data: UserCreatedData) {
  const email = data.email_addresses?.[0]?.email_address;

  if (!email) {
    logger.warn({ clerkUserId: data.id }, "User has no email — skipping");
    return;
  }

  logger.info({ clerkUserId: data.id, email }, "Creating user");

  await db.insert(users).values({
    clerkUserId: data.id,
    email,
    firstName: data.first_name ?? undefined,
    lastName: data.last_name ?? undefined,
    avatarUrl: data.image_url ?? undefined,
  });

  logger.info({ clerkUserId: data.id }, "User created");
}

async function handleOrganizationMembershipCreated(
  data: OrganizationMembershipCreatedData
) {
  const clerkOrgId = data.organization.id;
  const clerkUserId = data.public_user_data.user_id;
  const clerkRole = data.role;

  logger.info(
    { clerkOrgId, clerkUserId, clerkRole },
    "Processing organization membership"
  );

  // Resolve the internal organization id
  const [org] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.clerkOrgId, clerkOrgId))
    .limit(1);

  if (!org) {
    logger.warn({ clerkOrgId }, "Organization not found — skipping membership");
    return;
  }

  // Map Clerk role to our role enum
  const roleMap: Record<string, "owner" | "admin" | "member"> = {
    "org:admin": "admin",
    "org:member": "member",
    admin: "admin",
    member: "member",
  };
  const role = roleMap[clerkRole] ?? "member";

  // Update the user with their organization and role
  await db
    .update(users)
    .set({
      organizationId: org.id,
      role,
    })
    .where(eq(users.clerkUserId, clerkUserId));

  logger.info(
    { clerkUserId, orgId: org.id, role },
    "User membership updated"
  );
}
