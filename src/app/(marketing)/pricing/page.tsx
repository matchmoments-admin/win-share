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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, Zap, ArrowRight } from "lucide-react";
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
      "Yes! The Free plan includes 3 posts per month and 5 AI captions. No credit card required to get started.",
  },
  {
    question: "Can I change my plan at any time?",
    answer:
      "Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate your billing.",
  },
  {
    question: "What happens if I exceed my monthly limit?",
    answer:
      "You'll see a notification when you're approaching your limit. Once you reach it, you'll need to upgrade to continue creating posts that month. Your existing posts remain accessible.",
  },
  {
    question: "Do you offer annual billing?",
    answer:
      "Not yet, but annual plans with a discount are coming soon. Subscribe to our newsletter to be notified.",
  },
  {
    question: "Can I cancel at any time?",
    answer:
      "Yes. You can cancel your subscription at any time from your billing page. You'll continue to have access until the end of your current billing period.",
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
      <section className="bg-gradient-to-b from-primary/5 via-background to-background py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Start free, upgrade as you grow. No hidden fees, no surprises.
          </p>
        </div>
      </section>

      {/* Plan Cards */}
      <section className="-mt-4 pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {tiers.map(({ key, popular }) => {
              const plan = PLAN_CONFIGS[key];
              return (
                <Card
                  key={key}
                  className={cn(
                    "relative flex flex-col",
                    popular && "border-primary shadow-lg ring-2 ring-primary/20"
                  )}
                >
                  {popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        <Zap className="mr-1 h-3 w-3" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pt-8">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>
                      <span className="text-4xl font-bold text-foreground">
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
                          className="flex items-start gap-2 text-sm"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button
                      className="w-full"
                      variant={popular ? "default" : "outline"}
                      asChild
                    >
                      <Link href="/sign-up">
                        {plan.price === 0 ? "Get Started Free" : `Start with ${plan.name}`}
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

      <Separator className="mx-auto max-w-7xl" />

      {/* FAQ */}
      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-center text-muted-foreground">
            Everything you need to know about WinShare pricing.
          </p>

          <div className="mt-12 space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-lg border p-6">
                <h3 className="font-semibold">{faq.question}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight">
            Ready to start celebrating your wins?
          </h2>
          <p className="mt-3 text-primary-foreground/80">
            Join 500+ businesses using WinShare. No credit card required.
          </p>
          <div className="mt-6">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/sign-up">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
