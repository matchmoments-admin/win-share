import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Error codes
// ---------------------------------------------------------------------------

export const ErrorCode = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  RATE_LIMITED: "RATE_LIMITED",
  USAGE_LIMIT_EXCEEDED: "USAGE_LIMIT_EXCEEDED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

// ---------------------------------------------------------------------------
// Status code mapping
// ---------------------------------------------------------------------------

const STATUS_MAP: Record<ErrorCode, number> = {
  [ErrorCode.UNAUTHORIZED]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.RATE_LIMITED]: 429,
  [ErrorCode.USAGE_LIMIT_EXCEEDED]: 403,
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INTERNAL_ERROR]: 500,
};

// ---------------------------------------------------------------------------
// AppError class
// ---------------------------------------------------------------------------

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: ErrorCode,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = STATUS_MAP[code];
    this.details = details;

    // Maintain proper prototype chain for `instanceof` checks.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

export interface ErrorResponseBody {
  error: {
    message: string;
    code: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Format any error into a consistent JSON shape suitable for API responses.
 */
export function formatErrorResponse(error: unknown): ErrorResponseBody {
  if (error instanceof AppError) {
    return {
      error: {
        message: error.message,
        code: error.code,
        ...(error.details ? { details: error.details } : {}),
      },
    };
  }

  // Handle rate-limit errors thrown by `checkRateLimit`
  if (
    error instanceof Error &&
    (error as Error & { code?: string }).code === "RATE_LIMITED"
  ) {
    return {
      error: {
        message: error.message,
        code: "RATE_LIMITED",
        ...((error as Error & { details?: Record<string, unknown> }).details
          ? {
              details: (error as Error & { details: Record<string, unknown> })
                .details,
            }
          : {}),
      },
    };
  }

  // Generic / unexpected errors -- never leak internals in production.
  const message =
    process.env.NODE_ENV === "production"
      ? "An unexpected error occurred"
      : error instanceof Error
        ? error.message
        : String(error);

  return {
    error: {
      message,
      code: ErrorCode.INTERNAL_ERROR,
    },
  };
}

/**
 * Convert any error into a `NextResponse` with the appropriate HTTP status
 * code and a consistent JSON body.
 */
export function handleApiError(error: unknown): NextResponse<ErrorResponseBody> {
  const body = formatErrorResponse(error);

  let status = 500;

  if (error instanceof AppError) {
    status = error.statusCode;
  } else if (
    error instanceof Error &&
    typeof (error as Error & { statusCode?: number }).statusCode === "number"
  ) {
    status = (error as Error & { statusCode: number }).statusCode;
  }

  return NextResponse.json(body, { status });
}
