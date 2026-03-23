import Link from "next/link";
import { Building2, PlusCircle, Share2, Check } from "lucide-react";

interface OnboardingWizardProps {
  hasBrand: boolean;
  hasPost: boolean;
  hasShared: boolean;
}

const steps = [
  {
    key: "brand" as const,
    title: "Set up your brand",
    description: "Add your company name, logo, and brand colours to personalise every post.",
    href: "/brand",
    icon: Building2,
  },
  {
    key: "post" as const,
    title: "Create your first post",
    description: "Generate a branded social media post to celebrate a win or share news.",
    href: "/create",
    icon: PlusCircle,
  },
  {
    key: "share" as const,
    title: "Share with the world",
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
    <div className="rounded-lg border border-border/60 p-6">
      <div className="mb-5">
        <h3 className="text-sm font-medium">Get started with WinShare</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Complete {3 - completedCount} step{3 - completedCount !== 1 ? "s" : ""} to get the most out of WinShare.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {steps.map((step, index) => {
          const isComplete = completion[step.key];

          return (
            <Link key={step.key} href={step.href} className="group">
              <div
                className={`rounded-lg border p-4 transition-all duration-200 ${
                  isComplete
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-border/60 hover:border-border hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                }`}
              >
                <div className="mb-3 flex items-center gap-2">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-medium ${
                      isComplete
                        ? "bg-emerald-600 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isComplete ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                </div>

                <h4 className="text-sm font-medium">
                  {step.title}
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {step.description}
                </p>

                {!isComplete && (
                  <span className="mt-3 inline-block text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                    Get started &rarr;
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
