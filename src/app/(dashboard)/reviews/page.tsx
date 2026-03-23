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
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Review requests</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate review request links and QR codes to collect client reviews.
        </p>
      </div>

      <ReviewRequestForm />

      <div className="border-t pt-8">
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">
          Recent requests
        </h3>
        <ReviewList requests={requests} />
      </div>
    </div>
  );
}
