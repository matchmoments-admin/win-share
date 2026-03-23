/**
 * Seed script: generates background images via sharp (saved to /public),
 * then inserts satori-powered templates into the database.
 *
 * Usage: export $(grep -v '^#' .env.local | xargs) && npx tsx scripts/seed-templates.ts
 */

import sharp from "sharp";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { nanoid } from "nanoid";
import { mkdirSync, existsSync } from "fs";
import { join } from "path";
import * as schema from "../src/lib/db/schema";

const BG_DIR = join(process.cwd(), "public", "template-backgrounds");

const RATIOS = {
  instagram_feed: { width: 1080, height: 1080 },
  instagram_story: { width: 1080, height: 1920 },
  linkedin: { width: 1200, height: 630 },
  twitter: { width: 1600, height: 900 },
} as const;

type PlatformKey = keyof typeof RATIOS;
const PLATFORMS: PlatformKey[] = [
  "instagram_feed",
  "instagram_story",
  "linkedin",
  "twitter",
];

// --- Background generators ---

async function generateMinimalistBg(
  width: number,
  height: number,
  outputPath: string
) {
  const accentHeight = Math.round(height * 0.005);
  const accent = await sharp({
    create: {
      width,
      height: accentHeight,
      channels: 4,
      background: { r: 201, g: 168, b: 76, alpha: 1 },
    },
  })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 247, g: 246, b: 243, alpha: 1 },
    },
  })
    .composite([{ input: accent, top: height - accentHeight, left: 0 }])
    .png()
    .toFile(outputPath);
}

async function generateAnnouncementBg(
  width: number,
  height: number,
  outputPath: string
) {
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 232, g: 230, b: 225, alpha: 1 },
    },
  })
    .png()
    .toFile(outputPath);
}

// --- Main ---

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL not set");

  if (!existsSync(BG_DIR)) mkdirSync(BG_DIR, { recursive: true });

  const sql = postgres(dbUrl);
  const db = drizzle(sql, { schema });

  console.log("Generating background images to /public/template-backgrounds/\n");

  // Generate backgrounds for minimalist_modern
  const minimalistBgUrls: Record<string, string> = {};
  for (const platform of PLATFORMS) {
    const { width, height } = RATIOS[platform];
    const filename = `minimalist-${platform}.png`;
    await generateMinimalistBg(width, height, join(BG_DIR, filename));
    minimalistBgUrls[platform] = `/template-backgrounds/${filename}`;
    console.log(`  minimalist_modern / ${platform}: ${filename}`);
  }

  // Generate backgrounds for announcement_card
  const announcementBgUrls: Record<string, string> = {};
  for (const platform of PLATFORMS) {
    const { width, height } = RATIOS[platform];
    const filename = `announcement-${platform}.png`;
    await generateAnnouncementBg(width, height, join(BG_DIR, filename));
    announcementBgUrls[platform] = `/template-backgrounds/${filename}`;
    console.log(`  announcement_card / ${platform}: ${filename}`);
  }

  console.log("\nSeeding templates into database...\n");

  const templateDefs = [
    {
      name: "Bold Photo Overlay",
      category: "business_win" as const,
      archetype: "full_photo_overlay",
      renderEngine: "satori" as const,
      backgroundUrls: null,
      headlineColor: "#FFFFFF",
      subheadColor: "#FFFFFF",
    },
    {
      name: "Modern Minimal",
      category: "business_win" as const,
      archetype: "minimalist_modern",
      renderEngine: "satori" as const,
      backgroundUrls: minimalistBgUrls,
      headlineColor: "#111111",
      subheadColor: "#787774",
    },
    {
      name: "Announcement Card",
      category: "announcement" as const,
      archetype: "announcement_card",
      renderEngine: "satori" as const,
      backgroundUrls: announcementBgUrls,
      headlineColor: "#111111",
      subheadColor: "#787774",
    },
  ];

  for (const tpl of templateDefs) {
    const id = `tpl_${nanoid()}`;
    await db.insert(schema.templates).values({
      id,
      name: tpl.name,
      category: tpl.category,
      renderEngine: tpl.renderEngine,
      archetype: tpl.archetype,
      backgroundUrls: tpl.backgroundUrls,
      headlineColor: tpl.headlineColor,
      subheadColor: tpl.subheadColor,
      fontFamily: "Inter",
      isSystem: true,
      isActive: true,
    });
    console.log(`  Inserted: ${tpl.name} (${id})`);
  }

  console.log("\nDone! 3 satori templates seeded.");
  await sql.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
