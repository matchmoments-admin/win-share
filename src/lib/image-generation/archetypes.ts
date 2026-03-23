import type { Platform } from "./interface";

export const ARCHETYPES = [
  "full_photo_overlay",
  "split_layout",
  "circular_badge",
  "minimalist_modern",
  "before_after_split",
  "corner_ribbon",
  "three_column_grid",
  "announcement_card",
] as const;

export type Archetype = (typeof ARCHETYPES)[number];

export interface OverlayZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  textAlign?: "left" | "center" | "right";
  fontSize?: number;
  fontWeight?: number;
}

export type OverlayZonesByPlatform = Partial<Record<Platform, OverlayZone[]>>;

export type BackgroundUrlsByPlatform = Partial<Record<Platform, string>>;

export interface OverlayRenderData {
  actionVerb: string;
  headline: string;
  heroPhotoUrl?: string;
  companyName?: string;
  logoUrl?: string;
  tagline?: string;
  detailLine?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headlineColor: string;
  subheadColor: string;
  watermark: boolean;
  fieldValues: Record<string, string>;
}

export const ARCHETYPE_META: Record<
  Archetype,
  { name: string; description: string }
> = {
  full_photo_overlay: {
    name: "Bold Photo Overlay",
    description:
      "Full-screen hero photo with gradient overlay and centered text",
  },
  split_layout: {
    name: "Split Layout",
    description: "Photo on left, branded content panel on right",
  },
  circular_badge: {
    name: "Badge Stamp",
    description: "Central circular badge over a background image",
  },
  minimalist_modern: {
    name: "Modern Minimal",
    description: "Clean background with large typography and small corner photo",
  },
  before_after_split: {
    name: "Before & After",
    description: "Vertical split with two panels for comparison",
  },
  corner_ribbon: {
    name: "Corner Ribbon",
    description: "Full background with diagonal ribbon banner and text overlay",
  },
  three_column_grid: {
    name: "Stats Grid",
    description: "Three vertical columns for metrics and details",
  },
  announcement_card: {
    name: "Announcement Card",
    description:
      "Floating white card over a background with header bar",
  },
};
