"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trophy,
  Heart,
  Megaphone,
  Users,
  Star,
  Flag,
  Bell,
  ArrowLeft,
  Loader2,
  Sparkles,
} from "lucide-react";

import { CATEGORIES, type ContentCategory } from "@/lib/templates/categories";
import type { Platform } from "@/lib/templates/registry";

import { LivePreview } from "./live-preview";
import { PlatformSelector } from "./platform-selector";
import { PhotoUploader } from "./photo-uploader";
import { ActionVerbPicker } from "./action-verb-picker";
import { ColorPicker } from "./color-picker";
import { TemplateSelector, type TemplateData } from "./template-selector";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BrandSettings = {
  companyName: string | null;
  tagline: string | null;
  logoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  contactPhone: string | null;
  contactEmail: string | null;
  contactWebsite: string | null;
};

type PostFormProps = {
  brandSettings: BrandSettings;
  templates?: TemplateData[];
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CATEGORY_ICONS: Record<ContentCategory["id"], React.ElementType> = {
  business_win: Trophy,
  thank_you: Heart,
  shout_out: Megaphone,
  team_people: Users,
  review_highlight: Star,
  business_milestone: Flag,
  announcement: Bell,
};

const ALL_CATEGORIES = Object.values(CATEGORIES);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PostForm({ brandSettings, templates: dbTemplates }: PostFormProps) {
  const router = useRouter();

  // -- Step state --
  const [step, setStep] = useState<1 | 2>(1);

  // -- Form state --
  const [categoryId, setCategoryId] = useState<ContentCategory["id"] | null>(
    null
  );
  const [actionVerb, setActionVerb] = useState("");
  const [headline, setHeadline] = useState("");
  const [heroPhotoUrl, setHeroPhotoUrl] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>(["instagram_feed"]);
  const [templateId, setTemplateId] = useState("default");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [colors, setColors] = useState({
    primaryColor: brandSettings.primaryColor,
    secondaryColor: brandSettings.secondaryColor,
    accentColor: brandSettings.accentColor,
  });

  // -- UI state --
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // -- Derived data --
  const selectedCategory = useMemo(
    () => (categoryId ? CATEGORIES[categoryId] : null),
    [categoryId]
  );

  const categoryFields = useMemo(
    () => selectedCategory?.fields ?? [],
    [selectedCategory]
  );

  // Preview platform (first selected platform)
  const previewPlatform = platforms[0] ?? "instagram_feed";

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleCategorySelect = useCallback(
    (id: ContentCategory["id"]) => {
      setCategoryId(id);
      setFieldValues({});
      // Pre-fill first suggested action verb
      const cat = CATEGORIES[id];
      if (cat.actionVerbs.length > 0 && !actionVerb) {
        setActionVerb(cat.actionVerbs[0]);
      }
      setStep(2);
    },
    [actionVerb]
  );

  const handleFieldChange = useCallback(
    (fieldName: string, value: string) => {
      setFieldValues((prev) => ({ ...prev, [fieldName]: value }));
    },
    []
  );

  const handleBackToCategories = useCallback(() => {
    setStep(1);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!categoryId) return;

      setIsSubmitting(true);
      setError(null);

      try {
        const payload = {
          category: categoryId,
          actionVerb,
          headline,
          heroPhotoUrl,
          platforms,
          templateId,
          fieldValues,
          colorOverrides: colors,
        };

        const response = await fetch("/api/posts/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error ?? "Failed to generate post");
        }

        const data = await response.json();
        router.push(`/posts/${data.post.id}`);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred"
        );
        setIsSubmitting(false);
      }
    },
    [
      categoryId,
      actionVerb,
      headline,
      heroPhotoUrl,
      platforms,
      templateId,
      fieldValues,
      colors,
      router,
    ]
  );

  // ---------------------------------------------------------------------------
  // Step 1 - Category Selection
  // ---------------------------------------------------------------------------

  if (step === 1) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Post</h1>
          <p className="mt-1 text-muted-foreground">
            Choose a category to get started
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category.id];
            const isSelected = categoryId === category.id;

            return (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/20"
                    : "hover:border-muted-foreground/30"
                }`}
                onClick={() => handleCategorySelect(category.id)}
              >
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base">
                        {category.name}
                      </CardTitle>
                      <CardDescription className="mt-1 text-xs">
                        {category.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {category.actionVerbs.map((verb) => (
                      <Badge
                        key={verb}
                        variant="secondary"
                        className="text-[10px]"
                      >
                        {verb}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Step 2 - Template + Form Fields + Live Preview
  // ---------------------------------------------------------------------------

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleBackToCategories}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {selectedCategory?.name} Post
          </h1>
          <p className="text-sm text-muted-foreground">
            Fill in the details and see a live preview
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left column - Form */}
        <div className="space-y-6">
          {/* Template selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Template</CardTitle>
              <CardDescription>
                Choose a layout for your post
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TemplateSelector
                categoryId={categoryId}
                selectedTemplateId={templateId}
                onChange={setTemplateId}
                templates={dbTemplates}
              />
            </CardContent>
          </Card>

          {/* Core fields */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Post Details</CardTitle>
              <CardDescription>
                The main content for your post
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Action Verb */}
              <ActionVerbPicker
                value={actionVerb}
                categoryId={categoryId}
                onChange={setActionVerb}
              />

              {/* Headline */}
              <div className="space-y-2">
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Congratulations to the Smith Family!"
                  required
                />
              </div>

              {/* Category-specific dynamic fields */}
              {categoryFields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={`field-${field.name}`}>
                    {field.label}
                    {field.required && (
                      <span className="ml-1 text-destructive">*</span>
                    )}
                  </Label>

                  {field.type === "textarea" ? (
                    <Textarea
                      id={`field-${field.name}`}
                      value={fieldValues[field.name] ?? ""}
                      onChange={(e) =>
                        handleFieldChange(field.name, e.target.value)
                      }
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  ) : field.type === "select" && field.options ? (
                    <Select
                      value={fieldValues[field.name] ?? ""}
                      onValueChange={(v) => handleFieldChange(field.name, v)}
                      required={field.required}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={field.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={`field-${field.name}`}
                      type={
                        field.type === "number" || field.type === "currency"
                          ? "number"
                          : "text"
                      }
                      value={fieldValues[field.name] ?? ""}
                      onChange={(e) =>
                        handleFieldChange(field.name, e.target.value)
                      }
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Photo upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Photo</CardTitle>
              <CardDescription>
                Upload a hero photo for your post
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PhotoUploader
                value={heroPhotoUrl}
                onChange={setHeroPhotoUrl}
              />
            </CardContent>
          </Card>

          {/* Platforms */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Platforms</CardTitle>
              <CardDescription>
                Select which platforms to generate images for
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlatformSelector
                selected={platforms}
                onChange={setPlatforms}
              />
            </CardContent>
          </Card>

          {/* Colours */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Colours</CardTitle>
              <CardDescription>
                Override brand colours for this post (optional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ColorPicker
                colors={colors}
                brandDefaults={{
                  primaryColor: brandSettings.primaryColor,
                  secondaryColor: brandSettings.secondaryColor,
                  accentColor: brandSettings.accentColor,
                }}
                onChange={setColors}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right column - Live Preview (sticky on desktop) */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardContent className="pt-6">
              <LivePreview
                actionVerb={actionVerb}
                headline={headline}
                heroPhotoUrl={heroPhotoUrl}
                companyName={brandSettings.companyName ?? ""}
                tagline={brandSettings.tagline ?? ""}
                logoUrl={brandSettings.logoUrl}
                primaryColor={colors.primaryColor}
                secondaryColor={colors.secondaryColor}
                accentColor={colors.accentColor}
                platform={previewPlatform}
                fieldValues={fieldValues}
              />

              {/* Platform preview tabs */}
              {platforms.length > 1 && (
                <div className="mt-3 flex flex-wrap justify-center gap-1">
                  {platforms.map((p) => (
                    <Badge
                      key={p}
                      variant={
                        p === previewPlatform ? "default" : "outline"
                      }
                      className="cursor-pointer text-[10px]"
                      onClick={() => {
                        // Move the clicked platform to the front of the array
                        // so previewPlatform updates
                        setPlatforms([
                          p,
                          ...platforms.filter((x) => x !== p),
                        ]);
                      }}
                    >
                      {p.replace(/_/g, " ")}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 border-t pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handleBackToCategories}
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
        <Button type="submit" disabled={isSubmitting || !headline}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              Generate Post
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
