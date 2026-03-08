import { db } from "@/lib/db";
import { webhookEvents } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

/**
 * Check whether a webhook event has already been processed.
 * If it has not, insert a record so subsequent deliveries are skipped.
 *
 * Uses the composite unique index (source, event_id) on the
 * webhook_events table to guarantee at-most-once processing.
 */
export async function checkAndMarkProcessed(
  source: "clerk" | "stripe",
  eventId: string,
  eventType: string
): Promise<{ alreadyProcessed: boolean }> {
  // Check if the event has already been recorded
  const existing = await db
    .select({ id: webhookEvents.id })
    .from(webhookEvents)
    .where(
      and(eq(webhookEvents.source, source), eq(webhookEvents.eventId, eventId))
    )
    .limit(1);

  if (existing.length > 0) {
    return { alreadyProcessed: true };
  }

  // Mark this event as processed
  await db.insert(webhookEvents).values({
    source,
    eventId,
    eventType,
    processedAt: new Date(),
  });

  return { alreadyProcessed: false };
}
