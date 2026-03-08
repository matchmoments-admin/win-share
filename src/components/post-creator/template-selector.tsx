"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Check, LayoutTemplate } from "lucide-react";
import type { ContentCategory } from "@/lib/templates/categories";

type TemplateSelectorProps = {
  categoryId: ContentCategory["id"] | null;
  selectedTemplateId: string;
  onChange: (templateId: string) => void;
};

type PlaceholderTemplate = {
  id: string;
  name: string;
  description: string;
};

/**
 * Placeholder templates -- these will be replaced with real Templated.io
 * templates once the integration is wired up.
 */
function getPlaceholderTemplates(
  categoryId: ContentCategory["id"] | null
): PlaceholderTemplate[] {
  const base: PlaceholderTemplate[] = [
    {
      id: "default",
      name: "Default Template",
      description: "Clean, professional layout with your brand colours",
    },
  ];

  if (!categoryId) return base;

  const categoryTemplates: Record<string, PlaceholderTemplate[]> = {
    business_win: [
      {
        id: "bold-celebration",
        name: "Bold Celebration",
        description: "Large hero photo with bold headline overlay",
      },
      {
        id: "elegant-card",
        name: "Elegant Card",
        description: "Minimalist card style with subtle branding",
      },
    ],
    thank_you: [
      {
        id: "heartfelt",
        name: "Heartfelt",
        description: "Warm tones with testimonial quote highlight",
      },
    ],
    review_highlight: [
      {
        id: "star-banner",
        name: "Star Banner",
        description: "Prominent star rating with review excerpt",
      },
    ],
    shout_out: [
      {
        id: "spotlight",
        name: "Spotlight",
        description: "Person-focused layout with achievement callout",
      },
    ],
    team_people: [
      {
        id: "team-intro",
        name: "Team Intro",
        description: "Profile-card style with fun fact section",
      },
    ],
    business_milestone: [
      {
        id: "milestone-counter",
        name: "Milestone Counter",
        description: "Large numbers with celebratory background",
      },
    ],
    announcement: [
      {
        id: "news-flash",
        name: "News Flash",
        description: "Attention-grabbing announcement banner",
      },
    ],
  };

  return [...base, ...(categoryTemplates[categoryId] ?? [])];
}

export function TemplateSelector({
  categoryId,
  selectedTemplateId,
  onChange,
}: TemplateSelectorProps) {
  const templates = useMemo(
    () => getPlaceholderTemplates(categoryId),
    [categoryId]
  );

  return (
    <div className="space-y-2">
      <Label>Template</Label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {templates.map((template) => {
          const isSelected = selectedTemplateId === template.id;

          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-colors ${
                isSelected
                  ? "border-primary ring-2 ring-primary/20"
                  : "hover:border-muted-foreground/30"
              }`}
              onClick={() => onChange(template.id)}
            >
              <CardContent className="p-3">
                {/* Placeholder thumbnail */}
                <div
                  className={`mb-2 flex h-20 items-center justify-center rounded-md ${
                    isSelected ? "bg-primary/10" : "bg-muted"
                  }`}
                >
                  <LayoutTemplate
                    className={`size-8 ${
                      isSelected
                        ? "text-primary"
                        : "text-muted-foreground/40"
                    }`}
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium leading-tight">
                      {template.name}
                    </p>
                    {isSelected && (
                      <Check className="size-3.5 shrink-0 text-primary" />
                    )}
                  </div>
                  <p className="line-clamp-2 text-xs text-muted-foreground">
                    {template.description}
                  </p>
                </div>

                {template.id === "default" && (
                  <Badge variant="secondary" className="mt-2 text-[10px]">
                    Recommended
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
