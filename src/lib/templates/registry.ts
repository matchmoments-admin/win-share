// =============================================================================
// Template Registry
// Central registry for template definitions, platform dimensions, and helpers
// =============================================================================

import { CATEGORIES, type FieldConfig } from "./categories";
import { INDUSTRIES } from "./industries";

import type { ContentCategory } from "./categories";
import type { IndustryConfig } from "./industries";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/**
 * A template definition that ties a Templated.io design to a category,
 * industry, and platform so the app knows which fields to render and
 * what dimensions the output image should be.
 */
export type TemplateDefinition = {
  id: string;
  name: string;
  category: ContentCategory["id"];
  industry?: IndustryConfig["id"];
  platform: Platform;
  templatedIoId: string;
  thumbnailUrl?: string;
  fieldConfig: FieldConfig[];
};

export type Platform =
  | "instagram_feed"
  | "instagram_story"
  | "linkedin"
  | "facebook"
  | "twitter";

// -----------------------------------------------------------------------------
// Platform Dimensions (width x height in pixels)
// -----------------------------------------------------------------------------

export const PLATFORM_DIMENSIONS: Record<
  Platform,
  { width: number; height: number }
> = {
  instagram_feed: { width: 1080, height: 1080 },
  instagram_story: { width: 1080, height: 1920 },
  linkedin: { width: 1200, height: 627 },
  facebook: { width: 1200, height: 630 },
  twitter: { width: 1600, height: 900 },
} as const;

// -----------------------------------------------------------------------------
// Platform Display Labels
// -----------------------------------------------------------------------------

export const PLATFORM_LABELS: Record<Platform, string> = {
  instagram_feed: "Instagram Feed",
  instagram_story: "Instagram Story",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  twitter: "Twitter / X",
} as const;

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

/**
 * Returns the field configurations for a given content category.
 * Falls back to an empty array if the category is not found.
 */
export function getFieldsForCategory(
  categoryId: ContentCategory["id"]
): FieldConfig[] {
  const category = CATEGORIES[categoryId];
  return category ? category.fields : [];
}

/**
 * Returns the default brand colour palette for a given industry.
 * Falls back to the "other" industry palette if the id is not found.
 */
export function getDefaultColorsForIndustry(
  industryId: IndustryConfig["id"]
): IndustryConfig["defaultColors"] {
  const industry = INDUSTRIES[industryId];
  return industry ? industry.defaultColors : INDUSTRIES.other.defaultColors;
}

// -----------------------------------------------------------------------------
// Action Verb Suggestions (de-duplicated union across all industries)
// -----------------------------------------------------------------------------

export const ACTION_VERB_SUGGESTIONS: string[] = (() => {
  const verbs = new Set<string>();
  for (const industry of Object.values(INDUSTRIES)) {
    for (const verb of industry.defaultActionVerbs) {
      verbs.add(verb);
    }
  }
  // Also include category-level verbs
  for (const category of Object.values(CATEGORIES)) {
    for (const verb of category.actionVerbs) {
      verbs.add(verb);
    }
  }
  return Array.from(verbs).sort();
})();
