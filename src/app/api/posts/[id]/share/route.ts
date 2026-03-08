import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { organizations, users, activityLog, generatedPosts } from "@/lib/db/schema";
import { incrementPostShareCount } from "@/lib/db/queries/posts";
import { handleApiError, AppError, ErrorCode } from "@/lib/errors";

const shareSchema = z.object({
  platform: z.enum(["instagram_feed", "instagram_story", "linkedin", "facebook", "twitter"]),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();

    if (!clerkUserId || !clerkOrgId) {
      throw new AppError("Unauthorized", ErrorCode.UNAUTHORIZED);
    }

    const body = await req.json();
    const { platform } = shareSchema.parse(body);

    // Resolve internal IDs
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.clerkOrgId, clerkOrgId))
      .limit(1);

    if (!org) {
      throw new AppError("Organization not found", ErrorCode.NOT_FOUND);
    }

    // Verify post belongs to this organization
    const post = await db.query.generatedPosts.findFirst({
      where: eq(generatedPosts.id, postId),
    });

    if (!post || post.organizationId !== org.id) {
      throw new AppError("Post not found", ErrorCode.NOT_FOUND);
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId))
      .limit(1);

    // Increment share count
    await incrementPostShareCount(postId);

    // Log activity
    if (user) {
      await db.insert(activityLog).values({
        organizationId: org.id,
        userId: user.id,
        type: "post_shared",
        resourceId: postId,
        description: `Shared post on ${platform}`,
      });
    }

    return NextResponse.json({ success: true });
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
