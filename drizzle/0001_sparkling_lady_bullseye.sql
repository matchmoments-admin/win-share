CREATE TYPE "public"."render_engine" AS ENUM('satori', 'templated_io');--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "platform" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "render_engine" "render_engine" DEFAULT 'satori' NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "archetype" text;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "background_urls" jsonb;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "overlay_zones" jsonb;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "font_family" text DEFAULT 'Inter';--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "headline_color" text DEFAULT '#FFFFFF';--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "subhead_color" text DEFAULT '#FFFFFF';