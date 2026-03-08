import { db } from "@/lib/db";
import { usageEvents, subscriptions } from "@/lib/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";

function getStartOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function getMonthlyUsage(
  organizationId: string,
  eventType: "post_generated" | "ai_caption" | "template_created"
): Promise<number> {
  const startOfMonth = getStartOfMonth();

  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(usageEvents)
    .where(
      and(
        eq(usageEvents.organizationId, organizationId),
        eq(usageEvents.eventType, eventType),
        gte(usageEvents.createdAt, startOfMonth)
      )
    );

  return result[0]?.count ?? 0;
}

export async function checkUsageLimit(
  organizationId: string,
  eventType: "post_generated" | "ai_caption"
): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
}> {
  const [usage, sub] = await Promise.all([
    getMonthlyUsage(organizationId, eventType),
    db.query.subscriptions.findFirst({
      where: eq(subscriptions.organizationId, organizationId),
    }),
  ]);

  const limit =
    eventType === "post_generated"
      ? (sub?.monthlyPostLimit ?? 3)
      : (sub?.monthlyCaptionLimit ?? 5);

  return {
    allowed: usage < limit,
    current: usage,
    limit,
    remaining: Math.max(0, limit - usage),
  };
}
