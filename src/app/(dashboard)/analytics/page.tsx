import { requireAuth } from "@/lib/auth";
import { getAnalyticsData } from "@/lib/db/queries/analytics";
import { StatsOverview } from "@/components/analytics/stats-overview";
import { TopPostsTable } from "@/components/analytics/top-posts-table";
import { CategoryBreakdown } from "@/components/analytics/category-breakdown";

export const metadata = {
  title: "Analytics",
  description: "View your post performance and engagement metrics",
};

export default async function AnalyticsPage() {
  const { orgId } = await requireAuth();
  const { totals, thisMonth, topPosts, categoryBreakdown } =
    await getAnalyticsData(orgId);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
        <p className="mt-1 text-muted-foreground">
          Track your post performance, engagement, and content trends.
        </p>
      </div>

      <StatsOverview totals={totals} thisMonth={thisMonth} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TopPostsTable posts={topPosts} />
        <CategoryBreakdown data={categoryBreakdown} />
      </div>
    </div>
  );
}
