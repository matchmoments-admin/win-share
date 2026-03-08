-- ============================================================================
-- WinPost: Row Level Security (RLS) Policies
-- ============================================================================
-- Multi-tenant RLS using Clerk JWT org_id claim via Supabase request headers.
-- Service role key bypasses RLS automatically (Supabase default).
--
-- Run this migration AFTER creating all tables.
-- ============================================================================

-- ============================================================================
-- Helper function: extract the org_id from the Clerk JWT
-- ============================================================================
-- Supabase exposes JWT claims via current_setting('request.jwt.claims').
-- Clerk populates org_id when a user is acting within an organization context.
-- Returns NULL when there is no JWT or no org_id claim (anonymous / service).
-- ============================================================================

CREATE OR REPLACE FUNCTION requesting_org_id()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::json->>'org_id',
    ''
  )
$$;

-- Convenience: extract the authenticated user's Clerk user ID
CREATE OR REPLACE FUNCTION requesting_user_id()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  )
$$;


-- ============================================================================
-- 1. ORGANIZATIONS
-- ============================================================================
-- Users can only see/manage the organization they belong to.
-- The org row's clerk_org_id must match the JWT's org_id.
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "organizations_select"
  ON organizations FOR SELECT
  TO authenticated
  USING (clerk_org_id = requesting_org_id());

CREATE POLICY "organizations_insert"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (clerk_org_id = requesting_org_id());

CREATE POLICY "organizations_update"
  ON organizations FOR UPDATE
  TO authenticated
  USING (clerk_org_id = requesting_org_id())
  WITH CHECK (clerk_org_id = requesting_org_id());

CREATE POLICY "organizations_delete"
  ON organizations FOR DELETE
  TO authenticated
  USING (clerk_org_id = requesting_org_id());


-- ============================================================================
-- 2. USERS
-- ============================================================================
-- Scoped via organization_id -> organizations.clerk_org_id
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_select"
  ON users FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );

CREATE POLICY "users_insert"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );

CREATE POLICY "users_update"
  ON users FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );

CREATE POLICY "users_delete"
  ON users FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );


-- ============================================================================
-- 3. BRAND SETTINGS
-- ============================================================================
-- Directly scoped by organization_id
-- ============================================================================

ALTER TABLE brand_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brand_settings_select"
  ON brand_settings FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );

CREATE POLICY "brand_settings_insert"
  ON brand_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );

CREATE POLICY "brand_settings_update"
  ON brand_settings FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );

CREATE POLICY "brand_settings_delete"
  ON brand_settings FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );


-- ============================================================================
-- 4. TEMPLATES
-- ============================================================================
-- Org-scoped templates: organization_id matches the requesting org.
-- System templates (is_system = true): readable by ALL authenticated users,
-- but only writable via service role (no INSERT/UPDATE/DELETE policies for
-- system templates since those bypass RLS).
-- ============================================================================

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- SELECT: org-owned templates OR system templates
CREATE POLICY "templates_select"
  ON templates FOR SELECT
  TO authenticated
  USING (
    is_system = true
    OR organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );

-- INSERT: only into the user's own org (system templates created by service role)
CREATE POLICY "templates_insert"
  ON templates FOR INSERT
  TO authenticated
  WITH CHECK (
    is_system = false
    AND organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );

-- UPDATE: only org-owned templates (not system templates)
CREATE POLICY "templates_update"
  ON templates FOR UPDATE
  TO authenticated
  USING (
    is_system = false
    AND organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  )
  WITH CHECK (
    is_system = false
    AND organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );

-- DELETE: only org-owned templates (not system templates)
CREATE POLICY "templates_delete"
  ON templates FOR DELETE
  TO authenticated
  USING (
    is_system = false
    AND organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );


-- ============================================================================
-- 5. TEMPLATE LAYER MAPPINGS
-- ============================================================================
-- Scoped via template_id -> templates.organization_id
-- System template layer mappings are readable by all authenticated users.
-- ============================================================================

ALTER TABLE template_layer_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "template_layer_mappings_select"
  ON template_layer_mappings FOR SELECT
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM templates
      WHERE is_system = true
        OR organization_id IN (
          SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
        )
    )
  );

CREATE POLICY "template_layer_mappings_insert"
  ON template_layer_mappings FOR INSERT
  TO authenticated
  WITH CHECK (
    template_id IN (
      SELECT id FROM templates
      WHERE is_system = false
        AND organization_id IN (
          SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
        )
    )
  );

CREATE POLICY "template_layer_mappings_update"
  ON template_layer_mappings FOR UPDATE
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM templates
      WHERE is_system = false
        AND organization_id IN (
          SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
        )
    )
  )
  WITH CHECK (
    template_id IN (
      SELECT id FROM templates
      WHERE is_system = false
        AND organization_id IN (
          SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
        )
    )
  );

CREATE POLICY "template_layer_mappings_delete"
  ON template_layer_mappings FOR DELETE
  TO authenticated
  USING (
    template_id IN (
      SELECT id FROM templates
      WHERE is_system = false
        AND organization_id IN (
          SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
        )
    )
  );


-- ============================================================================
-- 6. GENERATED POSTS
-- ============================================================================
-- Directly scoped by organization_id
-- ============================================================================

ALTER TABLE generated_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "generated_posts_select"
  ON generated_posts FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );

CREATE POLICY "generated_posts_insert"
  ON generated_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );

CREATE POLICY "generated_posts_update"
  ON generated_posts FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );

CREATE POLICY "generated_posts_delete"
  ON generated_posts FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );


-- ============================================================================
-- 7. GENERATED IMAGES
-- ============================================================================
-- Scoped via post_id -> generated_posts.organization_id
-- ============================================================================

ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "generated_images_select"
  ON generated_images FOR SELECT
  TO authenticated
  USING (
    post_id IN (
      SELECT id FROM generated_posts
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
      )
    )
  );

CREATE POLICY "generated_images_insert"
  ON generated_images FOR INSERT
  TO authenticated
  WITH CHECK (
    post_id IN (
      SELECT id FROM generated_posts
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
      )
    )
  );

CREATE POLICY "generated_images_update"
  ON generated_images FOR UPDATE
  TO authenticated
  USING (
    post_id IN (
      SELECT id FROM generated_posts
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
      )
    )
  )
  WITH CHECK (
    post_id IN (
      SELECT id FROM generated_posts
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
      )
    )
  );

CREATE POLICY "generated_images_delete"
  ON generated_images FOR DELETE
  TO authenticated
  USING (
    post_id IN (
      SELECT id FROM generated_posts
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
      )
    )
  );


-- ============================================================================
-- 8. POST FIELD VALUES
-- ============================================================================
-- Scoped via post_id -> generated_posts.organization_id
-- ============================================================================

ALTER TABLE post_field_values ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post_field_values_select"
  ON post_field_values FOR SELECT
  TO authenticated
  USING (
    post_id IN (
      SELECT id FROM generated_posts
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
      )
    )
  );

CREATE POLICY "post_field_values_insert"
  ON post_field_values FOR INSERT
  TO authenticated
  WITH CHECK (
    post_id IN (
      SELECT id FROM generated_posts
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
      )
    )
  );

CREATE POLICY "post_field_values_update"
  ON post_field_values FOR UPDATE
  TO authenticated
  USING (
    post_id IN (
      SELECT id FROM generated_posts
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
      )
    )
  )
  WITH CHECK (
    post_id IN (
      SELECT id FROM generated_posts
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
      )
    )
  );

CREATE POLICY "post_field_values_delete"
  ON post_field_values FOR DELETE
  TO authenticated
  USING (
    post_id IN (
      SELECT id FROM generated_posts
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
      )
    )
  );


-- ============================================================================
-- 9. BRAND SNAPSHOTS
-- ============================================================================
-- Scoped via post_id -> generated_posts.organization_id
-- ============================================================================

ALTER TABLE brand_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brand_snapshots_select"
  ON brand_snapshots FOR SELECT
  TO authenticated
  USING (
    post_id IN (
      SELECT id FROM generated_posts
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
      )
    )
  );

CREATE POLICY "brand_snapshots_insert"
  ON brand_snapshots FOR INSERT
  TO authenticated
  WITH CHECK (
    post_id IN (
      SELECT id FROM generated_posts
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
      )
    )
  );

CREATE POLICY "brand_snapshots_update"
  ON brand_snapshots FOR UPDATE
  TO authenticated
  USING (
    post_id IN (
      SELECT id FROM generated_posts
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
      )
    )
  )
  WITH CHECK (
    post_id IN (
      SELECT id FROM generated_posts
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
      )
    )
  );

CREATE POLICY "brand_snapshots_delete"
  ON brand_snapshots FOR DELETE
  TO authenticated
  USING (
    post_id IN (
      SELECT id FROM generated_posts
      WHERE organization_id IN (
        SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
      )
    )
  );


-- ============================================================================
-- 10. ASSETS
-- ============================================================================
-- Directly scoped by organization_id
-- ============================================================================

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assets_select"
  ON assets FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );

CREATE POLICY "assets_insert"
  ON assets FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );

CREATE POLICY "assets_update"
  ON assets FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );

CREATE POLICY "assets_delete"
  ON assets FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );


-- ============================================================================
-- 11. REVIEW REQUESTS
-- ============================================================================
-- Directly scoped by organization_id
-- ============================================================================

ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "review_requests_select"
  ON review_requests FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );

CREATE POLICY "review_requests_insert"
  ON review_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );

CREATE POLICY "review_requests_update"
  ON review_requests FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );

CREATE POLICY "review_requests_delete"
  ON review_requests FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );


-- ============================================================================
-- 12. SUBSCRIPTIONS
-- ============================================================================
-- Directly scoped by organization_id
-- ============================================================================

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions_select"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );

CREATE POLICY "subscriptions_insert"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );

CREATE POLICY "subscriptions_update"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );

CREATE POLICY "subscriptions_delete"
  ON subscriptions FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );


-- ============================================================================
-- 13. ACTIVITY LOG
-- ============================================================================
-- Directly scoped by organization_id
-- ============================================================================

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_log_select"
  ON activity_log FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );

CREATE POLICY "activity_log_insert"
  ON activity_log FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );

CREATE POLICY "activity_log_update"
  ON activity_log FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );

CREATE POLICY "activity_log_delete"
  ON activity_log FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );


-- ============================================================================
-- 14. USAGE EVENTS
-- ============================================================================
-- Directly scoped by organization_id
-- ============================================================================

ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usage_events_select"
  ON usage_events FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );

CREATE POLICY "usage_events_insert"
  ON usage_events FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );

CREATE POLICY "usage_events_update"
  ON usage_events FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );

CREATE POLICY "usage_events_delete"
  ON usage_events FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE clerk_org_id = requesting_org_id()
    )
  );


-- ============================================================================
-- 15. WEBHOOK EVENTS
-- ============================================================================
-- RLS enabled but NO policies for authenticated users.
-- Only the service role key (which bypasses RLS) should access this table.
-- This prevents any authenticated user from reading or writing webhook data.
-- ============================================================================

ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- No policies created intentionally. Service role bypasses RLS.


-- ============================================================================
-- NOTES
-- ============================================================================
--
-- 1. SECURITY MODEL
--    Every query from the client (using anon or authenticated JWT) is filtered
--    by the org_id embedded in the Clerk JWT. The Supabase service_role key
--    bypasses all RLS, so server-side operations (webhooks, cron jobs, admin
--    tasks) are unaffected.
--
-- 2. CLERK JWT CONFIGURATION
--    Ensure your Clerk JWT template for Supabase includes:
--      {
--        "org_id": "{{org.id}}",
--        "sub": "{{user.id}}",
--        ...
--      }
--
-- 3. ORGANIZATION ID RESOLUTION
--    The organizations table uses its own internal `id` (prefixed `org_`) as
--    primary key, but the RLS matching is done on `clerk_org_id` which holds
--    the Clerk-provided organization ID from the JWT. All child tables
--    reference `organizations.id` (internal), so policies resolve through a
--    subquery: organization_id IN (SELECT id FROM organizations WHERE
--    clerk_org_id = requesting_org_id()).
--
-- 4. PERFORMANCE
--    The subquery pattern `SELECT id FROM organizations WHERE clerk_org_id = ?`
--    is efficient because clerk_org_id has a UNIQUE index. Postgres will plan
--    this as an index lookup returning at most one row.
--
-- 5. SYSTEM TEMPLATES
--    Templates with is_system = true are readable by all authenticated users
--    regardless of organization. Only the service role can create/modify/delete
--    system templates. Org-owned templates require is_system = false for all
--    write operations.
--
-- 6. JOINED TABLES (generated_images, post_field_values, brand_snapshots,
--    template_layer_mappings)
--    These tables don't have a direct organization_id column. Policies use
--    nested subqueries to resolve org ownership through their parent tables.
--
-- ============================================================================
