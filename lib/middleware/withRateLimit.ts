/**
 * Higher-order function to wrap API routes with rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  rateLimitCourseCreation,
  rateLimitTeacherAssignment,
  rateLimitPermissionUpdate,
  createRateLimitHeaders
} from './rateLimit';
import type { RateLimitResult } from './rateLimit';

export type RateLimitType = 'course_creation' | 'teacher_assignment' | 'permission_update';

export interface RateLimitOptions {
  type: RateLimitType;
  skipForRoles?: string[];
}

/**
 * Wrap an API handler with rate limiting
 */
export function withRateLimit(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
  options: RateLimitOptions
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      const supabase = createClient();

      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Get user profile for role checking
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, role_level')
        .eq('user_id', user.id)
        .single();

      // Skip rate limiting for certain roles if specified
      if (options.skipForRoles && profile?.role && options.skipForRoles.includes(profile.role)) {
        return handler(request, ...args);
      }

      // Apply rate limiting based on type
      let rateLimitResult: RateLimitResult;
      
      switch (options.type) {
        case 'course_creation':
          rateLimitResult = await rateLimitCourseCreation(user.id);
          break;
        case 'teacher_assignment':
          rateLimitResult = await rateLimitTeacherAssignment(user.id);
          break;
        case 'permission_update':
          rateLimitResult = await rateLimitPermissionUpdate(user.id);
          break;
        default:
          throw new Error(`Unknown rate limit type: ${options.type}`);
      }

      // Check if rate limit exceeded
      if (!rateLimitResult.allowed) {
        const headers = createRateLimitHeaders(rateLimitResult);
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            message: `Too many requests. Try again in ${rateLimitResult.retryAfter} seconds.`,
            retryAfter: rateLimitResult.retryAfter
          },
          {
            status: 429,
            headers
          }
        );
      }

      // Call the original handler
      const response = await handler(request, ...args);

      // Add rate limit headers to successful responses
      const headers = createRateLimitHeaders(rateLimitResult);
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error) {
      console.error('Rate limiting error:', error);
      // If rate limiting fails, allow the request to proceed
      return handler(request, ...args);
    }
  };
}

/**
 * Convenience wrapper for course creation endpoints
 */
export function withCourseCreationRateLimit(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return withRateLimit(handler, {
    type: 'course_creation',
    skipForRoles: ['super_admin'] // Super admins bypass rate limits
  });
}

/**
 * Convenience wrapper for teacher assignment endpoints
 */
export function withTeacherAssignmentRateLimit(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return withRateLimit(handler, {
    type: 'teacher_assignment',
    skipForRoles: ['super_admin']
  });
}

/**
 * Convenience wrapper for permission update endpoints
 */
export function withPermissionUpdateRateLimit(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) {
  return withRateLimit(handler, {
    type: 'permission_update',
    skipForRoles: ['super_admin']
  });
}
