import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { organizations, users } from "@/lib/db/schema";
import { generateCaption } from "@/lib/ai";
import { checkUsageLimit } from "@/lib/usage/check";
import { trackUsageEvent } from "@/lib/usage/track";
import { handleApiError, AppError, ErrorCode } from "@/lib/errors";
import { checkRateLimit, captionLimiter } from "@/lib/rate-limit";

const captionSchema = z.object({
  platform: z.enum(["linkedin", "instagram", "facebook", "twitter"]),
  category: z.string().min(1),
  actionVerb: z.string().min(1),
  companyName: z.string().min(1),
  industry: z.string().min(1),
  headline: z.string().min(1),
  fieldValues: z.record(z.string(), z.string()).default({}),
});

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();

    if (!clerkUserId || !clerkOrgId) {
      throw new AppError("Unauthorized", ErrorCode.UNAUTHORIZED);
    }

    await checkRateLimit(captionLimiter, clerkUserId);

    const body = await req.json();
    const data = captionSchema.parse(body);

    // Resolve internal IDs
    const [org] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.clerkOrgId, clerkOrgId))
      .limit(1);

    if (!org) {
      throw new AppError("Organization not found", ErrorCode.NOT_FOUND);
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId))
      .limit(1);

    if (!user) {
      throw new AppError("User not found", ErrorCode.NOT_FOUND);
    }

    // Check usage limits
    const usageCheck = await checkUsageLimit(org.id, "ai_caption");
    if (!usageCheck.allowed) {
      throw new AppError(
        `Monthly AI caption limit reached (${usageCheck.limit}). Please upgrade your plan.`,
        ErrorCode.USAGE_LIMIT_EXCEEDED,
        { current: usageCheck.current, limit: usageCheck.limit }
      );
    }

    const caption = await generateCaption(data);

    // Track usage
    await trackUsageEvent(org.id, user.id, "ai_caption");

    return NextResponse.json({ caption });
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
