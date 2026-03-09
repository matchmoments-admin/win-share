import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, PlusCircle, Share2, Check } from "lucide-react";

interface OnboardingWizardProps {
  hasBrand: boolean;
  hasPost: boolean;
  hasShared: boolean;
}

const steps = [
  {
    key: "brand" as const,
    title: "Set Up Your Brand",
    description: "Add your company name, logo, and brand colours to personalise every post.",
    href: "/brand",
    icon: Building2,
  },
  {
    key: "post" as const,
    title: "Create Your First Post",
    description: "Generate a branded social media post to celebrate a win or share news.",
    href: "/create",
    icon: PlusCircle,
  },
  {
    key: "share" as const,
    title: "Share With the World",
    description: "Share your post on social media to start growing your audience.",
    href: "/posts",
    icon: Share2,
  },
];

export function OnboardingWizard({
  hasBrand,
  hasPost,
  hasShared,
}: OnboardingWizardProps) {
  const completion: Record<string, boolean> = {
    brand: hasBrand,
    post: hasPost,
    share: hasShared,
  };

  const completedCount = Object.values(completion).filter(Boolean).length;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-lg">Get Started with WinShare</CardTitle>
        <CardDescription>
          Complete these {3 - completedCount} step{3 - completedCount !== 1 ? "s" : ""} to get the most out of WinShare.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          {steps.map((step, index) => {
            const isComplete = completion[step.key];
            const Icon = step.icon;

            return (
              <Link key={step.key} href={step.href} className="group">
                <div
                  className={`relative rounded-lg border p-4 transition-all ${
                    isComplete
                      ? "border-green-200 bg-green-50"
                      : "border-border bg-background hover:border-primary/30 hover:shadow-sm"
                  }`}
                >
                  {/* Step number */}
                  <div className="mb-3 flex items-center gap-2">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                        isComplete
                          ? "bg-green-500 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isComplete ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <Icon
                      className={`h-4 w-4 ${
                        isComplete
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }`}
                    />
                  </div>

                  <h4
                    className={`text-sm font-semibold ${
                      isComplete ? "text-green-700" : ""
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {step.description}
                  </p>

                  {!isComplete && (
                    <span className="mt-2 inline-block text-xs font-medium text-primary">
                      Get started &rarr;
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
