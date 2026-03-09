import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { brandSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PostForm, type BrandSettings } from "@/components/post-creator/post-form";
import { listTemplates } from "@/lib/db/queries/templates";

export const metadata = {
  title: "Create Post",
  description: "Create a new branded social media post",
};

export default async function CreatePostPage() {
  const { orgId } = await requireAuth();

  // Fetch brand settings and templates in parallel
  const [[brand], dbTemplates] = await Promise.all([
    db
      .select()
      .from(brandSettings)
      .where(eq(brandSettings.organizationId, orgId))
      .limit(1),
    listTemplates({ organizationId: orgId }),
  ]);

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

  // Map DB templates to the shape TemplateSelector expects
  const templates = dbTemplates.map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    thumbnailUrl: t.thumbnailUrl,
    isSystem: t.isSystem,
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PostForm brandSettings={settings} templates={templates} />
    </div>
  );
}
