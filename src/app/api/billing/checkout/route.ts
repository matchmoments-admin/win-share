import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { organizations, subscriptions } from "@/lib/db/schema";
import { stripe, PLAN_CONFIGS } from "@/lib/stripe";
import { handleApiError, AppError, ErrorCode } from "@/lib/errors";
import { checkRateLimit, apiLimiter } from "@/lib/rate-limit";

const checkoutSchema = z.object({
  planTier: z.enum(["starter", "pro", "team"]),
});

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();

    if (!clerkUserId || !clerkOrgId) {
      throw new AppError("Unauthorized", ErrorCode.UNAUTHORIZED);
    }

    await checkRateLimit(apiLimiter, clerkUserId);

    const body = await req.json();
    const { planTier } = checkoutSchema.parse(body);

    const planConfig = PLAN_CONFIGS[planTier];
    if (!planConfig.priceId) {
      throw new AppError("Invalid plan", ErrorCode.VALIDATION_ERROR);
    }

    // Get org and subscription
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.clerkOrgId, clerkOrgId))
      .limit(1);

    if (!org) {
      throw new AppError("Organization not found", ErrorCode.NOT_FOUND);
    }

    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.organizationId, org.id))
      .limit(1);

    // If they already have a Stripe customer, use it
    const customerOptions = sub?.stripeCustomerId
      ? { customer: sub.stripeCustomerId }
      : { customer_creation: "always" as const };

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
      metadata: {
        organizationId: org.id,
        planTier,
      },
      ...customerOptions,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            message: "Validation error",
            code: "VALIDATION_ERROR",
            details: error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }
    return handleApiError(error);
  }
}
