"use client";

import { Instagram, Globe, Phone } from "lucide-react";

interface BrandPreviewProps {
  companyName: string;
  tagline: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  contactPhone: string;
  contactWebsite: string;
}

export function BrandPreview({
  companyName,
  tagline,
  logoUrl,
  primaryColor,
  secondaryColor,
  accentColor,
  backgroundColor,
  contactPhone,
  contactWebsite,
}: BrandPreviewProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Live Preview
      </h3>
      <div
        className="overflow-hidden rounded-xl border shadow-sm"
        style={{ backgroundColor }}
      >
        {/* Post header */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ backgroundColor: primaryColor }}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              className="h-10 w-10 rounded-full bg-white object-cover"
            />
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
              style={{ backgroundColor: secondaryColor, color: accentColor }}
            >
              {companyName ? companyName.charAt(0).toUpperCase() : "W"}
            </div>
          )}
          <div>
            <p
              className="text-sm font-semibold"
              style={{ color: accentColor }}
            >
              {companyName || "Your Company"}
            </p>
            <p
              className="text-xs opacity-80"
              style={{ color: accentColor }}
            >
              {tagline || "Your tagline here"}
            </p>
          </div>
        </div>

        {/* Post body */}
        <div className="px-4 py-6">
          <div
            className="mb-4 rounded-lg px-4 py-6 text-center"
            style={{ backgroundColor: primaryColor }}
          >
            <p
              className="text-xs font-medium uppercase tracking-widest"
              style={{ color: secondaryColor }}
            >
              Another Win
            </p>
            <p
              className="mt-2 text-xl font-bold"
              style={{ color: accentColor }}
            >
              Just Settled!
            </p>
            <p
              className="mt-1 text-sm opacity-80"
              style={{ color: accentColor }}
            >
              Congratulations to the Smith Family
            </p>
          </div>

          {/* Accent bar */}
          <div
            className="mx-auto h-1 w-16 rounded-full"
            style={{ backgroundColor: secondaryColor }}
          />
        </div>

        {/* Post footer */}
        <div
          className="flex items-center justify-between px-4 py-3 text-xs"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center gap-3" style={{ color: accentColor }}>
            {contactPhone && (
              <span className="flex items-center gap-1 opacity-80">
                <Phone className="h-3 w-3" />
                {contactPhone}
              </span>
            )}
            {contactWebsite && (
              <span className="flex items-center gap-1 opacity-80">
                <Globe className="h-3 w-3" />
                {contactWebsite.replace(/^https?:\/\//, "")}
              </span>
            )}
          </div>
          <Instagram className="h-4 w-4" style={{ color: secondaryColor }} />
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        This is an approximate preview. Actual post designs may vary.
      </p>
    </div>
  );
}
