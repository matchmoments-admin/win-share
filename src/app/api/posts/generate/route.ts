import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/lib/db";
import { brandSettings, organizations, users, templates } from "@/lib/db/schema";
import { checkUsageLimit } from "@/lib/usage/check";
import { trackUsageEvent } from "@/lib/usage/track";
import { getImageGenerator } from "@/lib/image-generation/templated-io";
import { buildLayers } from "@/lib/image-generation/layer-builder";
import { createPost } from "@/lib/db/queries/posts";
import { handleApiError, AppError, ErrorCode } from "@/lib/errors";
import { checkRateLimit, generationLimiter } from "@/lib/rate-limit";
import { isFreePlan } from "@/lib/stripe";
import { PLATFORM_DIMENSIONS } from "@/lib/image-generation/interface";

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);

const generatePostSchema = z.object({
  category: z.string().min(1),
  actionVerb: z.string().min(1),
  headline: z.string().min(1).max(200),
  heroPhotoUrl: z.string().url().optional().or(z.literal("")),
  templateId: z.string().optional(),
  platforms: z.array(z.string()).min(1, "Select at least one platform"),
  fieldValues: z.record(z.string(), z.string()),
  colorOverrides: z
    .object({
      primaryColor: hexColor.optional(),
      secondaryColor: hexColor.optional(),
      accentColor: hexColor.optional(),
    })
    .optional(),
});

export async function POST(req: Request) {
  try {
    const { userId: clerkUserId, orgId: clerkOrgId } = await auth();

    if (!clerkUserId || !clerkOrgId) {
      throw new AppError("Unauthorized", ErrorCode.UNAUTHORIZED);
    }

    // Rate limit
    await checkRateLimit(generationLimiter, clerkUserId);

    // Parse and validate
    const body = await req.json();
    const data = generatePostSchema.parse(body);

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
    const usageCheck = await checkUsageLimit(org.id, "post_generated");
    if (!usageCheck.allowed) {
      throw new AppError(
        `Monthly post limit reached (${usageCheck.limit}). Please upgrade your plan.`,
        ErrorCode.USAGE_LIMIT_EXCEEDED,
        { current: usageCheck.current, limit: usageCheck.limit }
      );
    }

    // Get brand settings
    const [brand] = await db
      .select()
      .from(brandSettings)
      .where(eq(brandSettings.organizationId, org.id))
      .limit(1);

    if (!brand) {
      throw new AppError(
        "Brand settings not found. Please set up your brand first.",
        ErrorCode.NOT_FOUND
      );
    }

    // Apply color overrides
    const effectiveBrand = {
      logoUrl: brand.logoUrl,
      primaryColor: data.colorOverrides?.primaryColor ?? brand.primaryColor,
      secondaryColor:
        data.colorOverrides?.secondaryColor ?? brand.secondaryColor,
      accentColor: data.colorOverrides?.accentColor ?? brand.accentColor,
      companyName: brand.companyName,
      contactPhone: brand.contactPhone,
      contactEmail: brand.contactEmail,
      contactWebsite: brand.contactWebsite,
      tagline: brand.tagline,
    };

    // Check if free plan (for watermark)
    const subscription = await db.query.subscriptions.findFirst({
      where: (sub, { eq }) => eq(sub.organizationId, org.id),
    });
    const watermark = isFreePlan(subscription?.planTier ?? "free");

    // Build layers
    const layers = buildLayers(
      effectiveBrand,
      {
        actionVerb: data.actionVerb,
        headline: data.headline,
        heroPhotoUrl: data.heroPhotoUrl || null,
        category: data.category,
        fieldValues: data.fieldValues,
      },
      { watermark }
    );

    // Look up template to determine render engine
    let templateRecord = null;
    if (data.templateId && data.templateId !== "default") {
      templateRecord = await db.query.templates.findFirst({
        where: eq(templates.id, data.templateId),
      });
    }

    const engine =
      (templateRecord?.renderEngine as "satori" | "templated_io") ?? "satori";
    const backgroundUrls =
      (templateRecord?.backgroundUrls as Record<string, string>) ?? {};
    const archetype =
      (templateRecord?.archetype as string) ?? "full_photo_overlay";

    // Generate images for each platform in parallel
    const generator = getImageGenerator(engine);
    const imageResults = await Promise.all(
      data.platforms.map(async (platform) => {
        try {
          const result = await generator.renderImage({
            templateId: data.templateId ?? "default",
            layers,
            platform: platform as keyof typeof PLATFORM_DIMENSIONS,
            watermark,
            renderEngine: engine,
            archetype,
            backgroundUrl: backgroundUrls[platform] ?? undefined,
            overlayZones: [],
            fontFamily: (templateRecord?.fontFamily as string) ?? "Inter",
            headlineColor: (templateRecord?.headlineColor as string) ?? "#FFFFFF",
            subheadColor: (templateRecord?.subheadColor as string) ?? "#FFFFFF",
          });
          return {
            platform,
            imageUrl: result.imageUrl,
            width: result.width,
            height: result.height,
            templatedRenderId: result.renderId,
            format: result.format,
            isWatermarked: watermark,
          };
        } catch (err) {
          // If image generation fails for a platform, use a placeholder
          const dims =
            PLATFORM_DIMENSIONS[
              platform as keyof typeof PLATFORM_DIMENSIONS
            ] ?? { width: 1080, height: 1080 };
          return {
            platform,
            imageUrl: "",
            width: dims.width,
            height: dims.height,
            templatedRenderId: undefined,
            format: "png" as const,
            isWatermarked: watermark,
            error: err instanceof Error ? err.message : "Generation failed",
          };
        }
      })
    );

    // Save to database
    const post = await createPost({
      organizationId: org.id,
      userId: user.id,
      templateId: data.templateId,
      category: data.category,
      actionVerb: data.actionVerb,
      headline: data.headline,
      heroPhotoUrl: data.heroPhotoUrl || undefined,
      fieldValues: data.fieldValues,
      brandSnapshot: {
        logoUrl: effectiveBrand.logoUrl,
        primaryColor: effectiveBrand.primaryColor,
        secondaryColor: effectiveBrand.secondaryColor,
        accentColor: effectiveBrand.accentColor,
        companyName: effectiveBrand.companyName,
        displayPhone: effectiveBrand.contactPhone,
        displayEmail: effectiveBrand.contactEmail,
        displayWebsite: effectiveBrand.contactWebsite,
        tagline: effectiveBrand.tagline,
      },
      images: imageResults.map((img) => ({
        platform: img.platform,
        imageUrl: img.imageUrl,
        width: img.width,
        height: img.height,
        templatedRenderId: img.templatedRenderId,
        format: img.format,
        isWatermarked: img.isWatermarked,
      })),
    });

    // Track usage
    await trackUsageEvent(org.id, user.id, "post_generated", post.id);

    return NextResponse.json({ post, images: imageResults }, { status: 201 });
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
