import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { organizations, reviewRequests } from "@/lib/db/schema";
import { handleApiError, AppError, ErrorCode } from "@/lib/errors";
import { checkRateLimit, apiLimiter } from "@/lib/rate-limit";

const reviewRequestSchema = z.object({
  postId: z.string().optional(),
  clientName: z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal("")),
  reviewPlatform: z.string().min(1),
  reviewUrl: z.string().url(),
});

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();

    if (!clerkUserId || !clerkOrgId) {
      throw new AppError("Unauthorized", ErrorCode.UNAUTHORIZED);
    }

    await checkRateLimit(apiLimiter, clerkUserId);

    const body = await req.json();
    const data = reviewRequestSchema.parse(body);

    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.clerkOrgId, clerkOrgId))
      .limit(1);

    if (!org) {
      throw new AppError("Organization not found", ErrorCode.NOT_FOUND);
    }

    const [request] = await db
      .insert(reviewRequests)
      .values({
        organizationId: org.id,
        postId: data.postId ?? null,
        clientName: data.clientName ?? null,
        clientEmail: data.clientEmail || null,
        reviewPlatform: data.reviewPlatform,
        reviewUrl: data.reviewUrl,
        status: "pending",
      })
      .returning();

    return NextResponse.json({ reviewRequest: request }, { status: 201 });
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
