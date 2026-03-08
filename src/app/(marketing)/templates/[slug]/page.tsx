import { notFound } from "next/navigation";
import Link from "next/link";
import { CATEGORIES, type ContentCategory } from "@/lib/templates/categories";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Trophy,
  Heart,
  Megaphone,
  Users,
  Star,
  Flag,
  Bell,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import type { Metadata } from "next";

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

function slugToId(slug: string): string {
  return slug.replace(/-/g, "_");
}

function getCategory(slug: string): ContentCategory | null {
  const id = slugToId(slug);
  return (CATEGORIES as Record<string, ContentCategory>)[id] ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) {
    return { title: "Template Not Found — WinShare" };
  }
  return {
    title: `${category.name} Templates — WinShare`,
    description: category.description,
  };
}

export function generateStaticParams() {
  return Object.keys(CATEGORIES).map((id) => ({
    slug: id.replace(/_/g, "-"),
  }));
}

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategory(slug);

  if (!category) {
    notFound();
  }

  const Icon = iconMap[category.icon] ?? Trophy;
  const colorClass =
    categoryColors[category.id] ?? "bg-gray-100 text-gray-700";

  // Build example posts for this category
  const examplePosts = category.actionVerbs.map((verb) => ({
    verb,
    title: `Just ${verb}!`,
    description: getExampleDescription(category.id, verb),
  }));

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 via-background to-background py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/templates">
                <ArrowLeft className="mr-2 h-4 w-4" />
                All Templates
              </Link>
            </Button>
          </div>

          <div className="flex flex-col items-start gap-8 md:flex-row md:items-center">
            <div
              className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl ${colorClass}`}
            >
              <Icon className="h-12 w-12" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {category.name} Templates
              </h1>
              <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
                {category.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {category.actionVerbs.map((verb) => (
                  <Badge key={verb} variant="secondary">
                    Just {verb}!
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You Can Create */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight">
            Example Posts
          </h2>
          <p className="mt-2 text-muted-foreground">
            Here are some examples of posts you can create with the{" "}
            {category.name} template.
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {examplePosts.map((post) => (
              <Card key={post.verb} className="transition-shadow hover:shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${colorClass}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base">{post.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm">{post.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator className="mx-auto max-w-7xl" />

      {/* Template Fields */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight">
            What You Will Need
          </h2>
          <p className="mt-2 text-muted-foreground">
            Fill in these details to generate your branded {category.name.toLowerCase()}{" "}
            post.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {category.fields.map((field) => (
              <div
                key={field.name}
                className="flex items-start gap-3 rounded-lg border p-4"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                <div>
                  <p className="font-medium">{field.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {field.placeholder}
                  </p>
                  {field.required && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      Required
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight">
            Start Using This Template &mdash; Free
          </h2>
          <p className="mt-3 text-primary-foreground/80">
            Sign up for a free account and create your first {category.name.toLowerCase()}{" "}
            post in under 30 seconds.
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

// Helper to generate example descriptions for each category/verb combination
function getExampleDescription(categoryId: string, verb: string): string {
  const examples: Record<string, Record<string, string>> = {
    business_win: {
      Financed: "John & Sarah Smith — $750,000 Home Loan with Commonwealth Bank",
      Settled: "The Martinez Family — Dream home at 42 Harbour St, Sydney",
      Approved: "Pre-approval for $1.2M — First home buyer package",
      Funded: "Commercial property loan — $2.5M for ABC Holdings",
    },
    thank_you: {
      Thanked: "Maria Garcia — Thank you for trusting us with your refinance journey",
      Appreciated: "A huge thank you to the Thompson family for their kind words",
      Grateful: "Grateful for 5 years of partnership with Sunrise Real Estate",
      Celebrated: "Celebrating our amazing clients who make this work so rewarding",
    },
    shout_out: {
      Recognised: "Alex Johnson — 50 deals closed this quarter, an incredible effort!",
      Celebrated: "Our partnership with Coastal Realty hits 100 referrals",
      Acknowledged: "Acknowledging the hard work of our admin team this month",
      Honoured: "Honoured to receive the Best Broker Award 2026",
    },
    team_people: {
      Introducing: "Meet Sam Nguyen — Senior Mortgage Broker with 10 years of experience",
      Spotlighting: "Spotlighting Jane Park — Our newest team member in the Sydney office",
      Featuring: "Featuring our Customer Success team who go above and beyond",
      Meet: "Meet the team behind your home loan journey",
    },
    review_highlight: {
      Reviewed: "5-star Google review from Chris Taylor — 'Absolutely fantastic service'",
      Rated: "Another 5-star rating on Trustpilot — Thank you!",
      Recommended: "Recommended by 98% of our clients on ProductReview",
      Endorsed: "Endorsed by the Property Investment Network",
    },
    business_milestone: {
      Reached: "500 loans settled — $100M in total settlements",
      Achieved: "Best Mortgage Broker of the Year 2026",
      Celebrated: "Celebrating 10 years in business this month",
      Surpassed: "Surpassed $200M in funded loans this financial year",
    },
    announcement: {
      Announcing: "We're expanding to Melbourne — New office opening March 2026",
      Launching: "Launching our new first home buyer program with special rates",
      Introducing: "Introducing Saturday appointments for busy families",
      Unveiling: "Unveiling our refreshed brand — Same great service, new look",
    },
  };

  return (
    examples[categoryId]?.[verb] ??
    `Example ${verb.toLowerCase()} post for your business`
  );
}
