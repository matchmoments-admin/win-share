import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { brandSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PostForm, type BrandSettings } from "@/components/post-creator/post-form";

export const metadata = {
  title: "Create Post",
  description: "Create a new branded social media post",
};

export default async function CreatePostPage() {
  const { orgId } = await requireAuth();

  // Fetch brand settings for the current organisation
  const [brand] = await db
    .select()
    .from(brandSettings)
    .where(eq(brandSettings.organizationId, orgId))
    .limit(1);

  // Build the brand settings object with sensible defaults
  const settings: BrandSettings = {
    companyName: brand?.companyName ?? null,
    tagline: brand?.tagline ?? null,
    logoUrl: brand?.logoUrl ?? null,
    primaryColor: brand?.primaryColor ?? "#1e3a5f",
    secondaryColor: brand?.secondaryColor ?? "#c9a84c",
    accentColor: brand?.accentColor ?? "#ffffff",
    backgroundColor: brand?.backgroundColor ?? "#f5f5f5",
    contactPhone: brand?.contactPhone ?? null,
    contactEmail: brand?.contactEmail ?? null,
    contactWebsite: brand?.contactWebsite ?? null,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PostForm brandSettings={settings} />
    </div>
  );
}
