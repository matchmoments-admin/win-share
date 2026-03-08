"use client";

import { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  PLATFORM_LABELS,
  PLATFORM_DIMENSIONS,
  type Platform,
} from "@/lib/templates/registry";
import { Check } from "lucide-react";

type PlatformSelectorProps = {
  selected: Platform[];
  onChange: (platforms: Platform[]) => void;
};

const ALL_PLATFORMS = Object.keys(PLATFORM_LABELS) as Platform[];

export function PlatformSelector({
  selected,
  onChange,
}: PlatformSelectorProps) {
  const toggle = useCallback(
    (platform: Platform) => {
      if (selected.includes(platform)) {
        // Don't allow deselecting the last platform
        if (selected.length === 1) return;
        onChange(selected.filter((p) => p !== platform));
      } else {
        onChange([...selected, platform]);
      }
    },
    [selected, onChange]
  );

  return (
    <div className="space-y-2">
      <Label>Platforms</Label>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {ALL_PLATFORMS.map((platform) => {
          const isSelected = selected.includes(platform);
          const dims = PLATFORM_DIMENSIONS[platform];

          return (
            <button
              key={platform}
              type="button"
              onClick={() => toggle(platform)}
              className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <div
                className={`flex size-5 shrink-0 items-center justify-center rounded border ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30"
                }`}
              >
                {isSelected && <Check className="size-3" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {PLATFORM_LABELS[platform]}
                </p>
                <p className="text-xs text-muted-foreground">
                  {dims.width} x {dims.height}px
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
