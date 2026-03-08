"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Linkedin,
  Instagram,
  Facebook,
  Twitter,
  Sparkles,
  Copy,
  Check,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface CaptionGeneratorProps {
  postData: {
    category: string;
    actionVerb: string;
    headline: string;
    companyName: string;
    industry: string;
    fieldValues: Record<string, string>;
  };
}

const PLATFORMS = [
  { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  { id: "instagram", label: "Instagram", icon: Instagram },
  { id: "facebook", label: "Facebook", icon: Facebook },
  { id: "twitter", label: "Twitter", icon: Twitter },
] as const;

type PlatformId = (typeof PLATFORMS)[number]["id"];

export function CaptionGenerator({ postData }: CaptionGeneratorProps) {
  const [captions, setCaptions] = useState<Record<PlatformId, string>>({
    linkedin: "",
    instagram: "",
    facebook: "",
    twitter: "",
  });
  const [loading, setLoading] = useState<Record<PlatformId, boolean>>({
    linkedin: false,
    instagram: false,
    facebook: false,
    twitter: false,
  });
  const [copied, setCopied] = useState<Record<PlatformId, boolean>>({
    linkedin: false,
    instagram: false,
    facebook: false,
    twitter: false,
  });
  const [remaining, setRemaining] = useState<number | null>(null);

  async function generateCaption(platform: PlatformId) {
    setLoading((prev) => ({ ...prev, [platform]: true }));

    try {
      const response = await fetch("/api/ai/caption", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          category: postData.category,
          actionVerb: postData.actionVerb,
          companyName: postData.companyName,
          industry: postData.industry,
          headline: postData.headline,
          fieldValues: postData.fieldValues,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const message =
          errorData?.error?.message || "Failed to generate caption";
        throw new Error(message);
      }

      const data = await response.json();
      setCaptions((prev) => ({ ...prev, [platform]: data.caption }));

      if (typeof data.remaining === "number") {
        setRemaining(data.remaining);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate caption"
      );
    } finally {
      setLoading((prev) => ({ ...prev, [platform]: false }));
    }
  }

  async function copyCaption(platform: PlatformId) {
    const caption = captions[platform];
    if (!caption) return;

    try {
      await navigator.clipboard.writeText(caption);
      setCopied((prev) => ({ ...prev, [platform]: true }));
      toast.success("Caption copied to clipboard");
      setTimeout(() => {
        setCopied((prev) => ({ ...prev, [platform]: false }));
      }, 2000);
    } catch {
      toast.error("Failed to copy caption");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="size-5 text-primary" />
          AI Caption Generator
        </CardTitle>
        <CardDescription>
          Generate platform-optimized captions for your post.
          {remaining !== null && (
            <span className="ml-1 font-medium">
              {remaining} caption{remaining !== 1 ? "s" : ""} remaining this
              month.
            </span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="linkedin">
          <TabsList className="w-full">
            {PLATFORMS.map((platform) => (
              <TabsTrigger
                key={platform.id}
                value={platform.id}
                className="flex items-center gap-1.5"
              >
                <platform.icon className="size-4" />
                <span className="hidden sm:inline">{platform.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {PLATFORMS.map((platform) => (
            <TabsContent key={platform.id} value={platform.id}>
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <Button
                    onClick={() => generateCaption(platform.id)}
                    disabled={loading[platform.id]}
                    size="sm"
                  >
                    {loading[platform.id] ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Sparkles className="size-4" />
                    )}
                    {loading[platform.id]
                      ? "Generating..."
                      : "Generate Caption"}
                  </Button>

                  {captions[platform.id] && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyCaption(platform.id)}
                    >
                      {copied[platform.id] ? (
                        <Check className="size-4" />
                      ) : (
                        <Copy className="size-4" />
                      )}
                      {copied[platform.id] ? "Copied!" : "Copy"}
                    </Button>
                  )}
                </div>

                <Textarea
                  value={captions[platform.id]}
                  onChange={(e) =>
                    setCaptions((prev) => ({
                      ...prev,
                      [platform.id]: e.target.value,
                    }))
                  }
                  placeholder={`Click "Generate Caption" to create an AI-powered ${platform.label} caption for this post...`}
                  className="min-h-[120px] resize-y"
                  readOnly={loading[platform.id]}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
