export interface ImageRenderRequest {
  templateId: string;
  layers: LayerData[];
  platform: Platform;
  watermark: boolean;
}

export interface LayerData {
  name: string;
  type: "text" | "image" | "shape";
  value: string;
  color?: string;
  fontSize?: number;
  visible?: boolean;
}

export interface ImageRenderResult {
  imageUrl: string;
  renderId: string;
  width: number;
  height: number;
  format: "png" | "jpg" | "webp";
}

export type Platform =
  | "instagram_feed"
  | "instagram_story"
  | "linkedin"
  | "facebook"
  | "twitter";

export interface ImageGenerator {
  renderImage(request: ImageRenderRequest): Promise<ImageRenderResult>;
  getTemplates(): Promise<{ id: string; name: string }[]>;
  getTemplateDetails(
    templateId: string
  ): Promise<{ id: string; layers: string[] }>;
}

export const PLATFORM_DIMENSIONS: Record<
  Platform,
  { width: number; height: number }
> = {
  instagram_feed: { width: 1080, height: 1080 },
  instagram_story: { width: 1080, height: 1920 },
  linkedin: { width: 1200, height: 627 },
  facebook: { width: 1200, height: 630 },
  twitter: { width: 1600, height: 900 },
};
