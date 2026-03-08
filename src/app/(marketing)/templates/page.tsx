import Link from "next/link";
import { CATEGORIES } from "@/lib/templates/categories";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const categoryColors: Record<string, string> = {
  business_win: "bg-amber-100 text-amber-700",
  thank_you: "bg-pink-100 text-pink-700",
  shout_out: "bg-blue-100 text-blue-700",
  team_people: "bg-purple-100 text-purple-700",
  review_highlight: "bg-yellow-100 text-yellow-700",
  business_milestone: "bg-green-100 text-green-700",
  announcement: "bg-sky-100 text-sky-700",
};

export default function TemplatesPage() {
  const categories = Object.values(CATEGORIES);

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-b from-primary/5 via-background to-background py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Template Gallery
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Browse our library of professionally designed templates for every
            type of celebration post. Pick a category to get started.
          </p>
        </div>
      </section>

      {/* Template Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon = iconMap[category.icon] ?? Trophy;
              const colorClass =
                categoryColors[category.id] ?? "bg-gray-100 text-gray-700";
              const slug = category.id.replace(/_/g, "-");

              return (
                <Card
                  key={category.id}
                  className="group flex flex-col transition-shadow hover:shadow-md"
                >
                  {/* Thumbnail Placeholder */}
                  <div className="relative overflow-hidden rounded-t-xl bg-muted">
                    <div className="flex aspect-[16/10] items-center justify-center">
                      <div
                        className={`flex h-20 w-20 items-center justify-center rounded-2xl ${colorClass} transition-transform group-hover:scale-110`}
                      >
                        <Icon className="h-10 w-10" />
                      </div>
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <div className="flex flex-wrap gap-1.5">
                      {category.actionVerbs.map((verb) => (
                        <span
                          key={verb}
                          className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                        >
                          Just {verb}!
                        </span>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Button className="w-full" asChild>
                      <Link href={`/templates/${slug}`}>
                        Use This Template
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

      {/* CTA */}
      <section className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight">
            Ready to create your first post?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Sign up for free and start generating branded celebration posts in
            seconds.
          </p>
          <div className="mt-6">
            <Button size="lg" asChild>
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
