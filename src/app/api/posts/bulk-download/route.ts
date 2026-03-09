import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq, and, inArray } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { organizations, generatedPosts } from "@/lib/db/schema";
import { handleApiError, AppError, ErrorCode } from "@/lib/errors";

const bulkDownloadSchema = z.object({
  postIds: z.array(z.string()).min(1).max(50),
});

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();

    if (!clerkUserId || !clerkOrgId) {
      throw new AppError("Unauthorized", ErrorCode.UNAUTHORIZED);
    }

    const body = await req.json();
    const { postIds } = bulkDownloadSchema.parse(body);

    // Resolve internal org ID
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.clerkOrgId, clerkOrgId))
      .limit(1);

    if (!org) {
      throw new AppError("Organization not found", ErrorCode.NOT_FOUND);
    }

    // Verify all posts belong to this org and get their images
    const posts = await db.query.generatedPosts.findMany({
      where: and(
        eq(generatedPosts.organizationId, org.id),
        inArray(generatedPosts.id, postIds)
      ),
      with: { images: true },
    });

    // Collect all image URLs (prefer CDN URL, fall back to image URL)
    const urls: string[] = [];
    for (const post of posts) {
      for (const image of post.images) {
        const url = image.cdnUrl ?? image.imageUrl;
        if (url) urls.push(url);
      }
    }

    return NextResponse.json({ urls });
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
