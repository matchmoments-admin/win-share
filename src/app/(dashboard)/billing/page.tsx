import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getMonthlyUsage } from "@/lib/usage/check";
import { PLAN_CONFIGS, type PlanTier } from "@/lib/stripe";
import { PlanCard } from "@/components/billing/plan-card";
import { UsageMeter } from "@/components/billing/usage-meter";

export default async function BillingPage() {
  const { orgId } = await requireAuth();

  // Fetch subscription
  const subscription = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.organizationId, orgId),
  });

  const currentTier: PlanTier = (subscription?.planTier as PlanTier) ?? "free";
  const plan = PLAN_CONFIGS[currentTier];
  const hasStripeSubscription = !!subscription?.stripeSubscriptionId;

  // Fetch current month usage
  const [postUsage, captionUsage] = await Promise.all([
    getMonthlyUsage(orgId, "post_generated"),
    getMonthlyUsage(orgId, "ai_caption"),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Billing</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your subscription and monitor your usage.
        </p>
      </div>

      {/* Current Usage */}
      <div>
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">
          Current usage
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border/60 p-5">
            <UsageMeter
              current={postUsage}
              limit={plan.monthlyPostLimit}
              label="Posts generated"
            />
          </div>
          <div className="rounded-lg border border-border/60 p-5">
            <UsageMeter
              current={captionUsage}
              limit={plan.monthlyCaptionLimit}
              label="AI captions"
            />
          </div>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="border-t pt-8">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">
          Plans
        </h3>
        <PlanCard
          currentTier={currentTier}
          hasStripeSubscription={hasStripeSubscription}
        />
      </div>
    </div>
  );
}
