// ============================================================
// GAS™ MVP — API Response Conventions
// All API routes must use these helpers for consistency.
// ============================================================

import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { AppError, isAppError } from "@/lib/errors"
import { logger } from "@/lib/logger"
import type { ApiMeta } from "@/types"

// ---- Success Responses -------------------------------------

/** 200 OK with data */
export function ok<T>(data: T, meta?: ApiMeta): NextResponse {
  return NextResponse.json({ data, ...(meta ? { meta } : {}) }, { status: 200 })
}

/** 201 Created with data */
export function created<T>(data: T): NextResponse {
  return NextResponse.json({ data }, { status: 201 })
}

/** 204 No Content */
export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

// ---- Error Responses ----------------------------------------

/** Generic error response */
export function errorResponse(
  message: string,
  status: number,
  code?: string,
  details?: Record<string, string[]>
): NextResponse {
  return NextResponse.json(
    { error: message, ...(code ? { code } : {}), ...(details ? { details } : {}) },
    { status }
  )
}

export const errors = {
  badRequest: (message = "Bad request", details?: Record<string, string[]>) =>
    errorResponse(message, 400, "BAD_REQUEST", details),

  unauthorized: (message = "Authentication required") =>
    errorResponse(message, 401, "UNAUTHORIZED"),

  forbidden: (message = "Access denied") =>
    errorResponse(message, 403, "FORBIDDEN"),

  notFound: (resource = "Resource") =>
    errorResponse(`${resource} not found`, 404, "NOT_FOUND"),

  conflict: (message: string) =>
    errorResponse(message, 409, "CONFLICT"),

  unprocessable: (message: string, details?: Record<string, string[]>) =>
    errorResponse(message, 422, "UNPROCESSABLE", details),

  rateLimited: (message = "Too many requests") =>
    errorResponse(message, 429, "RATE_LIMITED"),

  internal: (message = "Internal server error") =>
    errorResponse(message, 500, "INTERNAL_ERROR"),
}

// ---- Central Error Handler ---------------------------------

/**
 * Wraps any thrown error into a consistent API response.
 * Use in every API route catch block:
 *   catch (error) { return handleApiError(error) }
 */
export function handleApiError(error: unknown, context?: string): NextResponse {
  logger.apiError(error, context)

  // Zod validation error
  if (error instanceof ZodError) {
    const details: Record<string, string[]> = {}
    for (const issue of error.issues) {
      const key = issue.path.join(".") || "root"
      if (!details[key]) details[key] = []
      details[key].push(issue.message)
    }
    return errors.badRequest("Validation failed", details)
  }

  // Known app errors
  if (isAppError(error)) {
    return errorResponse(
      error.message,
      error.statusCode,
      error.code,
      "details" in error ? (error as { details?: Record<string, string[]> }).details : undefined
    )
  }

  // Unknown error — never leak internals
  return errors.internal()
}

// ---- Paginated Response Helper -----------------------------

export function paginated<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): NextResponse {
  return ok(items, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  })
}
