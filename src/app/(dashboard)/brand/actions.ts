"use server";

import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { brandSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const brandSettingsSchema = z.object({
  companyName: z.string().max(200).optional().nullable(),
  tagline: z.string().max(500).optional().nullable(),
  logoUrl: z.string().url().optional().nullable().or(z.literal("")),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color"),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color"),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color"),
  backgroundColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid hex color"),
  contactPhone: z.string().max(30).optional().nullable(),
  contactEmail: z.string().email().optional().nullable().or(z.literal("")),
  contactWebsite: z.string().url().optional().nullable().or(z.literal("")),
  socialInstagram: z.string().max(200).optional().nullable(),
  socialLinkedin: z.string().max(200).optional().nullable(),
  socialFacebook: z.string().max(200).optional().nullable(),
  socialTwitter: z.string().max(200).optional().nullable(),
});

export type BrandSettingsInput = z.infer<typeof brandSettingsSchema>;

export async function updateBrandSettings(data: BrandSettingsInput) {
  const { orgId } = await requireAuth();

  // Validate input
  const parsed = brandSettingsSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.flatten().fieldErrors,
    };
  }

  const values = {
    companyName: parsed.data.companyName || null,
    tagline: parsed.data.tagline || null,
    logoUrl: parsed.data.logoUrl || null,
    primaryColor: parsed.data.primaryColor,
    secondaryColor: parsed.data.secondaryColor,
    accentColor: parsed.data.accentColor,
    backgroundColor: parsed.data.backgroundColor,
    contactPhone: parsed.data.contactPhone || null,
    contactEmail: parsed.data.contactEmail || null,
    contactWebsite: parsed.data.contactWebsite || null,
    socialInstagram: parsed.data.socialInstagram || null,
    socialLinkedin: parsed.data.socialLinkedin || null,
    socialFacebook: parsed.data.socialFacebook || null,
    socialTwitter: parsed.data.socialTwitter || null,
  };

  // Check if brand settings already exist for this org
  const [existing] = await db
    .select({ id: brandSettings.id })
    .from(brandSettings)
    .where(eq(brandSettings.organizationId, orgId))
    .limit(1);

  if (existing) {
    // Update existing record
    await db
      .update(brandSettings)
      .set(values)
      .where(eq(brandSettings.organizationId, orgId));
  } else {
    // Insert new record
    await db.insert(brandSettings).values({
      organizationId: orgId,
      ...values,
    });
  }

  return { success: true as const };
}
