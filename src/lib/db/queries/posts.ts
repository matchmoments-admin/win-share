import { db } from "@/lib/db";
import {
  generatedPosts,
  generatedImages,
  postFieldValues,
  brandSnapshots,
  activityLog,
} from "@/lib/db/schema";
import { eq, and, desc, sql, ilike, or, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function createPost(data: {
  organizationId: string;
  userId: string;
  templateId?: string;
  category: string;
  actionVerb: string;
  headline: string;
  heroPhotoUrl?: string;
  fieldValues: Record<string, string>;
  brandSnapshot: {
    logoUrl?: string | null;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    companyName?: string | null;
    displayPhone?: string | null;
    displayEmail?: string | null;
    displayWebsite?: string | null;
    tagline?: string | null;
  };
  images: {
    platform: string;
    imageUrl: string;
    cdnUrl?: string;
    width?: number;
    height?: number;
    templatedRenderId?: string;
    format?: string;
    fileSize?: number;
    isWatermarked: boolean;
  }[];
}) {
  const slug = nanoid(10);

  const [post] = await db
    .insert(generatedPosts)
    .values({
      organizationId: data.organizationId,
      userId: data.userId,
      templateId: data.templateId ?? null,
      category: data.category as "business_win",
      actionVerb: data.actionVerb,
      headline: data.headline,
      slug,
      heroPhotoUrl: data.heroPhotoUrl ?? null,
      status: "generated",
    })
    .returning();

  // Insert images
  if (data.images.length > 0) {
    await db.insert(generatedImages).values(
      data.images.map((img) => ({
        postId: post.id,
        platform: img.platform as "instagram_feed",
        imageUrl: img.imageUrl,
        cdnUrl: img.cdnUrl ?? null,
        width: img.width ?? null,
        height: img.height ?? null,
        templatedRenderId: img.templatedRenderId ?? null,
        format: (img.format ?? "png") as "png",
        fileSize: img.fileSize ?? null,
        isWatermarked: img.isWatermarked,
      }))
    );
  }

  // Insert field values
  const fieldEntries = Object.entries(data.fieldValues).filter(
    ([, v]) => v !== ""
  );
  if (fieldEntries.length > 0) {
    await db.insert(postFieldValues).values(
      fieldEntries.map(([name, value]) => ({
        postId: post.id,
        fieldName: name,
        fieldValue: value,
        fieldType: "text",
      }))
    );
  }

  // Insert brand snapshot
  await db.insert(brandSnapshots).values({
    postId: post.id,
    logoUrl: data.brandSnapshot.logoUrl ?? null,
    primaryColor: data.brandSnapshot.primaryColor,
    secondaryColor: data.brandSnapshot.secondaryColor,
    accentColor: data.brandSnapshot.accentColor,
    companyName: data.brandSnapshot.companyName ?? null,
    displayPhone: data.brandSnapshot.displayPhone ?? null,
    displayEmail: data.brandSnapshot.displayEmail ?? null,
    displayWebsite: data.brandSnapshot.displayWebsite ?? null,
    tagline: data.brandSnapshot.tagline ?? null,
  });

  // Log activity
  await db.insert(activityLog).values({
    organizationId: data.organizationId,
    userId: data.userId,
    type: "post_created",
    resourceId: post.id,
    description: `Created post: Just ${data.actionVerb}! — ${data.headline}`,
  });

  return post;
}

export async function getPostById(postId: string) {
  const post = await db.query.generatedPosts.findFirst({
    where: eq(generatedPosts.id, postId),
    with: {
      images: true,
      fieldValues: true,
      brandSnapshot: true,
      user: true,
      template: true,
    },
  });

  return post;
}

export async function getPostBySlug(slug: string) {
  const post = await db.query.generatedPosts.findFirst({
    where: eq(generatedPosts.slug, slug),
    with: {
      images: true,
      fieldValues: true,
      brandSnapshot: true,
    },
  });

  return post;
}

export async function listPosts(
  organizationId: string,
  options?: {
    category?: string;
    sortBy?: "newest" | "most_shared" | "most_viewed";
    search?: string;
    limit?: number;
    offset?: number;
  }
) {
  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  const conditions = [eq(generatedPosts.organizationId, organizationId)];

  if (options?.category) {
    conditions.push(
      eq(generatedPosts.category, options.category as "business_win")
    );
  }

  if (options?.search) {
    const pattern = `%${options.search}%`;
    conditions.push(
      or(
        ilike(generatedPosts.headline, pattern),
        ilike(generatedPosts.actionVerb, pattern)
      )!
    );
  }

  let orderBy;
  switch (options?.sortBy) {
    case "most_shared":
      orderBy = desc(generatedPosts.shareCount);
      break;
    case "most_viewed":
      orderBy = desc(generatedPosts.viewCount);
      break;
    default:
      orderBy = desc(generatedPosts.createdAt);
  }

  const posts = await db.query.generatedPosts.findMany({
    where: and(...conditions),
    with: {
      images: true,
    },
    orderBy: [orderBy],
    limit,
    offset,
  });

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(generatedPosts)
    .where(and(...conditions));

  return { posts, total: count };
}

export async function deletePost(postId: string) {
  await db.delete(generatedPosts).where(eq(generatedPosts.id, postId));
}

export async function incrementPostViewCount(slug: string) {
  await db
    .update(generatedPosts)
    .set({ viewCount: sql`${generatedPosts.viewCount} + 1` })
    .where(eq(generatedPosts.slug, slug));
}

export async function incrementPostShareCount(postId: string) {
  await db
    .update(generatedPosts)
    .set({ shareCount: sql`${generatedPosts.shareCount} + 1` })
    .where(eq(generatedPosts.id, postId));
}

export async function incrementPostDownloadCount(postId: string) {
  await db
    .update(generatedPosts)
    .set({ downloadCount: sql`${generatedPosts.downloadCount} + 1` })
    .where(eq(generatedPosts.id, postId));
}

export async function bulkDeletePosts(
  organizationId: string,
  postIds: string[]
) {
  if (postIds.length === 0) return;

  await db
    .delete(generatedPosts)
    .where(
      and(
        eq(generatedPosts.organizationId, organizationId),
        inArray(generatedPosts.id, postIds)
      )
    );
}
