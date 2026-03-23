import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { brandSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { BrandSetup } from "@/components/brand/brand-setup";

export default async function BrandPage() {
  const { orgId } = await requireAuth();

  // Fetch existing brand settings for the organization
  const [existing] = await db
    .select()
    .from(brandSettings)
    .where(eq(brandSettings.organizationId, orgId))
    .limit(1);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Brand settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your brand identity. These settings are applied to every
          post you generate.
        </p>
      </div>

      <BrandSetup initialData={existing ?? null} />
    </div>
  );
}
