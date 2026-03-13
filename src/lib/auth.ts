import { currentUser, auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";

/**
 * Retry helper with exponential backoff.
 * Handles the race condition where a user hits a page before the
 * Clerk webhook has synced their organization to the database.
 */
async function withRetry<T>(
  fn: () => Promise<T | null | undefined>,
  retries = 3,
  baseDelayMs = 100
): Promise<T | null | undefined> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const result = await fn();
    if (result) return result;
    if (attempt < retries) {
      const delay = baseDelayMs * Math.pow(2, attempt); // 100, 200, 400
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  return null;
}

/**
 * Get the current authenticated user and their internal organization record.
 *
 * Returns `{ user, org, orgId }` where:
 * - `user` is the Clerk user object
 * - `org` is the internal DB organization row
 * - `orgId` is the internal DB organization ID (e.g. "org_abc123...")
 *
 * Throws if the user is not authenticated or has no active organization.
 */
export async function getCurrentOrg() {
  const user = await currentUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { orgId: clerkOrgId } = await auth();

  if (!clerkOrgId) {
    throw new Error("No active organization. Please select or create an organization.");
  }

  // Query for the internal org record, with retry logic to handle
  // the webhook race condition (org created in Clerk but webhook
  // hasn't synced it to our DB yet).
  const org = await withRetry(async () => {
    const [row] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.clerkOrgId, clerkOrgId))
      .limit(1);
    return row;
  });

  if (!org) {
    throw new Error(
      "Organization not found in database. It may still be syncing -- please try again in a moment."
    );
  }

  return {
    user,
    org,
    orgId: org.id,
  };
}

/**
 * Safe version of getCurrentOrg that returns null instead of throwing
 * when the org is not found in the database (webhook race condition).
 *
 * Still throws for "Not authenticated" — callers should handle that
 * or use requireAuth() instead.
 */
export async function getCurrentOrgSafe() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const { orgId: clerkOrgId } = await auth();

  if (!clerkOrgId) {
    return { user, org: null, orgId: null, reason: "no-org" as const };
  }

  const org = await withRetry(async () => {
    const [row] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.clerkOrgId, clerkOrgId))
      .limit(1);
    return row;
  });

  if (!org) {
    return { user, org: null, orgId: null, reason: "not-synced" as const };
  }

  return { user, org, orgId: org.id, reason: null };
}

/**
 * Require authentication and an active organization.
 * Redirects to /sign-in if not authenticated.
 *
 * Use this in Server Components and Server Actions that need auth context.
 * NOTE: Do NOT use this on the dashboard page itself — use getCurrentOrgSafe()
 * to avoid redirect loops when the org hasn't synced yet.
 */
export async function requireAuth() {
  try {
    return await getCurrentOrg();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";

    if (message === "Not authenticated") {
      redirect("/sign-in");
    }

    // For org-related errors (no active org, org not in DB),
    // redirect to dashboard which handles these gracefully.
    redirect("/dashboard");
  }
}
