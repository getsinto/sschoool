/**
 * Monitoring and Metrics Tracking
 * Feature: course-assignment-permissions
 * 
 * Provides metrics tracking for course assignment operations
 * Task 25: Create monitoring and alerting
 */

// Metrics storage (in-memory for now, should be replaced with proper metrics service)
interface MetricData {
  timestamp: number;
  value: number;
  metadata?: Record<string, any>;
}

class MetricsCollector {
  private metrics: Map<string, MetricData[]> = new Map();
  private readonly MAX_METRICS_PER_TYPE = 1000; // Prevent memory overflow

  /**
   * Record a metric
   */
  record(metricName: string, value: number = 1, metadata?: Record<string, any>): void {
    const metrics = this.metrics.get(metricName) || [];
    
    metrics.push({
      timestamp: Date.now(),
      value,
      metadata
    });

    // Keep only recent metrics
    if (metrics.length > this.MAX_METRICS_PER_TYPE) {
      metrics.shift();
    }

    this.metrics.set(metricName, metrics);
  }

  /**
   * Get metrics for a specific name
   */
  getMetrics(metricName: string, since?: number): MetricData[] {
    const metrics = this.metrics.get(metricName) || [];
    
    if (since) {
      return metrics.filter(m => m.timestamp >= since);
    }
    
    return metrics;
  }

  /**
   * Get metric count
   */
  getCount(metricName: string, since?: number): number {
    const metrics = this.getMetrics(metricName, since);
    return metrics.reduce((sum, m) => sum + m.value, 0);
  }

  /**
   * Get metric rate (per minute)
   */
  getRate(metricName: string, windowMinutes: number = 60): number {
    const since = Date.now() - (windowMinutes * 60 * 1000);
    const count = this.getCount(metricName, since);
    return count / windowMinutes;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics.clear();
  }

  /**
   * Get all metric names
   */
  getMetricNames(): string[] {
    return Array.from(this.metrics.keys());
  }

  /**
   * Get summary of all metrics
   */
  getSummary(): Record<string, { count: number; rate: number }> {
    const summary: Record<string, { count: number; rate: number }> = {};
    
    for (const name of this.getMetricNames()) {
      summary[name] = {
        count: this.getCount(name),
        rate: this.getRate(name)
      };
    }
    
    return summary;
  }
}

// Singleton instance
const metrics = new MetricsCollector();

// Metric names
export const METRICS = {
  // Course operations
  COURSE_CREATED: 'course.created',
  COURSE_CREATION_FAILED: 'course.creation.failed',
  COURSE_DELETED: 'course.deleted',
  COURSE_PUBLISHED: 'course.published',
  
  // Teacher assignment operations
  TEACHER_ASSIGNED: 'teacher.assigned',
  TEACHER_ASSIGNMENT_FAILED: 'teacher.assignment.failed',
  TEACHER_UNASSIGNED: 'teacher.unassigned',
  
  // Permission operations
  PERMISSION_CHECK: 'permission.check',
  PERMISSION_CHECK_FAILED: 'permission.check.failed',
  PERMISSION_DENIED: 'permission.denied',
  PERMISSION_UPDATED: 'permission.updated',
  
  // RLS policy violations
  RLS_VIOLATION: 'rls.violation',
  RLS_COURSE_INSERT_BLOCKED: 'rls.course.insert.blocked',
  RLS_COURSE_UPDATE_BLOCKED: 'rls.course.update.blocked',
  RLS_COURSE_DELETE_BLOCKED: 'rls.course.delete.blocked',
  
  // Rate limiting
  RATE_LIMIT_HIT: 'rate_limit.hit',
  RATE_LIMIT_EXCEEDED: 'rate_limit.exceeded',
  
  // Errors
  ERROR_OCCURRED: 'error.occurred',
  ERROR_CRITICAL: 'error.critical'
} as const;

/**
 * Record a metric
 */
export function recordMetric(
  metricName: string,
  value: number = 1,
  metadata?: Record<string, any>
): void {
  metrics.record(metricName, value, metadata);
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[METRIC] ${metricName}:`, value, metadata);
  }
}

/**
 * Get metrics
 */
export function getMetrics(metricName: string, since?: number): MetricData[] {
  return metrics.getMetrics(metricName, since);
}

/**
 * Get metric count
 */
export function getMetricCount(metricName: string, since?: number): number {
  return metrics.getCount(metricName, since);
}

/**
 * Get metric rate (per minute)
 */
export function getMetricRate(metricName: string, windowMinutes: number = 60): number {
  return metrics.getRate(metricName, windowMinutes);
}

/**
 * Get all metrics summary
 */
export function getMetricsSummary(): Record<string, { count: number; rate: number }> {
  return metrics.getSummary();
}

/**
 * Clear all metrics
 */
export function clearMetrics(): void {
  metrics.clear();
}

/**
 * Check if any alert thresholds are exceeded
 */
export function checkAlerts(): {
  alerts: Array<{
    metric: string;
    threshold: number;
    current: number;
    severity: 'warning' | 'critical';
  }>;
} {
  const alerts: Array<{
    metric: string;
    threshold: number;
    current: number;
    severity: 'warning' | 'critical';
  }> = [];

  // Check error rate (per hour)
  const errorRate = getMetricRate(METRICS.ERROR_OCCURRED, 60);
  if (errorRate > 10) {
    alerts.push({
      metric: METRICS.ERROR_OCCURRED,
      threshold: 10,
      current: errorRate,
      severity: errorRate > 50 ? 'critical' : 'warning'
    });
  }

  // Check RLS violations (per hour)
  const rlsViolationRate = getMetricRate(METRICS.RLS_VIOLATION, 60);
  if (rlsViolationRate > 5) {
    alerts.push({
      metric: METRICS.RLS_VIOLATION,
      threshold: 5,
      current: rlsViolationRate,
      severity: rlsViolationRate > 20 ? 'critical' : 'warning'
    });
  }

  // Check permission denials (per hour)
  const permissionDenialRate = getMetricRate(METRICS.PERMISSION_DENIED, 60);
  if (permissionDenialRate > 20) {
    alerts.push({
      metric: METRICS.PERMISSION_DENIED,
      threshold: 20,
      current: permissionDenialRate,
      severity: permissionDenialRate > 100 ? 'critical' : 'warning'
    });
  }

  // Check rate limit hits (per hour)
  const rateLimitRate = getMetricRate(METRICS.RATE_LIMIT_EXCEEDED, 60);
  if (rateLimitRate > 10) {
    alerts.push({
      metric: METRICS.RATE_LIMIT_EXCEEDED,
      threshold: 10,
      current: rateLimitRate,
      severity: 'warning'
    });
  }

  return { alerts };
}

export default metrics;
