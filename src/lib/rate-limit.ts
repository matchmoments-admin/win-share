import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ---------------------------------------------------------------------------
// Environment check
// ---------------------------------------------------------------------------

const hasUpstashEnv = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const isProduction = process.env.NODE_ENV === "production";

/**
 * Lazily-initialised Redis client.  Returns `null` when the required env vars
 * are missing so that development environments without Upstash still work.
 */
function getRedis(): Redis | null {
  if (!hasUpstashEnv) {
    if (isProduction) {
      console.warn(
        "[rate-limit] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are not set. Rate limiting is disabled."
      );
    }
    return null;
  }

  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

const redis = getRedis();

// ---------------------------------------------------------------------------
// Limiters
// ---------------------------------------------------------------------------

function buildLimiter(
  tokens: number,
  window: `${number} ${"s" | "m" | "h" | "d"}`,
  prefix: string
): Ratelimit | null {
  if (!redis) return null;

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, window),
    analytics: true,
    prefix,
  });
}

/** General API routes -- 60 requests per minute per user. */
export const apiLimiter = buildLimiter(60, "1 m", "ratelimit:api");

/** Image generation -- 10 requests per minute per user. */
export const generationLimiter = buildLimiter(10, "1 m", "ratelimit:generation");

/** AI caption generation -- 10 requests per minute per user. */
export const captionLimiter = buildLimiter(10, "1 m", "ratelimit:caption");

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check whether the given `identifier` has remaining capacity on `limiter`.
 *
 * - When Upstash is not configured (e.g. local development) the check is
 *   silently skipped and the request is allowed through.
 * - When the rate limit is exceeded an `AppError` with code `RATE_LIMITED` is
 *   thrown so that calling code can simply `await checkRateLimit(...)` without
 *   additional branching.
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<RateLimitResult> {
  // If the limiter is null (Upstash not configured) allow the request.
  if (!limiter) {
    return { success: true, limit: -1, remaining: -1, reset: -1 };
  }

  const result = await limiter.limit(identifier);

  if (!result.success) {
    const error = new Error("Rate limit exceeded. Please try again later.");
    (error as Error & { code: string }).code = "RATE_LIMITED";
    (error as Error & { statusCode: number }).statusCode = 429;
    (error as Error & { details: Record<string, unknown> }).details = {
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
    throw error;
  }

  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
