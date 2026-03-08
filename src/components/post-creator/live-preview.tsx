"use client";

import { useMemo } from "react";
import {
  PLATFORM_DIMENSIONS,
  type Platform,
} from "@/lib/templates/registry";
import { ImageIcon } from "lucide-react";

type LivePreviewProps = {
  actionVerb: string;
  headline: string;
  heroPhotoUrl: string | null;
  companyName: string;
  tagline: string;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  platform: Platform;
  /** Dynamic field values for category-specific content */
  fieldValues: Record<string, string>;
};

/**
 * CSS-only preview card that approximates a branded social media post.
 * This is NOT an actual Templated.io render -- just a visual approximation
 * that updates in real-time as the user types.
 */
export function LivePreview({
  actionVerb,
  headline,
  heroPhotoUrl,
  companyName,
  tagline,
  logoUrl,
  primaryColor,
  secondaryColor,
  accentColor,
  platform,
  fieldValues,
}: LivePreviewProps) {
  const dims = PLATFORM_DIMENSIONS[platform];

  // Calculate aspect ratio for the preview container
  const aspectRatio = useMemo(() => {
    return `${dims.width} / ${dims.height}`;
  }, [dims]);

  // Derive a readable text colour for the primary background
  const textOnPrimary = useMemo(() => {
    // Simple luminance check to decide white vs dark text
    const hex = primaryColor.replace("#", "");
    if (hex.length < 6) return "#ffffff";
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#1a1a1a" : "#ffffff";
  }, [primaryColor]);

  const displayVerb = actionVerb || "Achieved";
  const displayHeadline = headline || "Your headline here";
  const displayCompany = companyName || "Your Company";
  const displayTagline = tagline || "Your tagline";

  // Pick a detail line from field values if present
  const detailLine = useMemo(() => {
    const keys = Object.keys(fieldValues);
    for (const key of keys) {
      if (fieldValues[key] && fieldValues[key].trim()) {
        return fieldValues[key];
      }
    }
    return null;
  }, [fieldValues]);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Live Preview</p>

      <div
        className="relative mx-auto w-full overflow-hidden rounded-lg border shadow-sm"
        style={{
          aspectRatio,
          maxWidth: platform === "instagram_story" ? "240px" : "360px",
        }}
      >
        {/* Post card content */}
        <div
          className="flex h-full w-full flex-col"
          style={{ backgroundColor: primaryColor }}
        >
          {/* Top bar with logo and company name */}
          <div
            className="flex items-center gap-2 px-4 py-3"
            style={{ backgroundColor: primaryColor }}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="size-7 rounded-full border border-white/20 object-cover"
              />
            ) : (
              <div
                className="flex size-7 items-center justify-center rounded-full text-[10px] font-bold"
                style={{
                  backgroundColor: secondaryColor,
                  color: textOnPrimary,
                }}
              >
                {displayCompany.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p
                className="truncate text-xs font-semibold"
                style={{ color: textOnPrimary }}
              >
                {displayCompany}
              </p>
            </div>
          </div>

          {/* Action verb banner */}
          <div
            className="px-4 py-1.5"
            style={{ backgroundColor: secondaryColor }}
          >
            <p
              className="text-center text-xs font-bold tracking-wide uppercase"
              style={{ color: accentColor }}
            >
              Just {displayVerb}!
            </p>
          </div>

          {/* Hero photo area */}
          <div className="relative flex-1">
            {heroPhotoUrl ? (
              <img
                src={heroPhotoUrl}
                alt="Hero"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-black/10">
                <ImageIcon
                  className="size-10"
                  style={{ color: `${textOnPrimary}40` }}
                />
              </div>
            )}

            {/* Headline overlay on the hero image */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pt-8 pb-3">
              <p className="text-sm leading-tight font-bold text-white">
                {displayHeadline}
              </p>
              {detailLine && (
                <p className="mt-0.5 truncate text-[10px] text-white/80">
                  {detailLine}
                </p>
              )}
            </div>
          </div>

          {/* Bottom bar with tagline */}
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ backgroundColor: primaryColor }}
          >
            <p
              className="truncate text-[10px] italic"
              style={{ color: `${textOnPrimary}b3` }}
            >
              {displayTagline}
            </p>
            <div
              className="ml-2 h-0.5 w-6 rounded-full"
              style={{ backgroundColor: secondaryColor }}
            />
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] text-muted-foreground">
        {dims.width} x {dims.height}px &middot; CSS approximation only
      </p>
    </div>
  );
}
