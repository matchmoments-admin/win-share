# WinPost

AI-powered social media post generator for businesses. Create branded celebration posts, milestones, and team wins with AI captions and templated image generation.

Built with Next.js 15, TypeScript, Tailwind CSS, and PostgreSQL.

## Tech Stack

| Service | Purpose |
|---------|---------|
| **Next.js 15** | App framework (App Router) |
| **Supabase** | PostgreSQL database |
| **Drizzle ORM** | Database queries & migrations |
| **Clerk** | Authentication, users, organizations |
| **Stripe** | Payments & subscriptions |
| **Anthropic (Claude)** | AI caption generation |
| **UploadThing** | File uploads (logos, photos) |
| **Templated.io** | Image rendering |
| **Upstash Redis** | Rate limiting |
| **Sentry** | Error tracking (optional) |

## Prerequisites

- Node.js 18+
- npm
- Accounts for the services listed above (free tiers available for most)

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/matchmoments-admin/win-share.git
cd win-share
npm install
cp .env.example .env.local
```

Open `.env.local` and fill in each value as you complete the steps below.

### 2. Supabase (Database)

**Dashboard:** https://supabase.com/dashboard

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings > Database**
3. Copy the **Connection string (URI)** under "Connection pooling" (port 6543) → `DATABASE_URL`
4. Copy the **Direct connection** string (port 5432) → `DIRECT_URL`

```env
DATABASE_URL="postgresql://postgres.xxxx:password@aws-0-xx.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.xxxx:password@aws-0-xx.supabase.co:5432/postgres"
```

Push the schema:

```bash
npx drizzle-kit push
```

### 3. Clerk (Authentication)

**Dashboard:** https://dashboard.clerk.com

1. Create an application — enable **Email** and **Google** sign-in
2. Go to **API Keys** → copy Publishable Key and Secret Key
3. Enable **Organizations** in the left sidebar (critical for multi-tenant scoping)
4. Set up a **Webhook** endpoint:
   - Local: `https://YOUR-NGROK.ngrok-free.app/api/webhooks/clerk`
   - Production: `https://yourdomain.com/api/webhooks/clerk`
   - Subscribe to: `organization.created`, `user.created`, `organizationMembership.created`
   - Copy the **Signing Secret**

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"
```

### 4. Stripe (Payments)

**Dashboard:** https://dashboard.stripe.com

1. Stay in **Test Mode**
2. Go to **Developers > API Keys** → copy keys
3. Create 3 products with **recurring monthly** prices:

| Product | Price |
|---------|-------|
| WinPost Starter | $29/mo |
| WinPost Pro | $79/mo |
| WinPost Team | $199/mo |

4. Copy each **Price ID** (starts with `price_`)
5. Set up a **Webhook** endpoint:
   - URL: `https://YOUR-NGROK.ngrok-free.app/api/webhooks/stripe` (local) or `https://yourdomain.com/api/webhooks/stripe` (prod)
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`
   - Copy the **Signing secret**

```env
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID_STARTER="price_..."
STRIPE_PRICE_ID_PRO="price_..."
STRIPE_PRICE_ID_TEAM="price_..."
```

### 5. Anthropic (AI Captions)

**Console:** https://console.anthropic.com

1. Create an API key and add billing ($5 minimum)

```env
ANTHROPIC_API_KEY="sk-ant-..."
```

### 6. UploadThing (File Uploads)

**Dashboard:** https://uploadthing.com/dashboard

1. Create an app → go to **API Keys** → copy the Token

```env
UPLOADTHING_TOKEN="eyJ..."
```

### 7. Templated.io (Image Generation)

**Dashboard:** https://app.templated.io

1. Go to **Settings > API Keys** → copy the key

```env
TEMPLATED_API_KEY="..."
```

### 8. Upstash Redis (Rate Limiting) — Recommended

**Console:** https://console.upstash.com

1. Create a Redis database
2. Copy the REST URL and Token

```env
UPSTASH_REDIS_REST_URL="https://xxxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXxx..."
```

Rate limiting is silently disabled in dev if not configured.

### 9. Sentry (Error Tracking) — Optional

**Dashboard:** https://sentry.io

1. Create a Next.js project → copy the DSN

```env
SENTRY_DSN="https://xxx@oXXX.ingest.sentry.io/XXX"
NEXT_PUBLIC_SENTRY_DSN="https://xxx@oXXX.ingest.sentry.io/XXX"
SENTRY_AUTH_TOKEN="sntrys_..."
```

### 10. App URL

```env
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Change to your domain in production.

## Running the App

```bash
# Push DB schema
npx drizzle-kit push

# Start dev server
npm run dev
```

Open http://localhost:3000.

## Local Webhook Testing

Both Clerk and Stripe need to reach your local server. Use ngrok:

```bash
brew install ngrok
ngrok http 3000
```

Use the `https://xxxx.ngrok-free.app` URL as the base for webhook endpoints.

**Alternative for Stripe** — use the Stripe CLI:

```bash
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## First-Time Flow

1. Sign up → Clerk creates user
2. Create an organization → webhook creates org + brand_settings + free subscription
3. Go to `/brand` → set up company branding
4. Go to `/create` → generate your first post

## Verification Checklist

- [ ] `npx drizzle-kit push` — schema applied without errors
- [ ] `npm run build` — zero build errors
- [ ] `npm run dev` — app starts on localhost:3000
- [ ] Sign up via Clerk → check DB has `users` + `organizations` rows
- [ ] Go to `/brand` → upload a logo (tests UploadThing)
- [ ] Go to `/create` → generate a post (tests Templated.io + DB writes)
- [ ] Generate an AI caption (tests Anthropic)
- [ ] Go to `/billing` → start checkout (tests Stripe)
- [ ] Hit generate endpoint rapidly (tests Upstash rate limiting)
- [ ] `curl -I http://localhost:3000` → verify security headers present
