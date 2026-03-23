import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import { readFileSync } from "fs";
import { join } from "path";
import { UTApi } from "uploadthing/server";
import { nanoid } from "nanoid";
import type {
  ImageGenerator,
  ImageRenderRequest,
  ImageRenderResult,
  Platform,
} from "./interface";
import { PLATFORM_DIMENSIONS } from "./interface";
import type { OverlayRenderData } from "./archetypes";
import { renderOverlayJsx } from "./overlay-layouts";
import logger from "@/lib/logger";

let cachedFont: ArrayBuffer | null = null;
const utapi = new UTApi();

function loadFont(): ArrayBuffer {
  if (cachedFont) return cachedFont;
  const fontPath = join(process.cwd(), "public", "fonts", "Inter-Bold.woff");
  const buffer = readFileSync(fontPath);
  cachedFont = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  );
  return cachedFont;
}

async function fetchBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const arrayBuf = await res.arrayBuffer();
  return Buffer.from(arrayBuf);
}

function buildDetailLine(data: OverlayRenderData): string {
  const parts: string[] = [];
  const fv = data.fieldValues;

  if (fv.clientName) parts.push(fv.clientName);
  if (fv.loanAmount) parts.push(fv.loanAmount);
  if (fv.propertyAddress) parts.push(fv.propertyAddress);
  if (fv.personName) parts.push(fv.personName);
  if (fv.achievement) parts.push(fv.achievement);
  if (fv.reviewerName) parts.push(`Review from ${fv.reviewerName}`);
  if (fv.milestoneName) parts.push(fv.milestoneName);
  if (fv.milestoneValue) parts.push(fv.milestoneValue);
  if (fv.announcementTitle && !parts.length)
    parts.push(fv.announcementTitle);

  return parts.join(" — ");
}

export class SatoriRenderer implements ImageGenerator {
  async renderImage(request: ImageRenderRequest): Promise<ImageRenderResult> {
    const dimensions = PLATFORM_DIMENSIONS[request.platform];
    const { width, height } = dimensions;
    const archetype = request.archetype ?? "full_photo_overlay";
    const fontData = loadFont();

    // Build overlay render data from layers
    const overlayData = this.buildOverlayData(request);

    // 1. Render JSX overlay via satori → SVG
    const svgString = await satori(
      renderOverlayJsx(archetype, overlayData, width, height),
      {
        width,
        height,
        fonts: [
          {
            name: "Inter",
            data: fontData,
            weight: 700,
            style: "normal",
          },
        ],
      }
    );

    // 2. Rasterize SVG → PNG buffer via resvg
    const resvg = new Resvg(svgString, {
      fitTo: { mode: "width", value: width },
    });
    const overlayPng = resvg.render().asPng();

    // 3. Prepare the base image
    let baseImage: sharp.Sharp;

    if (request.backgroundUrl) {
      // Use template background
      const bgBuffer = await fetchBuffer(request.backgroundUrl);
      baseImage = sharp(bgBuffer).resize(width, height, { fit: "cover" });
    } else if (
      archetype === "full_photo_overlay" &&
      overlayData.heroPhotoUrl
    ) {
      // For full photo overlay, hero photo IS the background
      const heroBuffer = await fetchBuffer(overlayData.heroPhotoUrl);
      baseImage = sharp(heroBuffer).resize(width, height, { fit: "cover" });
    } else {
      // Create a solid color background
      baseImage = sharp({
        create: {
          width,
          height,
          channels: 4,
          background: { r: 247, g: 246, b: 243, alpha: 1 },
        },
      }).png();
    }

    // 4. Build composite layers
    const compositeLayers: sharp.OverlayOptions[] = [];

    // For non-full-photo archetypes, composite hero photo if present
    if (
      archetype !== "full_photo_overlay" &&
      overlayData.heroPhotoUrl
    ) {
      try {
        const heroBuffer = await fetchBuffer(overlayData.heroPhotoUrl);
        // Place hero photo based on archetype
        const photoSize = this.getHeroPhotoSize(archetype, width, height);
        const resizedHero = await sharp(heroBuffer)
          .resize(photoSize.width, photoSize.height, { fit: "cover" })
          .png()
          .toBuffer();
        compositeLayers.push({
          input: resizedHero,
          top: photoSize.top,
          left: photoSize.left,
        });
      } catch (err) {
        logger.warn({ err }, "Failed to composite hero photo");
      }
    }

    // Overlay the satori-rendered text
    compositeLayers.push({
      input: Buffer.from(overlayPng),
      top: 0,
      left: 0,
    });

    // 5. Composite and produce final image
    const finalBuffer = await baseImage
      .composite(compositeLayers)
      .png({ compressionLevel: 6 })
      .toBuffer();

    // 6. Upload to UploadThing
    const fileName = `post-${nanoid(10)}-${request.platform}.png`;
    const blob = new Blob([new Uint8Array(finalBuffer)], { type: "image/png" });
    const file = new File([blob], fileName, { type: "image/png" });
    const uploadResult = await utapi.uploadFiles(file);

    if (!uploadResult.data) {
      throw new Error(
        `Upload failed: ${uploadResult.error?.message ?? "unknown error"}`
      );
    }

    return {
      imageUrl: uploadResult.data.ufsUrl ?? uploadResult.data.url,
      renderId: `satori_${nanoid(8)}`,
      width,
      height,
      format: "png",
    };
  }

  async getTemplates(): Promise<{ id: string; name: string }[]> {
    return [];
  }

  async getTemplateDetails(
    templateId: string
  ): Promise<{ id: string; layers: string[] }> {
    return {
      id: templateId,
      layers: [
        "background",
        "hero_photo",
        "logo",
        "action_verb",
        "headline",
        "detail_line",
        "company_name",
        "watermark",
      ],
    };
  }

  private buildOverlayData(request: ImageRenderRequest): OverlayRenderData {
    const layers = request.layers;
    const fieldValues: Record<string, string> = {};

    // Extract values from layers
    const getValue = (name: string): string =>
      layers.find((l) => l.name === name)?.value ?? "";

    // Build field values from known layer names
    const fieldMappings: Record<string, string> = {
      client_name: "clientName",
      loan_amount: "loanAmount",
      property_address: "propertyAddress",
      lender_name: "lenderName",
      testimonial_quote: "testimonialQuote",
      person_name: "personName",
      achievement_text: "achievement",
      person_title: "title",
      reviewer_name: "reviewerName",
      review_text: "reviewText",
      star_rating: "starRating",
      milestone_name: "milestoneName",
      milestone_value: "milestoneValue",
      announcement_title: "announcementTitle",
      announcement_body: "announcementBody",
    };

    for (const [layerName, fieldName] of Object.entries(fieldMappings)) {
      const val = getValue(layerName);
      if (val) fieldValues[fieldName] = val;
    }

    const overlayData: OverlayRenderData = {
      actionVerb: getValue("action_verb").replace(/^Just\s+/i, "").replace(/!$/, ""),
      headline: getValue("headline"),
      heroPhotoUrl: getValue("hero_photo") || undefined,
      companyName: getValue("company_name") || undefined,
      logoUrl: getValue("logo") || undefined,
      tagline: getValue("tagline") || undefined,
      detailLine: "",
      primaryColor:
        layers.find((l) => l.name === "background")?.color ?? "#111111",
      secondaryColor:
        layers.find((l) => l.name === "accent_bar")?.color ?? "#c9a84c",
      accentColor: "#ffffff",
      headlineColor: request.headlineColor ?? "#FFFFFF",
      subheadColor: request.subheadColor ?? "#FFFFFF",
      watermark: request.watermark,
      fieldValues,
    };

    overlayData.detailLine = buildDetailLine(overlayData);
    return overlayData;
  }

  private getHeroPhotoSize(
    archetype: string,
    canvasWidth: number,
    canvasHeight: number
  ): { width: number; height: number; top: number; left: number } {
    switch (archetype) {
      case "split_layout":
        return {
          width: Math.round(canvasWidth * 0.45),
          height: canvasHeight,
          top: 0,
          left: 0,
        };
      case "minimalist_modern":
        return {
          width: Math.round(canvasWidth * 0.3),
          height: Math.round(canvasWidth * 0.3),
          top: Math.round(canvasHeight - canvasWidth * 0.35),
          left: Math.round(canvasWidth - canvasWidth * 0.35),
        };
      default:
        return {
          width: Math.round(canvasWidth * 0.4),
          height: Math.round(canvasHeight * 0.4),
          top: Math.round(canvasHeight * 0.3),
          left: Math.round(canvasWidth * 0.3),
        };
    }
  }
}

let satoriGenerator: SatoriRenderer | null = null;

export function getSatoriRenderer(): SatoriRenderer {
  if (!satoriGenerator) {
    satoriGenerator = new SatoriRenderer();
  }
  return satoriGenerator;
}
