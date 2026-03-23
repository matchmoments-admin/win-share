import Link from "next/link";
import { CATEGORIES } from "@/lib/templates/categories";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Heart,
  Megaphone,
  Users,
  Star,
  Flag,
  Bell,
  ArrowRight,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Templates — WinShare",
  description:
    "Browse our library of celebration post templates for every occasion. Business wins, thank yous, reviews, milestones, and more.",
};

const iconMap: Record<string, React.ElementType> = {
  Trophy,
  Heart,
  Megaphone,
  Users,
  Star,
  Flag,
  Bell,
};

const categoryAccents: Record<string, string> = {
  business_win: "bg-amber-50 text-amber-800",
  thank_you: "bg-rose-50 text-rose-800",
  shout_out: "bg-sky-50 text-sky-800",
  team_people: "bg-violet-50 text-violet-800",
  review_highlight: "bg-yellow-50 text-yellow-800",
  business_milestone: "bg-emerald-50 text-emerald-800",
  announcement: "bg-blue-50 text-blue-800",
};

export default function TemplatesPage() {
  const categories = Object.values(CATEGORIES);

  return (
    <div>
      {/* Header */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Template gallery
            </h1>
            <p className="mt-4 text-base text-muted-foreground">
              Browse professionally designed templates for every type of
              celebration post. Pick a category to get started.
            </p>
          </div>
        </div>
      </section>

      {/* Template Grid */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_1fr]">
            {categories.map((category) => {
              const Icon = iconMap[category.icon] ?? Trophy;
              const accentClass =
                categoryAccents[category.id] ?? "bg-muted text-muted-foreground";
              const slug = category.id.replace(/_/g, "-");

              return (
                <Link
                  key={category.id}
                  href={`/templates/${slug}`}
                  className="group flex flex-col rounded-lg border border-border/60 p-6 transition-all duration-200 hover:border-border hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${accentClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="mt-4 text-base font-medium">{category.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {category.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {category.actionVerbs.slice(0, 4).map((verb) => (
                      <span
                        key={verb}
                        className="rounded-md border border-border/60 px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        Just {verb}
                      </span>
                    ))}
                  </div>

                  <span className="mt-auto pt-4 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                    Use template &rarr;
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-border/60 bg-card px-8 py-16 text-center sm:px-16">
            <h2 className="text-2xl font-bold tracking-tight text-balance">
              Ready to create your first post?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Sign up for free and start generating branded celebration posts in
              seconds.
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
