import Link from "next/link";
import { PLAN_CONFIGS } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — WinShare",
  description:
    "Simple, transparent pricing for every stage of your business. Start free, upgrade as you grow.",
};

const tiers = [
  { key: "free" as const, popular: false },
  { key: "starter" as const, popular: false },
  { key: "pro" as const, popular: true },
  { key: "team" as const, popular: false },
];

const faqs = [
  {
    question: "Can I try WinShare for free?",
    answer:
      "Yes. The Free plan includes 3 posts per month and 5 AI captions. No credit card required to get started.",
  },
  {
    question: "Can I change my plan at any time?",
    answer:
      "You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we prorate your billing.",
  },
  {
    question: "What happens if I exceed my monthly limit?",
    answer:
      "You will see a notification when approaching your limit. Once reached, you need to upgrade to continue creating posts that month. Existing posts remain accessible.",
  },
  {
    question: "Do you offer annual billing?",
    answer:
      "Not yet, but annual plans with a discount are coming soon. Subscribe to our newsletter to be notified.",
  },
  {
    question: "Can I cancel at any time?",
    answer:
      "Yes. Cancel from your billing page at any time. You keep access until the end of your current billing period.",
  },
  {
    question: "Are the images watermarked?",
    answer:
      "On the Free plan, generated images include a small WinShare watermark. All paid plans produce clean, watermark-free images.",
  },
];

export default function PricingPage() {
  return (
    <div>
      {/* Header */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Simple, transparent pricing
            </h1>
            <p className="mt-4 text-base text-muted-foreground">
              Start free, upgrade as you grow. No hidden fees, no surprises.
            </p>
          </div>
        </div>
      </section>

      {/* Plan Cards */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {tiers.map(({ key, popular }) => {
              const plan = PLAN_CONFIGS[key];
              return (
                <Card
                  key={key}
                  className={cn(
                    "relative flex flex-col border-border/60",
                    popular && "border-foreground"
                  )}
                >
                  {popular && (
                    <div className="absolute -top-3 left-6">
                      <span className="rounded-md bg-foreground px-3 py-1 text-xs font-medium text-background">
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
                      {plan.price === 0 && (
                        <span className="text-muted-foreground"> forever</span>
                      )}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5 text-sm"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className={cn(
                        "w-full rounded-md",
                        !popular && "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      )}
                      variant={popular ? "default" : "secondary"}
                      asChild
                    >
                      <Link href="/sign-up">
                        {plan.price === 0 ? "Get started free" : `Start with ${plan.name}`}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ — clean divider style */}
      <section className="border-t py-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight">
            Frequently asked questions
          </h2>

          <div className="mt-12 divide-y divide-border/60">
            {faqs.map((faq) => (
              <div key={faq.question} className="py-6 first:pt-0 last:pb-0">
                <h3 className="text-sm font-medium">{faq.question}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — warm card instead of dark block */}
      <section className="border-t py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-border/60 bg-card px-8 py-16 text-center sm:px-16">
            <h2 className="text-2xl font-bold tracking-tight text-balance">
              Ready to start celebrating your wins?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Join 530+ businesses using WinShare. No credit card required.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild className="rounded-md">
                <Link href="/sign-up">
                  Get started free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
