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
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Loader2 } from "lucide-react";
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {tierOrder.map((tier, index) => {
          const plan = PLAN_CONFIGS[tier];
          const isCurrent = tier === currentTier;
          const isUpgrade = index > currentTierIndex;
          const isPopular = tier === "pro";

          return (
            <Card
              key={tier}
              className={cn(
                "relative flex flex-col",
                isCurrent && "border-primary ring-2 ring-primary/20",
                isPopular && !isCurrent && "border-amber-400"
              )}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                    <Zap className="mr-1 h-3 w-3" />
                    Most Popular
                  </Badge>
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge>Current Plan</Badge>
                </div>
              )}

              <CardHeader className="pt-8">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-bold text-foreground">
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
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                {isCurrent ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled
                  >
                    Current Plan
                  </Button>
                ) : isUpgrade ? (
                  <Button
                    className="w-full"
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
                    variant="outline"
                    className="w-full"
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
            onClick={handleManageSubscription}
            disabled={portalLoading}
          >
            {portalLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Opening Portal...
              </>
            ) : (
              "Manage Subscription"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
