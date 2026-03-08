const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export interface ShareData {
  url: string;
  title: string;
  text: string;
}

export function getPublicPostUrl(slug: string): string {
  return `${APP_URL}/p/${slug}`;
}

export function getShareIntentUrl(
  platform: string,
  data: ShareData
): string {
  const encodedUrl = encodeURIComponent(data.url);
  const encodedText = encodeURIComponent(data.text);
  const encodedTitle = encodeURIComponent(data.title);

  switch (platform) {
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    case "twitter":
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
    case "whatsapp":
      return `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
    case "email":
      return `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`;
    default:
      return data.url;
  }
}

export const SHARE_PLATFORMS = [
  { id: "linkedin", name: "LinkedIn", icon: "Linkedin" },
  { id: "facebook", name: "Facebook", icon: "Facebook" },
  { id: "twitter", name: "Twitter / X", icon: "Twitter" },
  { id: "whatsapp", name: "WhatsApp", icon: "MessageCircle" },
  { id: "email", name: "Email", icon: "Mail" },
  { id: "copy", name: "Copy Link", icon: "Copy" },
] as const;
