"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Linkedin,
  Facebook,
  Twitter,
  MessageCircle,
  Mail,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  getShareIntentUrl,
  getPublicPostUrl,
  SHARE_PLATFORMS,
} from "@/lib/sharing";

interface SharePanelProps {
  postId: string;
  postSlug: string;
  headline: string;
  companyName: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Linkedin,
  Facebook,
  Twitter,
  MessageCircle,
  Mail,
  Copy,
};

const PLATFORM_COLORS: Record<string, string> = {
  linkedin: "bg-[#0A66C2] hover:bg-[#0A66C2]/90 text-white",
  facebook: "bg-[#1877F2] hover:bg-[#1877F2]/90 text-white",
  twitter: "bg-[#000000] hover:bg-[#000000]/90 text-white",
  whatsapp: "bg-[#25D366] hover:bg-[#25D366]/90 text-white",
  email: "bg-muted hover:bg-muted/80 text-foreground",
  copy: "bg-muted hover:bg-muted/80 text-foreground",
};

export function SharePanel({
  postId,
  postSlug,
  headline,
  companyName,
}: SharePanelProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  const publicUrl = getPublicPostUrl(postSlug);
  const shareText = `${headline} — ${companyName}`;

  async function trackShare(platform: string) {
    try {
      await fetch(`/api/posts/${postId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
    } catch {
      // Silently fail — sharing tracking is non-critical
    }
  }

  async function handleShare(platformId: string) {
    if (platformId === "copy") {
      try {
        await navigator.clipboard.writeText(publicUrl);
        setCopiedLink(true);
        toast.success("Link copied to clipboard");
        setTimeout(() => setCopiedLink(false), 2000);
        await trackShare("copy");
      } catch {
        toast.error("Failed to copy link");
      }
      return;
    }

    const shareUrl = getShareIntentUrl(platformId, {
      url: publicUrl,
      title: headline,
      text: shareText,
    });

    window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=500");
    await trackShare(platformId);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold">Share</h3>
        <Badge variant="secondary" className="text-xs">
          Public link
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {SHARE_PLATFORMS.map((platform) => {
          const Icon = ICON_MAP[platform.icon];
          const isCopy = platform.id === "copy";

          return (
            <Button
              key={platform.id}
              variant="ghost"
              className={`flex h-auto flex-col gap-1.5 rounded-lg px-2 py-3 ${PLATFORM_COLORS[platform.id]}`}
              onClick={() => handleShare(platform.id)}
            >
              {isCopy && copiedLink ? (
                <Check className="size-5" />
              ) : (
                Icon && <Icon className="size-5" />
              )}
              <span className="text-[11px] font-medium leading-none">
                {isCopy && copiedLink ? "Copied!" : platform.name}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
