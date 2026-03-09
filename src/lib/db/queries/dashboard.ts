import { db } from "@/lib/db";
import {
  generatedPosts,
  reviewRequests,
  activityLog,
  users,
  brandSettings,
} from "@/lib/db/schema";
import { eq, and, gte, desc, sql } from "drizzle-orm";
import { getMonthlyUsage } from "@/lib/usage/check";

function getStartOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function getDashboardStats(organizationId: string) {
  const startOfMonth = getStartOfMonth();

  const [postsThisMonth, captionsThisMonth, reviewsThisMonth, engagement] =
    await Promise.all([
      getMonthlyUsage(organizationId, "post_generated"),
      getMonthlyUsage(organizationId, "ai_caption"),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(reviewRequests)
        .where(
          and(
            eq(reviewRequests.organizationId, organizationId),
            gte(reviewRequests.createdAt, startOfMonth)
          )
        )
        .then((r) => r[0]?.count ?? 0),
      db
        .select({
          views: sql<number>`coalesce(sum(${generatedPosts.viewCount}), 0)::int`,
          shares: sql<number>`coalesce(sum(${generatedPosts.shareCount}), 0)::int`,
          downloads: sql<number>`coalesce(sum(${generatedPosts.downloadCount}), 0)::int`,
        })
        .from(generatedPosts)
        .where(eq(generatedPosts.organizationId, organizationId))
        .then((r) => r[0] ?? { views: 0, shares: 0, downloads: 0 }),
    ]);

  return {
    postsThisMonth,
    captionsThisMonth,
    reviewsThisMonth,
    totalViews: engagement.views,
    totalShares: engagement.shares,
    totalDownloads: engagement.downloads,
  };
}

export async function getRecentActivity(
  organizationId: string,
  limit = 10
) {
  const activities = await db
    .select({
      id: activityLog.id,
      type: activityLog.type,
      description: activityLog.description,
      resourceId: activityLog.resourceId,
      createdAt: activityLog.createdAt,
      userFirstName: users.firstName,
      userLastName: users.lastName,
      userAvatarUrl: users.avatarUrl,
    })
    .from(activityLog)
    .leftJoin(users, eq(activityLog.userId, users.id))
    .where(eq(activityLog.organizationId, organizationId))
    .orderBy(desc(activityLog.createdAt))
    .limit(limit);

  return activities;
}

export async function getOnboardingStatus(organizationId: string) {
  const [brand, postCount, shareActivity] = await Promise.all([
    db.query.brandSettings.findFirst({
      where: eq(brandSettings.organizationId, organizationId),
    }),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(generatedPosts)
      .where(eq(generatedPosts.organizationId, organizationId))
      .then((r) => r[0]?.count ?? 0),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(activityLog)
      .where(
        and(
          eq(activityLog.organizationId, organizationId),
          eq(activityLog.type, "post_shared")
        )
      )
      .then((r) => r[0]?.count ?? 0),
  ]);

  const hasBrand = !!(brand?.companyName);
  const hasPost = postCount > 0;
  const hasShared = shareActivity > 0;

  return { hasBrand, hasPost, hasShared, isComplete: hasBrand && hasPost && hasShared };
}
