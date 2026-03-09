import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { organizations, users, activityLog } from "@/lib/db/schema";
import { bulkDeletePosts } from "@/lib/db/queries/posts";
import { handleApiError, AppError, ErrorCode } from "@/lib/errors";

const bulkDeleteSchema = z.object({
  postIds: z.array(z.string()).min(1).max(50),
});

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();

    if (!clerkUserId || !clerkOrgId) {
      throw new AppError("Unauthorized", ErrorCode.UNAUTHORIZED);
    }

    const body = await req.json();
    const { postIds } = bulkDeleteSchema.parse(body);

    // Resolve internal org ID
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.clerkOrgId, clerkOrgId))
      .limit(1);

    if (!org) {
      throw new AppError("Organization not found", ErrorCode.NOT_FOUND);
    }

    // Delete posts (query enforces org ownership)
    await bulkDeletePosts(org.id, postIds);

    // Log activity
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId))
      .limit(1);

    if (user) {
      await db.insert(activityLog).values({
        organizationId: org.id,
        userId: user.id,
        type: "post_deleted",
        description: `Bulk deleted ${postIds.length} post${postIds.length !== 1 ? "s" : ""}`,
      });
    }

    return NextResponse.json({ success: true, deleted: postIds.length });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            message: "Validation error",
            code: "VALIDATION_ERROR",
            details: error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }
    return handleApiError(error);
  }
}
