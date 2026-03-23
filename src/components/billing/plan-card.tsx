"use client";

import { useState } from "react";
import { PLAN_CONFIGS, type PlanTier } from "@/lib/stripe";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  currentTier: PlanTier;
  hasStripeSubscription: boolean;
}

const tierOrder: PlanTier[] = ["free", "starter", "pro", "team"];

export function PlanCard({ currentTier, hasStripeSubscription }: PlanCardProps) {
  const [loadingTier, setLoadingTier] = useState<PlanTier | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  async function handleUpgrade(tier: PlanTier) {
    try {
      setLoadingTier(tier);
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Failed to create checkout session:", error);
    } finally {
      setLoadingTier(null);
    }
  }

  async function handleManageSubscription() {
    try {
      setPortalLoading(true);
      const response = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Failed to open billing portal:", error);
    } finally {
      setPortalLoading(false);
    }
  }

  const currentTierIndex = tierOrder.indexOf(currentTier);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {tierOrder.map((tier, index) => {
          const plan = PLAN_CONFIGS[tier];
          const isCurrent = tier === currentTier;
          const isUpgrade = index > currentTierIndex;
          const isPopular = tier === "pro";

          return (
            <Card
              key={tier}
              className={cn(
                "relative flex flex-col border-border/60",
                isCurrent && "border-foreground",
                isPopular && !isCurrent && "border-foreground/40"
              )}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-6">
                  <span className="rounded-md bg-foreground px-3 py-1 text-xs font-medium text-background">
                    Current plan
                  </span>
                </div>
              )}

              {isPopular && !isCurrent && (
                <div className="absolute -top-3 left-6">
                  <span className="rounded-md bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    Recommended
                  </span>
                </div>
              )}

              <CardHeader className="pt-8">
                <CardTitle className="text-base">{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold tabular-nums text-foreground">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">/month</span>
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                {isCurrent ? (
                  <Button
                    variant="secondary"
                    className="w-full rounded-md"
                    disabled
                  >
                    Current plan
                  </Button>
                ) : isUpgrade ? (
                  <Button
                    className="w-full rounded-md"
                    onClick={() => handleUpgrade(tier)}
                    disabled={loadingTier !== null}
                  >
                    {loadingTier === tier ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    className="w-full rounded-md"
                    disabled
                  >
                    Downgrade
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {hasStripeSubscription && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="rounded-md"
            onClick={handleManageSubscription}
            disabled={portalLoading}
          >
            {portalLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Opening portal...
              </>
            ) : (
              "Manage subscription"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
