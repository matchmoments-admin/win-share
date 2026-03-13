import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, Building2, Image, Loader2 } from "lucide-react";
import { getCurrentOrgSafe } from "@/lib/auth";
import {
  getDashboardStats,
  getRecentActivity,
  getOnboardingStatus,
} from "@/lib/db/queries/dashboard";
import { StatsBar } from "@/components/dashboard/stats-bar";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { OnboardingWizard } from "@/components/dashboard/onboarding-wizard";
import { OrganizationSwitcher } from "@clerk/nextjs";

const quickActions = [
  {
    title: "Create Post",
    description: "Generate a branded social media post in seconds.",
    href: "/create",
    icon: PlusCircle,
  },
  {
    title: "Brand Settings",
    description: "Set up your logo, colors, and contact info.",
    href: "/brand",
    icon: Building2,
  },
  {
    title: "View Posts",
    description: "Browse and manage all your generated posts.",
    href: "/posts",
    icon: Image,
  },
];

export default async function DashboardPage() {
  const result = await getCurrentOrgSafe();

  // Not signed in
  if (!result) {
    redirect("/sign-in");
  }

  // User has no org selected in Clerk — let them pick/create one
  if (result.reason === "no-org") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome to WinShare
          </h2>
          <p className="mt-2 text-muted-foreground">
            Create or select an organization to get started.
          </p>
        </div>
        <OrganizationSwitcher
          hidePersonal
          afterSelectOrganizationUrl="/dashboard"
          afterCreateOrganizationUrl="/dashboard"
        />
      </div>
    );
  }

  // Org exists in Clerk but hasn't synced to DB yet (webhook race condition)
  if (result.reason === "not-synced") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="text-center">
          <h2 className="text-xl font-semibold">
            Setting up your workspace...
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your organization is being synced. This usually takes a few seconds.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            <a href="/dashboard" className="text-primary underline">
              Refresh this page
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Happy path — org is fully synced
  const { orgId } = result;

  const [stats, activities, onboarding] = await Promise.all([
    getDashboardStats(orgId),
    getRecentActivity(orgId),
    getOnboardingStatus(orgId),
  ]);

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome to WinShare
        </h2>
        <p className="mt-1 text-muted-foreground">
          Create beautiful, branded social media posts to celebrate your wins
          and grow your business.
        </p>
      </div>

      {/* Onboarding wizard for new users */}
      {!onboarding.isComplete && (
        <OnboardingWizard
          hasBrand={onboarding.hasBrand}
          hasPost={onboarding.hasPost}
          hasShared={onboarding.hasShared}
        />
      )}

      {/* Stats Bar */}
      <StatsBar stats={stats} />

      {/* Quick actions */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} className="group">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                    <action.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm font-medium text-primary">
                    Get started &rarr;
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <RecentActivity activities={activities} />
    </div>
  );
}
