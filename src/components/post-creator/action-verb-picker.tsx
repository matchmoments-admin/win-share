"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, type ContentCategory } from "@/lib/templates/categories";
import { ACTION_VERB_SUGGESTIONS } from "@/lib/templates/registry";

type ActionVerbPickerProps = {
  value: string;
  categoryId: ContentCategory["id"] | null;
  onChange: (verb: string) => void;
};

export function ActionVerbPicker({
  value,
  categoryId,
  onChange,
}: ActionVerbPickerProps) {
  const [showMore, setShowMore] = useState(false);

  const categoryVerbs = useMemo(() => {
    if (!categoryId) return [];
    return CATEGORIES[categoryId]?.actionVerbs ?? [];
  }, [categoryId]);

  const additionalVerbs = useMemo(() => {
    const categorySet = new Set(categoryVerbs);
    return ACTION_VERB_SUGGESTIONS.filter((v) => !categorySet.has(v));
  }, [categoryVerbs]);

  return (
    <div className="space-y-2">
      <Label htmlFor="action-verb">Action Verb</Label>
      <Input
        id="action-verb"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          categoryVerbs.length > 0
            ? `e.g. ${categoryVerbs[0]}`
            : "e.g. Achieved"
        }
        list="action-verb-suggestions"
      />

      {/* Quick-pick badges for category verbs */}
      {categoryVerbs.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Suggested</p>
          <div className="flex flex-wrap gap-1.5">
            {categoryVerbs.map((verb) => (
              <Badge
                key={verb}
                variant={value === verb ? "default" : "outline"}
                className="cursor-pointer select-none"
                onClick={() => onChange(verb)}
              >
                {verb}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* More options toggle */}
      {additionalVerbs.length > 0 && (
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => setShowMore(!showMore)}
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            {showMore ? "Hide more options" : "More options"}
          </button>

          {showMore && (
            <div className="flex flex-wrap gap-1.5">
              {additionalVerbs.map((verb) => (
                <Badge
                  key={verb}
                  variant={value === verb ? "default" : "secondary"}
                  className="cursor-pointer select-none"
                  onClick={() => onChange(verb)}
                >
                  {verb}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
