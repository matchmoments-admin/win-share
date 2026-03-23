import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Zap,
  Palette,
  Share2,
  Trophy,
  Heart,
  Star,
  Megaphone,
  Users,
  Flag,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Set your brand",
    description:
      "Upload your logo, pick your colours, and add your contact details. Takes two minutes.",
    icon: Palette,
  },
  {
    number: "02",
    title: "Fill in the details",
    description:
      "Choose a category, add the client or milestone info, and pick your template.",
    icon: Zap,
  },
  {
    number: "03",
    title: "Share everywhere",
    description:
      "Download your branded post for Instagram, LinkedIn, Facebook, and more.",
    icon: Share2,
  },
];

const examplePosts = [
  {
    title: "Just Financed",
    headline: "Priya & Raj Mehta — $685,000 home loan",
    category: "Business Win",
    icon: Trophy,
    accent: "bg-amber-50 text-amber-800",
  },
  {
    title: "Just Thanked",
    headline: "Maria Gonzalez — home loan refinance",
    category: "Thank You",
    icon: Heart,
    accent: "bg-rose-50 text-rose-800",
  },
  {
    title: "Just Reviewed",
    headline: "5 stars from Liam O'Brien on Google",
    category: "Review Highlight",
    icon: Star,
    accent: "bg-yellow-50 text-yellow-800",
  },
  {
    title: "Just Reached",
    headline: "472 loans settled — $87M milestone",
    category: "Business Milestone",
    icon: Flag,
    accent: "bg-emerald-50 text-emerald-800",
  },
  {
    title: "Just Recognised",
    headline: "Tanya Nguyen — 43 deals this quarter",
    category: "Shout Out",
    icon: Megaphone,
    accent: "bg-sky-50 text-sky-800",
  },
  {
    title: "Introducing",
    headline: "Meet Daniel Abara — senior mortgage broker",
    category: "Team Spotlight",
    icon: Users,
    accent: "bg-violet-50 text-violet-800",
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section — left-aligned, asymmetric */}
      <section className="py-24 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
              For service businesses
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl lg:leading-[1.08]">
              Branded celebration posts in 30 seconds
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
              WinShare helps mortgage brokers, real estate agents, tradespeople,
              and other service businesses create professional social media posts
              to celebrate wins, thank clients, and build trust.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild className="rounded-md">
                <Link href="/sign-up">
                  Get started free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="rounded-md">
                <Link href="/templates">See examples</Link>
              </Button>
            </div>
            <p className="mt-5 text-sm text-muted-foreground">
              Free plan includes 3 posts per month. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* How it works — left-aligned steps */}
      <section className="border-t py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg">
            <h2 className="text-3xl font-bold tracking-tight text-balance">
              How it works
            </h2>
            <p className="mt-3 text-muted-foreground">
              Three steps from win to post.
            </p>
          </div>

          <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
            {steps.map((step) => (
              <div key={step.number}>
                <span className="font-mono text-sm text-muted-foreground">
                  {step.number}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example posts — 2-col asymmetric grid */}
      <section className="border-t py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg">
            <h2 className="text-3xl font-bold tracking-tight text-balance">
              Posts that get noticed
            </h2>
            <p className="mt-3 text-muted-foreground">
              The types of celebration posts you can create with WinShare.
            </p>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr]">
            {examplePosts.map((post, i) => (
              <div
                key={post.title}
                className={`group flex items-start gap-4 rounded-lg border border-border/60 p-5 transition-all duration-200 hover:border-border hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] ${
                  i === 0 || i === 3 ? "lg:col-span-1" : ""
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${post.accent}`}
                >
                  <post.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium">{post.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {post.category}
                  </p>
                  <p className="mt-2.5 text-sm text-muted-foreground">
                    {post.headline}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof — large typography, no cards */}
      <section className="border-t py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 text-center sm:grid-cols-3 sm:text-left">
            <div>
              <p className="font-mono text-5xl font-bold tracking-tight tabular-nums">
                12,400+
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Posts generated
              </p>
            </div>
            <div>
              <p className="font-mono text-5xl font-bold tracking-tight tabular-nums">
                530+
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Active businesses
              </p>
            </div>
            <div>
              <p className="font-mono text-5xl font-bold tracking-tight tabular-nums">
                &lt;30s
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Average creation time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Industries — minimal, no card borders */}
      <section className="border-t py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg">
            <h2 className="text-3xl font-bold tracking-tight text-balance">
              Built for every service industry
            </h2>
            <p className="mt-3 text-muted-foreground">
              Works for any business that celebrates wins and builds trust on
              social media.
            </p>
          </div>

          <div className="mt-12 flex flex-wrap gap-3">
            {[
              "Mortgage brokers",
              "Real estate",
              "Insurance",
              "Financial planning",
              "Cleaning services",
              "Automotive",
              "Trades",
              "Health & wellness",
            ].map((name) => (
              <span
                key={name}
                className="rounded-md border border-border/60 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:border-border hover:text-foreground"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA — warm, not jarring */}
      <section className="border-t py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl bg-card border border-border/60 px-8 py-16 text-center sm:px-16">
            <h2 className="text-3xl font-bold tracking-tight text-balance">
              Start celebrating your wins today
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Join hundreds of service businesses already using WinShare to grow
              their brand on social media.
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
