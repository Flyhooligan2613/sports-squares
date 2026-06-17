import { NextResponse } from "next/server";

/**
 * Lightweight in-memory rate limiter for Vercel serverless.
 * Acceptable for single-instance mitigation on hot paths.
 *
 * Phase 2: replace with Upstash Redis / edge WAF for distributed limits.
 */

type RateLimitConfig = {
  limit: number;
  windowMs: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function resolveClientIpFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const ip = forwarded.split(",")[0]?.trim();
    if (ip) return ip;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true };
  }

  if (entry.count >= config.limit) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }

  entry.count += 1;
  return { allowed: true };
}

export function rateLimitResponse(retryAfterSec?: number): NextResponse {
  const headers: Record<string, string> = {};
  if (retryAfterSec) {
    headers["Retry-After"] = String(retryAfterSec);
  }
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429, headers }
  );
}

export const RATE_LIMITS = {
  signup: { limit: 5, windowMs: 60 * 60 * 1000 },
  login: { limit: 10, windowMs: 15 * 60 * 1000 },
  magicLink: { limit: 5, windowMs: 60 * 60 * 1000 },
  wallet: { limit: 20, windowMs: 60 * 60 * 1000 },
} as const satisfies Record<string, RateLimitConfig>;

export function enforceRateLimit(
  routeKey: string,
  identifier: string,
  config: RateLimitConfig
): NextResponse | null {
  const key = `${routeKey}:${identifier.toLowerCase()}`;
  const result = checkRateLimit(key, config);
  if (!result.allowed) {
    return rateLimitResponse(result.retryAfterSec);
  }
  return null;
}
