import { db } from "@/lib/db";
import { generatedPosts } from "@/lib/db/schema";
import { eq, and, gte, desc, sql } from "drizzle-orm";

function getStartOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function getAnalyticsData(organizationId: string) {
  const startOfMonth = getStartOfMonth();

  const [totals, thisMonth, topPosts, categoryBreakdown] = await Promise.all([
    // Total aggregate stats
    db
      .select({
        totalPosts: sql<number>`count(*)::int`,
        totalViews: sql<number>`coalesce(sum(${generatedPosts.viewCount}), 0)::int`,
        totalShares: sql<number>`coalesce(sum(${generatedPosts.shareCount}), 0)::int`,
        totalDownloads: sql<number>`coalesce(sum(${generatedPosts.downloadCount}), 0)::int`,
      })
      .from(generatedPosts)
      .where(eq(generatedPosts.organizationId, organizationId))
      .then((r) => r[0]),

    // This month stats
    db
      .select({
        postsThisMonth: sql<number>`count(*)::int`,
        viewsThisMonth: sql<number>`coalesce(sum(${generatedPosts.viewCount}), 0)::int`,
        sharesThisMonth: sql<number>`coalesce(sum(${generatedPosts.shareCount}), 0)::int`,
        downloadsThisMonth: sql<number>`coalesce(sum(${generatedPosts.downloadCount}), 0)::int`,
      })
      .from(generatedPosts)
      .where(
        and(
          eq(generatedPosts.organizationId, organizationId),
          gte(generatedPosts.createdAt, startOfMonth)
        )
      )
      .then((r) => r[0]),

    // Top 5 posts by engagement (views + shares)
    db.query.generatedPosts.findMany({
      where: eq(generatedPosts.organizationId, organizationId),
      orderBy: [
        desc(
          sql`${generatedPosts.viewCount} + ${generatedPosts.shareCount} + ${generatedPosts.downloadCount}`
        ),
      ],
      limit: 5,
    }),

    // Category breakdown
    db
      .select({
        category: generatedPosts.category,
        count: sql<number>`count(*)::int`,
        views: sql<number>`coalesce(sum(${generatedPosts.viewCount}), 0)::int`,
        shares: sql<number>`coalesce(sum(${generatedPosts.shareCount}), 0)::int`,
      })
      .from(generatedPosts)
      .where(eq(generatedPosts.organizationId, organizationId))
      .groupBy(generatedPosts.category)
      .orderBy(desc(sql`count(*)`)),
  ]);

  return {
    totals: totals ?? {
      totalPosts: 0,
      totalViews: 0,
      totalShares: 0,
      totalDownloads: 0,
    },
    thisMonth: thisMonth ?? {
      postsThisMonth: 0,
      viewsThisMonth: 0,
      sharesThisMonth: 0,
      downloadsThisMonth: 0,
    },
    topPosts,
    categoryBreakdown,
  };
}
