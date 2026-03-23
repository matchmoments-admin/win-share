import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
  index,
  uniqueIndex,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { nanoid } from "nanoid";

// ============================================================================
// Enums
// ============================================================================

export const userRoleEnum = pgEnum("user_role", ["owner", "admin", "member"]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "past_due",
  "canceled",
  "trialing",
  "incomplete",
]);

export const planTierEnum = pgEnum("plan_tier", [
  "free",
  "starter",
  "pro",
  "team",
]);

export const postStatusEnum = pgEnum("post_status", [
  "draft",
  "generated",
  "published",
  "archived",
]);

export const platformEnum = pgEnum("platform", [
  "instagram_feed",
  "instagram_story",
  "linkedin",
  "facebook",
  "twitter",
]);

export const contentCategoryEnum = pgEnum("content_category", [
  "business_win",
  "thank_you",
  "shout_out",
  "team_people",
  "review_highlight",
  "business_milestone",
  "announcement",
]);

export const industryEnum = pgEnum("industry", [
  "mortgage_broker",
  "real_estate",
  "insurance",
  "financial_planning",
  "cleaning",
  "landscaping",
  "trades",
  "automotive",
  "health_wellness",
  "other",
]);

export const assetTypeEnum = pgEnum("asset_type", ["logo", "photo", "icon"]);

export const activityTypeEnum = pgEnum("activity_type", [
  "post_created",
  "post_shared",
  "post_downloaded",
  "post_deleted",
  "brand_updated",
  "template_created",
  "review_request_sent",
  "subscription_changed",
]);

export const usageEventTypeEnum = pgEnum("usage_event_type", [
  "post_generated",
  "ai_caption",
  "template_created",
]);

export const webhookSourceEnum = pgEnum("webhook_source", [
  "clerk",
  "stripe",
]);

export const reviewRequestStatusEnum = pgEnum("review_request_status", [
  "pending",
  "sent",
  "clicked",
  "completed",
]);

export const imageFormatEnum = pgEnum("image_format", [
  "png",
  "jpg",
  "webp",
]);

export const renderEngineEnum = pgEnum("render_engine", [
  "satori",
  "templated_io",
]);

// ============================================================================
// Helper: generate prefixed nanoid
// ============================================================================

const id = (prefix: string) =>
  text("id")
    .primaryKey()
    .$defaultFn(() => `${prefix}_${nanoid()}`);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
};

// ============================================================================
// 1. Organizations
// ============================================================================

export const organizations = pgTable("organizations", {
  id: id("org"),
  clerkOrgId: text("clerk_org_id").notNull().unique(),
  name: text("name").notNull(),
  slug: text("slug").unique(),
  industry: industryEnum("industry").default("other").notNull(),
  logoUrl: text("logo_url"),
  ...timestamps,
});

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  brandSettings: many(brandSettings),
  templates: many(templates),
  generatedPosts: many(generatedPosts),
  assets: many(assets),
  reviewRequests: many(reviewRequests),
  subscriptions: many(subscriptions),
  activityLog: many(activityLog),
  usageEvents: many(usageEvents),
}));

// ============================================================================
// 2. Users
// ============================================================================

export const users = pgTable(
  "users",
  {
    id: id("usr"),
    clerkUserId: text("clerk_user_id").notNull().unique(),
    organizationId: text("organization_id").references(
      () => organizations.id,
      { onDelete: "cascade" }
    ),
    email: text("email").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    avatarUrl: text("avatar_url"),
    role: userRoleEnum("role").default("member").notNull(),
    ...timestamps,
  },
  (table) => [index("users_org_idx").on(table.organizationId)]
);

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  generatedPosts: many(generatedPosts),
  usageEvents: many(usageEvents),
}));

// ============================================================================
// 3. Brand Settings
// ============================================================================

export const brandSettings = pgTable(
  "brand_settings",
  {
    id: id("brd"),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    companyName: text("company_name"),
    tagline: text("tagline"),
    logoUrl: text("logo_url"),
    primaryColor: text("primary_color").default("#1e3a5f").notNull(),
    secondaryColor: text("secondary_color").default("#c9a84c").notNull(),
    accentColor: text("accent_color").default("#ffffff").notNull(),
    backgroundColor: text("background_color").default("#f5f5f5").notNull(),
    contactPhone: text("contact_phone"),
    contactEmail: text("contact_email"),
    contactWebsite: text("contact_website"),
    socialInstagram: text("social_instagram"),
    socialLinkedin: text("social_linkedin"),
    socialFacebook: text("social_facebook"),
    socialTwitter: text("social_twitter"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("brand_settings_org_idx").on(table.organizationId),
  ]
);

export const brandSettingsRelations = relations(brandSettings, ({ one }) => ({
  organization: one(organizations, {
    fields: [brandSettings.organizationId],
    references: [organizations.id],
  }),
}));

// ============================================================================
// 4. Templates
// ============================================================================

export const templates = pgTable(
  "templates",
  {
    id: id("tpl"),
    organizationId: text("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    category: contentCategoryEnum("category").notNull(),
    industry: industryEnum("industry"),
    platform: platformEnum("platform"),
    templatedIoId: text("templated_io_id"),
    thumbnailUrl: text("thumbnail_url"),
    isSystem: boolean("is_system").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    // Satori renderer fields
    renderEngine: renderEngineEnum("render_engine").default("satori").notNull(),
    archetype: text("archetype"),
    backgroundUrls: jsonb("background_urls"),
    overlayZones: jsonb("overlay_zones"),
    fontFamily: text("font_family").default("Inter"),
    headlineColor: text("headline_color").default("#FFFFFF"),
    subheadColor: text("subhead_color").default("#FFFFFF"),
    ...timestamps,
  },
  (table) => [
    index("templates_org_idx").on(table.organizationId),
    index("templates_category_idx").on(table.category),
    index("templates_industry_idx").on(table.industry),
  ]
);

export const templatesRelations = relations(templates, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [templates.organizationId],
    references: [organizations.id],
  }),
  layerMappings: many(templateLayerMappings),
}));

// ============================================================================
// 5. Template Layer Mappings
// ============================================================================

export const templateLayerMappings = pgTable(
  "template_layer_mappings",
  {
    id: id("tlm"),
    templateId: text("template_id")
      .notNull()
      .references(() => templates.id, { onDelete: "cascade" }),
    layerName: text("layer_name").notNull(),
    fieldSource: text("field_source").notNull(),
    defaultValue: text("default_value"),
    transformType: text("transform_type"),
    ...timestamps,
  },
  (table) => [index("tlm_template_idx").on(table.templateId)]
);

export const templateLayerMappingsRelations = relations(
  templateLayerMappings,
  ({ one }) => ({
    template: one(templates, {
      fields: [templateLayerMappings.templateId],
      references: [templates.id],
    }),
  })
);

// ============================================================================
// 6. Generated Posts
// ============================================================================

export const generatedPosts = pgTable(
  "generated_posts",
  {
    id: id("pst"),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    templateId: text("template_id").references(() => templates.id, {
      onDelete: "set null",
    }),
    category: contentCategoryEnum("category").notNull(),
    actionVerb: text("action_verb").notNull(),
    headline: text("headline").notNull(),
    status: postStatusEnum("status").default("generated").notNull(),
    slug: text("slug").notNull().unique(),
    heroPhotoUrl: text("hero_photo_url"),
    viewCount: integer("view_count").default(0).notNull(),
    shareCount: integer("share_count").default(0).notNull(),
    downloadCount: integer("download_count").default(0).notNull(),
    ...timestamps,
  },
  (table) => [
    index("posts_org_idx").on(table.organizationId),
    index("posts_user_idx").on(table.userId),
    index("posts_category_idx").on(table.category),
    index("posts_slug_idx").on(table.slug),
    index("posts_created_idx").on(table.createdAt),
  ]
);

export const generatedPostsRelations = relations(
  generatedPosts,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [generatedPosts.organizationId],
      references: [organizations.id],
    }),
    user: one(users, {
      fields: [generatedPosts.userId],
      references: [users.id],
    }),
    template: one(templates, {
      fields: [generatedPosts.templateId],
      references: [templates.id],
    }),
    images: many(generatedImages),
    fieldValues: many(postFieldValues),
    brandSnapshot: many(brandSnapshots),
  })
);

// ============================================================================
// 7. Generated Images (replaces JSONB generatedImages)
// ============================================================================

export const generatedImages = pgTable(
  "generated_images",
  {
    id: id("img"),
    postId: text("post_id")
      .notNull()
      .references(() => generatedPosts.id, { onDelete: "cascade" }),
    platform: platformEnum("platform").notNull(),
    imageUrl: text("image_url").notNull(),
    cdnUrl: text("cdn_url"),
    width: integer("width"),
    height: integer("height"),
    templatedRenderId: text("templated_render_id"),
    format: imageFormatEnum("format").default("png").notNull(),
    fileSize: integer("file_size"),
    isWatermarked: boolean("is_watermarked").default(false).notNull(),
    ...timestamps,
  },
  (table) => [
    index("gen_images_post_idx").on(table.postId),
    index("gen_images_platform_idx").on(table.platform),
  ]
);

export const generatedImagesRelations = relations(
  generatedImages,
  ({ one }) => ({
    post: one(generatedPosts, {
      fields: [generatedImages.postId],
      references: [generatedPosts.id],
    }),
  })
);

// ============================================================================
// 8. Post Field Values (replaces JSONB fieldValues)
// ============================================================================

export const postFieldValues = pgTable(
  "post_field_values",
  {
    id: id("pfv"),
    postId: text("post_id")
      .notNull()
      .references(() => generatedPosts.id, { onDelete: "cascade" }),
    fieldName: text("field_name").notNull(),
    fieldValue: text("field_value").notNull(),
    fieldType: text("field_type").default("text").notNull(),
    ...timestamps,
  },
  (table) => [index("pfv_post_idx").on(table.postId)]
);

export const postFieldValuesRelations = relations(
  postFieldValues,
  ({ one }) => ({
    post: one(generatedPosts, {
      fields: [postFieldValues.postId],
      references: [generatedPosts.id],
    }),
  })
);

// ============================================================================
// 9. Brand Snapshots (replaces JSONB brandSnapshot)
// ============================================================================

export const brandSnapshots = pgTable(
  "brand_snapshots",
  {
    id: id("bsn"),
    postId: text("post_id")
      .notNull()
      .references(() => generatedPosts.id, { onDelete: "cascade" }),
    logoUrl: text("logo_url"),
    primaryColor: text("primary_color").notNull(),
    secondaryColor: text("secondary_color").notNull(),
    accentColor: text("accent_color").notNull(),
    companyName: text("company_name"),
    displayPhone: text("display_phone"),
    displayEmail: text("display_email"),
    displayWebsite: text("display_website"),
    tagline: text("tagline"),
    ...timestamps,
  },
  (table) => [uniqueIndex("brand_snapshot_post_idx").on(table.postId)]
);

export const brandSnapshotsRelations = relations(
  brandSnapshots,
  ({ one }) => ({
    post: one(generatedPosts, {
      fields: [brandSnapshots.postId],
      references: [generatedPosts.id],
    }),
  })
);

// ============================================================================
// 10. Assets
// ============================================================================

export const assets = pgTable(
  "assets",
  {
    id: id("ast"),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    type: assetTypeEnum("type").notNull(),
    fileName: text("file_name").notNull(),
    fileUrl: text("file_url").notNull(),
    fileSize: integer("file_size"),
    mimeType: text("mime_type"),
    ...timestamps,
  },
  (table) => [
    index("assets_org_idx").on(table.organizationId),
    index("assets_type_idx").on(table.type),
  ]
);

export const assetsRelations = relations(assets, ({ one }) => ({
  organization: one(organizations, {
    fields: [assets.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [assets.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// 11. Review Requests
// ============================================================================

export const reviewRequests = pgTable(
  "review_requests",
  {
    id: id("rvw"),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    postId: text("post_id").references(() => generatedPosts.id, {
      onDelete: "set null",
    }),
    clientName: text("client_name"),
    clientEmail: text("client_email"),
    reviewPlatform: text("review_platform").notNull(),
    reviewUrl: text("review_url").notNull(),
    status: reviewRequestStatusEnum("status").default("pending").notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    clickedAt: timestamp("clicked_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index("review_requests_org_idx").on(table.organizationId),
    index("review_requests_post_idx").on(table.postId),
  ]
);

export const reviewRequestsRelations = relations(
  reviewRequests,
  ({ one }) => ({
    organization: one(organizations, {
      fields: [reviewRequests.organizationId],
      references: [organizations.id],
    }),
    post: one(generatedPosts, {
      fields: [reviewRequests.postId],
      references: [generatedPosts.id],
    }),
  })
);

// ============================================================================
// 12. Subscriptions
// ============================================================================

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: id("sub"),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    planTier: planTierEnum("plan_tier").default("free").notNull(),
    status: subscriptionStatusEnum("status").default("active").notNull(),
    monthlyPostLimit: integer("monthly_post_limit").default(3).notNull(),
    monthlyCaptionLimit: integer("monthly_caption_limit").default(5).notNull(),
    currentPeriodStart: timestamp("current_period_start", {
      withTimezone: true,
    }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end")
      .default(false)
      .notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("subscriptions_org_idx").on(table.organizationId),
    index("subscriptions_stripe_cust_idx").on(table.stripeCustomerId),
  ]
);

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  organization: one(organizations, {
    fields: [subscriptions.organizationId],
    references: [organizations.id],
  }),
}));

// ============================================================================
// 13. Activity Log
// ============================================================================

export const activityLog = pgTable(
  "activity_log",
  {
    id: id("act"),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    type: activityTypeEnum("type").notNull(),
    resourceId: text("resource_id"),
    description: text("description"),
    ...timestamps,
  },
  (table) => [
    index("activity_org_idx").on(table.organizationId),
    index("activity_type_idx").on(table.type),
    index("activity_created_idx").on(table.createdAt),
  ]
);

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  organization: one(organizations, {
    fields: [activityLog.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [activityLog.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// 14. Usage Events (replaces postsUsedThisMonth counter)
// ============================================================================

export const usageEvents = pgTable(
  "usage_events",
  {
    id: id("uev"),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    eventType: usageEventTypeEnum("event_type").notNull(),
    resourceId: text("resource_id"),
    metadata: jsonb("metadata"),
    ...timestamps,
  },
  (table) => [
    index("usage_events_org_created_idx").on(
      table.organizationId,
      table.createdAt
    ),
    index("usage_events_type_idx").on(table.eventType),
  ]
);

export const usageEventsRelations = relations(usageEvents, ({ one }) => ({
  organization: one(organizations, {
    fields: [usageEvents.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [usageEvents.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// 15. Webhook Events (idempotency tracking)
// ============================================================================

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: id("whk"),
    source: webhookSourceEnum("source").notNull(),
    eventId: text("event_id").notNull(),
    eventType: text("event_type").notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("webhook_events_source_event_idx").on(
      table.source,
      table.eventId
    ),
  ]
);
