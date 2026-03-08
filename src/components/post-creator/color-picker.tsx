"use client";

import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

type ColorValues = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
};

type BrandDefaults = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
};

type ColorPickerProps = {
  colors: ColorValues;
  brandDefaults: BrandDefaults;
  onChange: (colors: ColorValues) => void;
};

const COLOR_FIELDS: { key: keyof ColorValues; label: string }[] = [
  { key: "primaryColor", label: "Primary" },
  { key: "secondaryColor", label: "Secondary" },
  { key: "accentColor", label: "Accent" },
];

export function ColorPicker({
  colors,
  brandDefaults,
  onChange,
}: ColorPickerProps) {
  const handleColorChange = useCallback(
    (key: keyof ColorValues, value: string) => {
      onChange({ ...colors, [key]: value });
    },
    [colors, onChange]
  );

  const handleReset = useCallback(() => {
    onChange({
      primaryColor: brandDefaults.primaryColor,
      secondaryColor: brandDefaults.secondaryColor,
      accentColor: brandDefaults.accentColor,
    });
  }, [brandDefaults, onChange]);

  const hasChanges =
    colors.primaryColor !== brandDefaults.primaryColor ||
    colors.secondaryColor !== brandDefaults.secondaryColor ||
    colors.accentColor !== brandDefaults.accentColor;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Post Colors</Label>
        {hasChanges && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleReset}
            className="text-muted-foreground"
          >
            <RotateCcw className="size-3" />
            Reset to brand defaults
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {COLOR_FIELDS.map(({ key, label }) => (
          <div key={key} className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">{label}</Label>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="color"
                  value={colors[key]}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="h-9 w-9 cursor-pointer rounded-md border border-input p-0.5"
                />
              </div>
              <Input
                type="text"
                value={colors[key]}
                onChange={(e) => handleColorChange(key, e.target.value)}
                placeholder="#000000"
                className="h-9 font-mono text-xs"
                maxLength={7}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
