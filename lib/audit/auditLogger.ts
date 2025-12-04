/**
 * Audit Logging Utility
 * Provides functions to log permission-sensitive operations
 */

import { createClient } from '@/lib/supabase/server';

export type AuditAction =
  | 'course_created'
  | 'course_updated'
  | 'course_deleted'
  | 'course_published'
  | 'course_unpublished'
  | 'teacher_assigned'
  | 'teacher_unassigned'
  | 'permission_updated'
  | 'permission_granted'
  | 'permission_revoked';

export type ResourceType = 'course' | 'course_assignment' | 'permission';

export interface AuditLogEntry {
  userId: string;
  userEmail: string;
  userRole: string;
  action: AuditAction;
  resourceType: ResourceType;
  resourceId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export interface AuditLogFilter {
  userId?: string;
  action?: AuditAction;
  resourceType?: ResourceType;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

/**
 * Log an audit event
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<{ success: boolean; logId?: string; error?: string }> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.rpc('log_audit_event', {
      p_user_id: entry.userId,
      p_user_email: entry.userEmail,
      p_user_role: entry.userRole,
      p_action: entry.action,
      p_resource_type: entry.resourceType,
      p_resource_id: entry.resourceId,
      p_old_values: entry.oldValues || null,
      p_new_values: entry.newValues || null,
      p_ip_address: entry.ipAddress || null,
      p_user_agent: entry.userAgent || null,
      p_metadata: entry.metadata || {}
    });

    if (error) {
      console.error('Audit log error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, logId: data };
  } catch (error) {
    console.error('Audit log exception:', error);
    return { success: false, error: 'Failed to log audit event' };
  }
}

/**
 * Log course creation
 */
export async function logCourseCreation(
  userId: string,
  userEmail: string,
  userRole: string,
  courseId: string,
  courseData: Record<string, any>,
  request?: Request
): Promise<void> {
  await logAuditEvent({
    userId,
    userEmail,
    userRole,
    action: 'course_created',
    resourceType: 'course',
    resourceId: courseId,
    newValues: courseData,
    ipAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
    userAgent: request?.headers.get('user-agent') || undefined
  });
}

/**
 * Log course deletion
 */
export async function logCourseDeletion(
  userId: string,
  userEmail: string,
  userRole: string,
  courseId: string,
  courseData: Record<string, any>,
  request?: Request
): Promise<void> {
  await logAuditEvent({
    userId,
    userEmail,
    userRole,
    action: 'course_deleted',
    resourceType: 'course',
    resourceId: courseId,
    oldValues: courseData,
    ipAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
    userAgent: request?.headers.get('user-agent') || undefined
  });
}

/**
 * Log teacher assignment
 */
export async function logTeacherAssignment(
  adminId: string,
  adminEmail: string,
  adminRole: string,
  assignmentId: string,
  teacherId: string,
  courseId: string,
  permissions: Record<string, boolean>,
  request?: Request
): Promise<void> {
  await logAuditEvent({
    userId: adminId,
    userEmail: adminEmail,
    userRole: adminRole,
    action: 'teacher_assigned',
    resourceType: 'course_assignment',
    resourceId: assignmentId,
    newValues: {
      teacher_id: teacherId,
      course_id: courseId,
      ...permissions
    },
    metadata: {
      teacher_id: teacherId,
      course_id: courseId
    },
    ipAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
    userAgent: request?.headers.get('user-agent') || undefined
  });
}

/**
 * Log teacher unassignment
 */
export async function logTeacherUnassignment(
  adminId: string,
  adminEmail: string,
  adminRole: string,
  assignmentId: string,
  teacherId: string,
  courseId: string,
  oldPermissions: Record<string, boolean>,
  request?: Request
): Promise<void> {
  await logAuditEvent({
    userId: adminId,
    userEmail: adminEmail,
    userRole: adminRole,
    action: 'teacher_unassigned',
    resourceType: 'course_assignment',
    resourceId: assignmentId,
    oldValues: {
      teacher_id: teacherId,
      course_id: courseId,
      ...oldPermissions
    },
    metadata: {
      teacher_id: teacherId,
      course_id: courseId
    },
    ipAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
    userAgent: request?.headers.get('user-agent') || undefined
  });
}

/**
 * Log permission update
 */
export async function logPermissionUpdate(
  adminId: string,
  adminEmail: string,
  adminRole: string,
  assignmentId: string,
  teacherId: string,
  courseId: string,
  oldPermissions: Record<string, boolean>,
  newPermissions: Record<string, boolean>,
  request?: Request
): Promise<void> {
  await logAuditEvent({
    userId: adminId,
    userEmail: adminEmail,
    userRole: adminRole,
    action: 'permission_updated',
    resourceType: 'course_assignment',
    resourceId: assignmentId,
    oldValues: oldPermissions,
    newValues: newPermissions,
    metadata: {
      teacher_id: teacherId,
      course_id: courseId,
      changes: Object.keys(newPermissions).filter(
        key => oldPermissions[key] !== newPermissions[key]
      )
    },
    ipAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
    userAgent: request?.headers.get('user-agent') || undefined
  });
}

/**
 * Query audit logs
 */
export async function queryAuditLogs(filter: AuditLogFilter = {}): Promise<{
  success: boolean;
  logs?: any[];
  error?: string;
}> {
  try {
    const supabase = createClient();

    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter.userId) {
      query = query.eq('user_id', filter.userId);
    }

    if (filter.action) {
      query = query.eq('action', filter.action);
    }

    if (filter.resourceType) {
      query = query.eq('resource_type', filter.resourceType);
    }

    if (filter.resourceId) {
      query = query.eq('resource_id', filter.resourceId);
    }

    if (filter.startDate) {
      query = query.gte('created_at', filter.startDate.toISOString());
    }

    if (filter.endDate) {
      query = query.lte('created_at', filter.endDate.toISOString());
    }

    if (filter.limit) {
      query = query.limit(filter.limit);
    } else {
      query = query.limit(100); // Default limit
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, logs: data };
  } catch (error) {
    console.error('Query audit logs error:', error);
    return { success: false, error: 'Failed to query audit logs' };
  }
}

/**
 * Get audit log summary
 */
export async function getAuditLogSummary(): Promise<{
  success: boolean;
  summary?: any[];
  error?: string;
}> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('audit_log_summary')
      .select('*')
      .order('count', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, summary: data };
  } catch (error) {
    console.error('Get audit log summary error:', error);
    return { success: false, error: 'Failed to get audit log summary' };
  }
}
