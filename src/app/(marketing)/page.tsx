import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Bell,
  Building2,
  Home,
  Shield,
  TrendingUp,
  Sparkles,
  Car,
  Wrench,
  HeartPulse,
} from "lucide-react";

const steps = [
  {
    number: "1",
    title: "Set Your Brand",
    description:
      "Upload your logo, pick your colors, and add your contact details. Takes 2 minutes.",
    icon: Palette,
  },
  {
    number: "2",
    title: "Fill in the Details",
    description:
      "Choose a category, add the client or milestone info, and pick your template.",
    icon: Zap,
  },
  {
    number: "3",
    title: "Share Everywhere",
    description:
      "Download your branded post for Instagram, LinkedIn, Facebook, and more.",
    icon: Share2,
  },
];

const examplePosts = [
  {
    title: "Just Financed!",
    headline: "John & Sarah Smith — $750,000 Home Loan",
    category: "Business Win",
    icon: Trophy,
    color: "bg-amber-100 text-amber-700",
  },
  {
    title: "Just Thanked!",
    headline: "Maria Garcia — Home Loan Refinance",
    category: "Thank You",
    icon: Heart,
    color: "bg-pink-100 text-pink-700",
  },
  {
    title: "Just Reviewed!",
    headline: "5 Stars from Chris Taylor on Google",
    category: "Review Highlight",
    icon: Star,
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    title: "Just Reached!",
    headline: "500 Loans Settled — $100M Milestone",
    category: "Business Milestone",
    icon: Flag,
    color: "bg-green-100 text-green-700",
  },
  {
    title: "Just Recognised!",
    headline: "Alex Johnson — 50 Deals This Quarter",
    category: "Shout Out",
    icon: Megaphone,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Just Introducing!",
    headline: "Meet Sam Nguyen — Senior Mortgage Broker",
    category: "Team Spotlight",
    icon: Users,
    color: "bg-purple-100 text-purple-700",
  },
];

const industries = [
  { name: "Mortgage Brokers", icon: Building2 },
  { name: "Real Estate", icon: Home },
  { name: "Insurance", icon: Shield },
  { name: "Financial Planning", icon: TrendingUp },
  { name: "Cleaning Services", icon: Sparkles },
  { name: "Automotive", icon: Car },
  { name: "Trades", icon: Wrench },
  { name: "Health & Wellness", icon: HeartPulse },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Generate Branded Celebration Posts in{" "}
              <span className="text-primary">30 Seconds</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              WinShare helps service businesses create professional, on-brand
              social media posts to celebrate wins, thank clients, and build
              trust. Works for mortgage brokers, real estate agents, tradespeople,
              and more.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/sign-up">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/templates">See Examples</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Free plan includes 3 posts per month. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              How It Works
            </h2>
            <p className="mt-3 text-muted-foreground">
              Three simple steps to go from win to post.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="relative text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <step.icon className="h-7 w-7" />
                </div>
                <div className="mb-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Posts */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Posts That Get Noticed
            </h2>
            <p className="mt-3 text-muted-foreground">
              See the types of celebration posts you can create with WinShare.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {examplePosts.map((post) => (
              <Card
                key={post.title}
                className="transition-shadow hover:shadow-md"
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${post.color}`}
                    >
                      <post.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{post.title}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {post.category}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm font-medium">{post.headline}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Trusted by 500+ Businesses
          </h2>
          <p className="mt-3 text-muted-foreground">
            Service businesses across Australia use WinShare to celebrate their
            wins on social media.
          </p>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div>
              <p className="text-4xl font-bold text-primary">10,000+</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Posts Generated
              </p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">500+</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Active Businesses
              </p>
            </div>
            <div>
              <p className="text-4xl font-bold text-primary">30s</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Average Post Creation Time
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Built for Every Service Industry
            </h2>
            <p className="mt-3 text-muted-foreground">
              WinShare works for any business that wants to celebrate wins and
              build trust on social media.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {industries.map((industry) => (
              <div
                key={industry.name}
                className="flex flex-col items-center gap-3 rounded-lg border bg-card p-6 text-center transition-shadow hover:shadow-sm"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <industry.icon className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium">{industry.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t bg-primary py-20 text-primary-foreground">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight">
            Start Creating Free Today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Join hundreds of service businesses already using WinShare to
            celebrate their wins and grow their brand on social media.
          </p>
          <div className="mt-8">
            <Button
              size="lg"
              variant="secondary"
              asChild
            >
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
