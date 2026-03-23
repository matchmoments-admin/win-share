import Link from "next/link";
import { redirect } from "next/navigation";
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
    title: "Create post",
    description: "Generate a branded social media post in seconds.",
    href: "/create",
    icon: PlusCircle,
  },
  {
    title: "Brand settings",
    description: "Set up your logo, colours, and contact info.",
    href: "/brand",
    icon: Building2,
  },
  {
    title: "View posts",
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
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <div className="text-center">
          <h2 className="text-lg font-semibold">
            Setting up your workspace
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your organization is being synced. This usually takes a few seconds.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            <a href="/dashboard" className="underline transition-colors hover:text-foreground">
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
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Welcome section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create branded social media posts to celebrate wins and grow your
          business.
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
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">
          Quick actions
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex items-start gap-4 rounded-lg border border-border/60 p-4 transition-all duration-200 hover:border-border hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            >
              <action.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
              <div>
                <p className="text-sm font-medium">{action.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <RecentActivity activities={activities} />
    </div>
  );
}
