/**
 * Course Permissions Monitoring and Metrics
 * Task 25: Create monitoring and alerting
 * 
 * Tracks metrics for:
 * - Course creation rate
 * - Teacher assignment rate
 * - Permission check failures
 * - RLS policy violations
 */

import { createClient } from '@/lib/supabase/server';

export interface PermissionMetric {
  metric_name: string;
  metric_value: number;
  metric_type: 'counter' | 'gauge' | 'histogram';
  labels?: Record<string, string>;
  timestamp: Date;
}

export interface AlertConfig {
  name: string;
  condition: (metrics: PermissionMetric[]) => boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

// Metric names
export const METRICS = {
  COURSE_CREATION: 'course_creation_total',
  COURSE_CREATION_RATE: 'course_creation_rate_per_hour',
  TEACHER_ASSIGNMENT: 'teacher_assignment_total',
  TEACHER_ASSIGNMENT_RATE: 'teacher_assignment_rate_per_hour',
  PERMISSION_CHECK_FAILURE: 'permission_check_failure_total',
  PERMISSION_CHECK_SUCCESS: 'permission_check_success_total',
  RLS_VIOLATION: 'rls_policy_violation_total',
  PERMISSION_UPDATE: 'permission_update_total',
  COURSE_DELETION: 'course_deletion_total',
} as const;

/**
 * Record a metric to the database
 */
export async function recordMetric(
  metricName: string,
  value: number = 1,
  metricType: 'counter' | 'gauge' | 'histogram' = 'counter',
  labels?: Record<string, string>
): Promise<void> {
  try {
    const supabase = await createClient();
    
    await supabase.from('permission_metrics').insert({
      metric_name: metricName,
      metric_value: value,
      metric_type: metricType,
      labels: labels || {},
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to record metric:', error);
    // Don't throw - metrics should not break application flow
  }
}

/**
 * Record course creation metric
 */
export async function recordCourseCreation(
  userId: string,
  userRole: string,
  success: boolean
): Promise<void> {
  await recordMetric(
    METRICS.COURSE_CREATION,
    1,
    'counter',
    {
      user_id: userId,
      user_role: userRole,
      success: success.toString()
    }
  );
}

/**
 * Record teacher assignment metric
 */
export async function recordTeacherAssignment(
  courseId: string,
  teacherId: string,
  assignedBy: string,
  success: boolean
): Promise<void> {
  await recordMetric(
    METRICS.TEACHER_ASSIGNMENT,
    1,
    'counter',
    {
      course_id: courseId,
      teacher_id: teacherId,
      assigned_by: assignedBy,
      success: success.toString()
    }
  );
}

/**
 * Record permission check result
 */
export async function recordPermissionCheck(
  userId: string,
  permission: string,
  resource: string,
  granted: boolean
): Promise<void> {
  const metricName = granted 
    ? METRICS.PERMISSION_CHECK_SUCCESS 
    : METRICS.PERMISSION_CHECK_FAILURE;
    
  await recordMetric(
    metricName,
    1,
    'counter',
    {
      user_id: userId,
      permission,
      resource
    }
  );
}

/**
 * Record RLS policy violation
 */
export async function recordRLSViolation(
  userId: string,
  table: string,
  operation: string,
  details?: string
): Promise<void> {
  await recordMetric(
    METRICS.RLS_VIOLATION,
    1,
    'counter',
    {
      user_id: userId,
      table,
      operation,
      details: details || 'unknown'
    }
  );
}

/**
 * Record permission update
 */
export async function recordPermissionUpdate(
  assignmentId: string,
  updatedBy: string,
  changes: Record<string, any>
): Promise<void> {
  await recordMetric(
    METRICS.PERMISSION_UPDATE,
    1,
    'counter',
    {
      assignment_id: assignmentId,
      updated_by: updatedBy,
      changes: JSON.stringify(changes)
    }
  );
}

/**
 * Get metrics for a time range
 */
export async function getMetrics(
  metricName: string,
  startTime: Date,
  endTime: Date,
  labels?: Record<string, string>
): Promise<PermissionMetric[]> {
  const supabase = await createClient();
  
  let query = supabase
    .from('permission_metrics')
    .select('*')
    .eq('metric_name', metricName)
    .gte('timestamp', startTime.toISOString())
    .lte('timestamp', endTime.toISOString())
    .order('timestamp', { ascending: false });
  
  if (labels) {
    query = query.contains('labels', labels);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Failed to fetch metrics:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Calculate rate per hour for a metric
 */
export async function calculateRatePerHour(
  metricName: string,
  hours: number = 1
): Promise<number> {
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);
  
  const metrics = await getMetrics(metricName, startTime, endTime);
  const total = metrics.reduce((sum, m) => sum + m.metric_value, 0);
  
  return total / hours;
}

/**
 * Get aggregated metrics summary
 */
export async function getMetricsSummary(hours: number = 24): Promise<{
  courseCreationRate: number;
  teacherAssignmentRate: number;
  permissionCheckFailureRate: number;
  rlsViolationCount: number;
  totalCourseCreations: number;
  totalTeacherAssignments: number;
}> {
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);
  
  const [
    courseCreations,
    teacherAssignments,
    permissionFailures,
    rlsViolations
  ] = await Promise.all([
    getMetrics(METRICS.COURSE_CREATION, startTime, endTime),
    getMetrics(METRICS.TEACHER_ASSIGNMENT, startTime, endTime),
    getMetrics(METRICS.PERMISSION_CHECK_FAILURE, startTime, endTime),
    getMetrics(METRICS.RLS_VIOLATION, startTime, endTime)
  ]);
  
  const totalCourseCreations = courseCreations.reduce((sum, m) => sum + m.metric_value, 0);
  const totalTeacherAssignments = teacherAssignments.reduce((sum, m) => sum + m.metric_value, 0);
  const totalPermissionFailures = permissionFailures.reduce((sum, m) => sum + m.metric_value, 0);
  const totalRLSViolations = rlsViolations.reduce((sum, m) => sum + m.metric_value, 0);
  
  return {
    courseCreationRate: totalCourseCreations / hours,
    teacherAssignmentRate: totalTeacherAssignments / hours,
    permissionCheckFailureRate: totalPermissionFailures / hours,
    rlsViolationCount: totalRLSViolations,
    totalCourseCreations,
    totalTeacherAssignments
  };
}

/**
 * Alert configurations
 */
export const ALERT_CONFIGS: AlertConfig[] = [
  {
    name: 'high_permission_failure_rate',
    condition: (metrics) => {
      const failures = metrics.filter(m => m.metric_name === METRICS.PERMISSION_CHECK_FAILURE);
      const total = failures.reduce((sum, m) => sum + m.metric_value, 0);
      return total > 100; // More than 100 failures in the time window
    },
    severity: 'high',
    message: 'High rate of permission check failures detected'
  },
  {
    name: 'rls_violations_detected',
    condition: (metrics) => {
      const violations = metrics.filter(m => m.metric_name === METRICS.RLS_VIOLATION);
      return violations.length > 0; // Any RLS violation is critical
    },
    severity: 'critical',
    message: 'RLS policy violations detected - potential security issue'
  },
  {
    name: 'high_course_creation_rate',
    condition: (metrics) => {
      const creations = metrics.filter(m => m.metric_name === METRICS.COURSE_CREATION);
      const total = creations.reduce((sum, m) => sum + m.metric_value, 0);
      return total > 50; // More than 50 courses created per hour
    },
    severity: 'medium',
    message: 'Unusually high course creation rate detected'
  },
  {
    name: 'high_assignment_rate',
    condition: (metrics) => {
      const assignments = metrics.filter(m => m.metric_name === METRICS.TEACHER_ASSIGNMENT);
      const total = assignments.reduce((sum, m) => sum + m.metric_value, 0);
      return total > 200; // More than 200 assignments per hour
    },
    severity: 'medium',
    message: 'Unusually high teacher assignment rate detected'
  }
];

/**
 * Check for alerts based on recent metrics
 */
export async function checkAlerts(hours: number = 1): Promise<{
  alert: AlertConfig;
  metrics: PermissionMetric[];
}[]> {
  const endTime = new Date();
  const startTime = new Date(endTime.getTime() - hours * 60 * 60 * 1000);
  
  // Fetch all relevant metrics
  const allMetrics = await Promise.all(
    Object.values(METRICS).map(metricName => 
      getMetrics(metricName, startTime, endTime)
    )
  );
  
  const flatMetrics = allMetrics.flat();
  
  // Check each alert condition
  const triggeredAlerts = ALERT_CONFIGS
    .filter(config => config.condition(flatMetrics))
    .map(alert => ({
      alert,
      metrics: flatMetrics
    }));
  
  return triggeredAlerts;
}

/**
 * Send alert notification (placeholder - integrate with your notification system)
 */
export async function sendAlert(
  alert: AlertConfig,
  metrics: PermissionMetric[]
): Promise<void> {
  console.warn(`[ALERT - ${alert.severity.toUpperCase()}] ${alert.name}: ${alert.message}`);
  console.warn('Metrics:', metrics);
  
  // TODO: Integrate with actual notification system (email, Slack, PagerDuty, etc.)
  // For now, just log to console
}
