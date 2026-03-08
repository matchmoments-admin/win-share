import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import pino from "pino";

import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { stripe, PLAN_CONFIGS } from "@/lib/stripe";
import { checkAndMarkProcessed } from "@/lib/webhooks/idempotency";

const logger = pino({ name: "stripe-webhook" });

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    logger.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    logger.warn({ err }, "Stripe signature verification failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency check
  const { alreadyProcessed } = await checkAndMarkProcessed(
    "stripe",
    event.id,
    event.type
  );

  if (alreadyProcessed) {
    logger.info({ eventId: event.id }, "Duplicate Stripe event — skipping");
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const orgId = session.metadata?.organizationId;
        const planTier = session.metadata?.planTier as keyof typeof PLAN_CONFIGS;

        if (!orgId || !planTier) {
          logger.warn("Missing metadata in checkout session");
          break;
        }

        const planConfig = PLAN_CONFIGS[planTier];
        const stripeSubscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        const stripeCustomerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;

        await db
          .update(subscriptions)
          .set({
            stripeCustomerId: stripeCustomerId ?? null,
            stripeSubscriptionId: stripeSubscriptionId ?? null,
            planTier,
            status: "active",
            monthlyPostLimit: planConfig.monthlyPostLimit,
            monthlyCaptionLimit: planConfig.monthlyCaptionLimit,
          })
          .where(eq(subscriptions.organizationId, orgId));

        logger.info({ orgId, planTier }, "Subscription activated");
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const stripeSubId = subscription.id;

        const statusMap: Record<string, string> = {
          active: "active",
          past_due: "past_due",
          canceled: "canceled",
          trialing: "trialing",
          incomplete: "incomplete",
        };

        await db
          .update(subscriptions)
          .set({
            status: (statusMap[subscription.status] ?? "active") as "active",
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            currentPeriodStart: new Date(
              (subscription as unknown as { current_period_start: number }).current_period_start * 1000
            ),
            currentPeriodEnd: new Date(
              (subscription as unknown as { current_period_end: number }).current_period_end * 1000
            ),
          })
          .where(eq(subscriptions.stripeSubscriptionId, stripeSubId));

        logger.info(
          { stripeSubId, status: subscription.status },
          "Subscription updated"
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const stripeSubId = subscription.id;

        // Downgrade to free plan
        await db
          .update(subscriptions)
          .set({
            planTier: "free",
            status: "canceled",
            monthlyPostLimit: PLAN_CONFIGS.free.monthlyPostLimit,
            monthlyCaptionLimit: PLAN_CONFIGS.free.monthlyCaptionLimit,
            stripeSubscriptionId: null,
          })
          .where(eq(subscriptions.stripeSubscriptionId, stripeSubId));

        logger.info({ stripeSubId }, "Subscription canceled — downgraded to free");
        break;
      }

      case "invoice.paid": {
        // No-op: usage resets via calendar month on usage_events
        logger.info({ invoiceId: event.data.object.id }, "Invoice paid");
        break;
      }

      default:
        logger.info({ eventType: event.type }, "Unhandled Stripe event");
    }
  } catch (err) {
    logger.error(
      { err, eventType: event.type, eventId: event.id },
      "Error processing Stripe webhook"
    );
  }

  return NextResponse.json({ received: true });
}
