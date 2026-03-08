import { db } from "@/lib/db";
import { usageEvents } from "@/lib/db/schema";

type EventType = "post_generated" | "ai_caption" | "template_created";

export async function trackUsageEvent(
  organizationId: string,
  userId: string,
  eventType: EventType,
  resourceId?: string,
  metadata?: Record<string, unknown>
) {
  await db.insert(usageEvents).values({
    organizationId,
    userId,
    eventType,
    resourceId: resourceId ?? null,
    metadata: metadata ?? null,
  });
}
