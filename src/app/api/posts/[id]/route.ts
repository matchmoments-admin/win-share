import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { organizations, users, activityLog, generatedPosts } from "@/lib/db/schema";
import { deletePost } from "@/lib/db/queries/posts";
import { handleApiError, AppError, ErrorCode } from "@/lib/errors";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();

    if (!clerkUserId || !clerkOrgId) {
      throw new AppError("Unauthorized", ErrorCode.UNAUTHORIZED);
    }

    // Resolve internal org ID
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

    // Delete the post
    await deletePost(postId);

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
        resourceId: postId,
        description: `Deleted post: Just ${post.actionVerb}! — ${post.headline}`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
