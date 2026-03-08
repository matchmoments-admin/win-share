import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviewRequests } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ReviewRequestForm } from "@/components/reviews/review-request-form";
import { ReviewList } from "@/components/reviews/review-list";

export default async function ReviewsPage() {
  const { orgId } = await requireAuth();

  const requests = await db
    .select()
    .from(reviewRequests)
    .where(eq(reviewRequests.organizationId, orgId))
    .orderBy(desc(reviewRequests.createdAt));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Review Requests</h1>
        <p className="text-muted-foreground">
          Generate review request links and QR codes to collect client reviews.
        </p>
      </div>

      <ReviewRequestForm />

      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Requests</h2>
        <ReviewList requests={requests} />
      </div>
    </div>
  );
}
