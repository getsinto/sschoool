/**
 * Rate Limiting Middleware
 * Implements token bucket algorithm for API rate limiting
 */

import { createClient } from '@/lib/supabase/server';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyPrefix: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

/**
 * Check rate limit for a user and operation
 */
export async function checkRateLimit(
  userId: string,
  operation: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const key = `${config.keyPrefix}:${userId}:${operation}`;
  const now = Date.now();
  
  // Get or create rate limit entry
  let entry = rateLimitStore.get(key);
  
  // Reset if window has expired
  if (!entry || now > entry.resetAt) {
    entry = {
      count: 0,
      resetAt: now + config.windowMs
    };
    rateLimitStore.set(key, entry);
  }
  
  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(entry.resetAt),
      retryAfter
    };
  }
  
  // Increment counter
  entry.count++;
  
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: new Date(entry.resetAt)
  };
}

/**
 * Rate limit for course creation (10 per hour per admin)
 */
export async function rateLimitCourseCreation(userId: string): Promise<RateLimitResult> {
  return checkRateLimit(userId, 'course_creation', {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    keyPrefix: 'ratelimit'
  });
}

/**
 * Rate limit for teacher assignments (50 per hour per admin)
 */
export async function rateLimitTeacherAssignment(userId: string): Promise<RateLimitResult> {
  return checkRateLimit(userId, 'teacher_assignment', {
    maxRequests: 50,
    windowMs: 60 * 60 * 1000, // 1 hour
    keyPrefix: 'ratelimit'
  });
}

/**
 * Rate limit for permission updates (100 per hour per admin)
 */
export async function rateLimitPermissionUpdate(userId: string): Promise<RateLimitResult> {
  return checkRateLimit(userId, 'permission_update', {
    maxRequests: 100,
    windowMs: 60 * 60 * 1000, // 1 hour
    keyPrefix: 'ratelimit'
  });
}

/**
 * Create rate limit headers for HTTP responses
 */
export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(result.remaining + (result.allowed ? 1 : 0)),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': result.resetAt.toISOString()
  };
  
  if (result.retryAfter) {
    headers['Retry-After'] = String(result.retryAfter);
  }
  
  return headers;
}

/**
 * Cleanup expired entries from rate limit store
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
}

/**
 * Rate limit for category creation (5 per minute per admin)
 * Implements Task 13.3
 */
export async function rateLimitCategoryCreation(userId: string): Promise<RateLimitResult> {
  return checkRateLimit(userId, 'category_creation', {
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: 'ratelimit'
  });
}

/**
 * Rate limit for file uploads (20 per hour per user)
 * Implements Task 13.3
 */
export async function rateLimitFileUpload(userId: string): Promise<RateLimitResult> {
  return checkRateLimit(userId, 'file_upload', {
    maxRequests: 20,
    windowMs: 60 * 60 * 1000, // 1 hour
    keyPrefix: 'ratelimit'
  });
}

/**
 * Rate limit for category updates (10 per minute per admin)
 * Implements Task 13.3
 */
export async function rateLimitCategoryUpdate(userId: string): Promise<RateLimitResult> {
  return checkRateLimit(userId, 'category_update', {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: 'ratelimit'
  });
}
