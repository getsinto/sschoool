/**
 * Monitoring Helper Functions
 * Feature: course-assignment-permissions
 * 
 * Helper functions to integrate metrics tracking into application code
 * Task 25: Create monitoring and alerting
 */

import { recordMetric, METRICS } from './metrics';

/**
 * Track course creation
 */
export function trackCourseCreation(success: boolean, metadata?: Record<string, any>): void {
  if (success) {
    recordMetric(METRICS.COURSE_CREATED, 1, metadata);
  } else {
    recordMetric(METRICS.COURSE_CREATION_FAILED, 1, metadata);
    recordMetric(METRICS.ERROR_OCCURRED, 1, { ...metadata, operation: 'course_creation' });
  }
}

/**
 * Track course deletion
 */
export function trackCourseDeletion(success: boolean, metadata?: Record<string, any>): void {
  if (success) {
    recordMetric(METRICS.COURSE_DELETED, 1, metadata);
  } else {
    recordMetric(METRICS.ERROR_OCCURRED, 1, { ...metadata, operation: 'course_deletion' });
  }
}

/**
 * Track course publishing
 */
export function trackCoursePublishing(success: boolean, metadata?: Record<string, any>): void {
  if (success) {
    recordMetric(METRICS.COURSE_PUBLISHED, 1, metadata);
  } else {
    recordMetric(METRICS.ERROR_OCCURRED, 1, { ...metadata, operation: 'course_publishing' });
  }
}

/**
 * Track teacher assignment
 */
export function trackTeacherAssignment(success: boolean, metadata?: Record<string, any>): void {
  if (success) {
    recordMetric(METRICS.TEACHER_ASSIGNED, 1, metadata);
  } else {
    recordMetric(METRICS.TEACHER_ASSIGNMENT_FAILED, 1, metadata);
    recordMetric(METRICS.ERROR_OCCURRED, 1, { ...metadata, operation: 'teacher_assignment' });
  }
}

/**
 * Track teacher unassignment
 */
export function trackTeacherUnassignment(success: boolean, metadata?: Record<string, any>): void {
  if (success) {
    recordMetric(METRICS.TEACHER_UNASSIGNED, 1, metadata);
  } else {
    recordMetric(METRICS.ERROR_OCCURRED, 1, { ...metadata, operation: 'teacher_unassignment' });
  }
}

/**
 * Track permission check
 */
export function trackPermissionCheck(
  allowed: boolean,
  permission: string,
  metadata?: Record<string, any>
): void {
  recordMetric(METRICS.PERMISSION_CHECK, 1, { permission, allowed, ...metadata });

  if (!allowed) {
    recordMetric(METRICS.PERMISSION_DENIED, 1, { permission, ...metadata });
  }
}

/**
 * Track permission update
 */
export function trackPermissionUpdate(success: boolean, metadata?: Record<string, any>): void {
  if (success) {
    recordMetric(METRICS.PERMISSION_UPDATED, 1, metadata);
  } else {
    recordMetric(METRICS.ERROR_OCCURRED, 1, { ...metadata, operation: 'permission_update' });
  }
}

/**
 * Track RLS violation
 */
export function trackRLSViolation(operation: string, metadata?: Record<string, any>): void {
  recordMetric(METRICS.RLS_VIOLATION, 1, { operation, ...metadata });

  // Track specific RLS violations
  switch (operation) {
    case 'INSERT':
      recordMetric(METRICS.RLS_COURSE_INSERT_BLOCKED, 1, metadata);
      break;
    case 'UPDATE':
      recordMetric(METRICS.RLS_COURSE_UPDATE_BLOCKED, 1, metadata);
      break;
    case 'DELETE':
      recordMetric(METRICS.RLS_COURSE_DELETE_BLOCKED, 1, metadata);
      break;
  }
}

/**
 * Track rate limit hit
 */
export function trackRateLimitHit(exceeded: boolean, operation: string, metadata?: Record<string, any>): void {
  recordMetric(METRICS.RATE_LIMIT_HIT, 1, { operation, exceeded, ...metadata });

  if (exceeded) {
    recordMetric(METRICS.RATE_LIMIT_EXCEEDED, 1, { operation, ...metadata });
  }
}

/**
 * Track error
 */
export function trackError(error: Error | string, critical: boolean = false, metadata?: Record<string, any>): void {
  const errorMessage = error instanceof Error ? error.message : error;

  recordMetric(METRICS.ERROR_OCCURRED, 1, { error: errorMessage, critical, ...metadata });

  if (critical) {
    recordMetric(METRICS.ERROR_CRITICAL, 1, { error: errorMessage, ...metadata });
  }
}

/**
 * Wrap an async function with error tracking
 */
export function withErrorTracking<T>(
  fn: () => Promise<T>,
  operation: string,
  critical: boolean = false
): Promise<T> {
  return fn().catch((error) => {
    trackError(error, critical, { operation });
    throw error;
  });
}

/**
 * Wrap a permission check with tracking
 */
export function withPermissionTracking<T>(
  checkFn: () => boolean,
  permission: string,
  metadata?: Record<string, any>
): boolean {
  const allowed = checkFn();
  trackPermissionCheck(allowed, permission, metadata);
  return allowed;
}
