CREATE TYPE "public"."activity_type" AS ENUM('post_created', 'post_shared', 'post_downloaded', 'post_deleted', 'brand_updated', 'template_created', 'review_request_sent', 'subscription_changed');--> statement-breakpoint
CREATE TYPE "public"."asset_type" AS ENUM('logo', 'photo', 'icon');--> statement-breakpoint
CREATE TYPE "public"."content_category" AS ENUM('business_win', 'thank_you', 'shout_out', 'team_people', 'review_highlight', 'business_milestone', 'announcement');--> statement-breakpoint
CREATE TYPE "public"."image_format" AS ENUM('png', 'jpg', 'webp');--> statement-breakpoint
CREATE TYPE "public"."industry" AS ENUM('mortgage_broker', 'real_estate', 'insurance', 'financial_planning', 'cleaning', 'landscaping', 'trades', 'automotive', 'health_wellness', 'other');--> statement-breakpoint
CREATE TYPE "public"."plan_tier" AS ENUM('free', 'starter', 'pro', 'team');--> statement-breakpoint
CREATE TYPE "public"."platform" AS ENUM('instagram_feed', 'instagram_story', 'linkedin', 'facebook', 'twitter');--> statement-breakpoint
CREATE TYPE "public"."post_status" AS ENUM('draft', 'generated', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."review_request_status" AS ENUM('pending', 'sent', 'clicked', 'completed');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'past_due', 'canceled', 'trialing', 'incomplete');--> statement-breakpoint
CREATE TYPE "public"."usage_event_type" AS ENUM('post_generated', 'ai_caption', 'template_created');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('owner', 'admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."webhook_source" AS ENUM('clerk', 'stripe');--> statement-breakpoint
CREATE TABLE "activity_log" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text,
	"type" "activity_type" NOT NULL,
	"resource_id" text,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text,
	"type" "asset_type" NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_size" integer,
	"mime_type" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"company_name" text,
	"tagline" text,
	"logo_url" text,
	"primary_color" text DEFAULT '#1e3a5f' NOT NULL,
	"secondary_color" text DEFAULT '#c9a84c' NOT NULL,
	"accent_color" text DEFAULT '#ffffff' NOT NULL,
	"background_color" text DEFAULT '#f5f5f5' NOT NULL,
	"contact_phone" text,
	"contact_email" text,
	"contact_website" text,
	"social_instagram" text,
	"social_linkedin" text,
	"social_facebook" text,
	"social_twitter" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_snapshots" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"logo_url" text,
	"primary_color" text NOT NULL,
	"secondary_color" text NOT NULL,
	"accent_color" text NOT NULL,
	"company_name" text,
	"display_phone" text,
	"display_email" text,
	"display_website" text,
	"tagline" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generated_images" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"platform" "platform" NOT NULL,
	"image_url" text NOT NULL,
	"cdn_url" text,
	"width" integer,
	"height" integer,
	"templated_render_id" text,
	"format" "image_format" DEFAULT 'png' NOT NULL,
	"file_size" integer,
	"is_watermarked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generated_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"template_id" text,
	"category" "content_category" NOT NULL,
	"action_verb" text NOT NULL,
	"headline" text NOT NULL,
	"status" "post_status" DEFAULT 'generated' NOT NULL,
	"slug" text NOT NULL,
	"hero_photo_url" text,
	"view_count" integer DEFAULT 0 NOT NULL,
	"share_count" integer DEFAULT 0 NOT NULL,
	"download_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "generated_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"clerk_org_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text,
	"industry" "industry" DEFAULT 'other' NOT NULL,
	"logo_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_clerk_org_id_unique" UNIQUE("clerk_org_id"),
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "post_field_values" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text NOT NULL,
	"field_name" text NOT NULL,
	"field_value" text NOT NULL,
	"field_type" text DEFAULT 'text' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"post_id" text,
	"client_name" text,
	"client_email" text,
	"review_platform" text NOT NULL,
	"review_url" text NOT NULL,
	"status" "review_request_status" DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp with time zone,
	"clicked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"plan_tier" "plan_tier" DEFAULT 'free' NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"monthly_post_limit" integer DEFAULT 3 NOT NULL,
	"monthly_caption_limit" integer DEFAULT 5 NOT NULL,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_layer_mappings" (
	"id" text PRIMARY KEY NOT NULL,
	"template_id" text NOT NULL,
	"layer_name" text NOT NULL,
	"field_source" text NOT NULL,
	"default_value" text,
	"transform_type" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text,
	"name" text NOT NULL,
	"category" "content_category" NOT NULL,
	"industry" "industry",
	"platform" "platform" NOT NULL,
	"templated_io_id" text,
	"thumbnail_url" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_events" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text,
	"event_type" "usage_event_type" NOT NULL,
	"resource_id" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"clerk_user_id" text NOT NULL,
	"organization_id" text,
	"email" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"avatar_url" text,
	"role" "user_role" DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"id" text PRIMARY KEY NOT NULL,
	"source" "webhook_source" NOT NULL,
	"event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"processed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_settings" ADD CONSTRAINT "brand_settings_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_snapshots" ADD CONSTRAINT "brand_snapshots_post_id_generated_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."generated_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_images" ADD CONSTRAINT "generated_images_post_id_generated_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."generated_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_posts" ADD CONSTRAINT "generated_posts_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_posts" ADD CONSTRAINT "generated_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_posts" ADD CONSTRAINT "generated_posts_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_field_values" ADD CONSTRAINT "post_field_values_post_id_generated_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."generated_posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_requests" ADD CONSTRAINT "review_requests_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_requests" ADD CONSTRAINT "review_requests_post_id_generated_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."generated_posts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_layer_mappings" ADD CONSTRAINT "template_layer_mappings_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_events" ADD CONSTRAINT "usage_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_org_idx" ON "activity_log" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "activity_type_idx" ON "activity_log" USING btree ("type");--> statement-breakpoint
CREATE INDEX "activity_created_idx" ON "activity_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "assets_org_idx" ON "assets" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "assets_type_idx" ON "assets" USING btree ("type");--> statement-breakpoint
CREATE UNIQUE INDEX "brand_settings_org_idx" ON "brand_settings" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "brand_snapshot_post_idx" ON "brand_snapshots" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "gen_images_post_idx" ON "generated_images" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "gen_images_platform_idx" ON "generated_images" USING btree ("platform");--> statement-breakpoint
CREATE INDEX "posts_org_idx" ON "generated_posts" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "posts_user_idx" ON "generated_posts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "posts_category_idx" ON "generated_posts" USING btree ("category");--> statement-breakpoint
CREATE INDEX "posts_slug_idx" ON "generated_posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "posts_created_idx" ON "generated_posts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "pfv_post_idx" ON "post_field_values" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "review_requests_org_idx" ON "review_requests" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "review_requests_post_idx" ON "review_requests" USING btree ("post_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_org_idx" ON "subscriptions" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "subscriptions_stripe_cust_idx" ON "subscriptions" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "tlm_template_idx" ON "template_layer_mappings" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "templates_org_idx" ON "templates" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "templates_category_idx" ON "templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "templates_industry_idx" ON "templates" USING btree ("industry");--> statement-breakpoint
CREATE INDEX "usage_events_org_created_idx" ON "usage_events" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "usage_events_type_idx" ON "usage_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "users_org_idx" ON "users" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "webhook_events_source_event_idx" ON "webhook_events" USING btree ("source","event_id");