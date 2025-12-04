# Monitoring and Alerting System

This directory contains the monitoring and metrics tracking system for the Course Assignment Permissions feature.

## Overview

The monitoring system tracks key metrics and provides alerting for:
- Course creation rate
- Teacher assignment rate
- Permission check failures
- RLS policy violations
- Error rates
- Rate limiting hits

## Components

### `metrics.ts`
Core metrics collection and storage. Provides:
- `recordMetric()` - Record a metric event
- `getMetrics()` - Retrieve metrics
- `getMetricCount()` - Get count of metric events
- `getMetricRate()` - Get rate per minute
- `checkAlerts()` - Check if any alert thresholds are exceeded

### `helpers.ts`
Helper functions to integrate metrics into application code:
- `trackCourseCreation()` - Track course creation events
- `trackTeacherAssignment()` - Track teacher assignments
- `trackPermissionCheck()` - Track permission checks
- `trackRLSViolation()` - Track RLS policy violations
- `trackRateLimitHit()` - Track rate limiting events
- `trackError()` - Track errors

### API Endpoint
`/api/admin/monitoring/metrics` - GET endpoint for retrieving metrics summary

### Dashboard
`/admin/monitoring` - Admin dashboard for viewing metrics and alerts

## Usage

### Basic Metric Tracking

```typescript
import { recordMetric, METRICS } from '@/lib/monitoring/metrics';

// Record a course creation
recordMetric(METRICS.COURSE_CREATED, 1, { courseId: '123' });

// Record an error
recordMetric(METRICS.ERROR_OCCURRED, 1, { error: 'Something went wrong' });
```

### Using Helper Functions

```typescript
import { trackCourseCreation, trackPermissionCheck } from '@/lib/monitoring/helpers';

// Track course creation
try {
  const course = await createCourse(data);
  trackCourseCreation(true, { courseId: course.id });
} catch (error) {
  trackCourseCreation(false, { error: error.message });
}

// Track permission check
const allowed = canCreateCourse(user);
trackPermissionCheck(allowed, 'course.create', { userId: user.id });
```

### Integration Example

```typescript
import { trackTeacherAssignment } from '@/lib/monitoring/helpers';

export async function assignTeacher(courseId: string, teacherId: string) {
  try {
    const assignment = await db.courseAssignments.create({
      courseId,
      teacherId
    });
    
    // Track successful assignment
    trackTeacherAssignment(true, {
      courseId,
      teacherId,
      assignmentId: assignment.id
    });
    
    return { success: true, assignment };
  } catch (error) {
    // Track failed assignment
    trackTeacherAssignment(false, {
      courseId,
      teacherId,
      error: error.message
    });
    
    return { success: false, error };
  }
}
```

## Alert Thresholds

Current alert thresholds (per hour):
- **Errors**: Warning at 10/hr, Critical at 50/hr
- **RLS Violations**: Warning at 5/hr, Critical at 20/hr
- **Permission Denials**: Warning at 20/hr, Critical at 100/hr
- **Rate Limit Hits**: Warning at 10/hr

## Metrics Storage

Currently uses in-memory storage (Map). For production:
- Replace with Redis for distributed systems
- Use proper metrics service (Prometheus, DataDog, CloudWatch)
- Implement persistent storage for historical data

## Accessing Metrics

### Via API
```bash
curl -H "Authorization: Bearer <token>" \
  https://your-domain.com/api/admin/monitoring/metrics
```

### Via Dashboard
Navigate to `/admin/monitoring` in the admin panel

### Programmatically
```typescript
import { getMetricsSummary, checkAlerts } from '@/lib/monitoring/metrics';

const summary = getMetricsSummary();
const { alerts } = checkAlerts();
```

## Future Enhancements

1. **Persistent Storage**: Store metrics in database or time-series DB
2. **Historical Data**: Track metrics over time for trend analysis
3. **Custom Dashboards**: Create role-specific monitoring views
4. **Email Alerts**: Send notifications when thresholds are exceeded
5. **Slack Integration**: Post alerts to Slack channels
6. **Grafana Integration**: Export metrics to Grafana for visualization
7. **Performance Metrics**: Track API response times and database query performance
8. **User Activity Metrics**: Track user engagement and feature usage

## Production Considerations

### Scaling
- Current in-memory storage works for single-server deployments
- For multi-server: Use Redis or dedicated metrics service
- Consider sampling for high-volume metrics

### Performance
- Metrics recording is synchronous but fast
- No database calls during metric recording
- Automatic cleanup prevents memory leaks

### Security
- Metrics API requires admin authentication
- No sensitive data in metric metadata
- Rate limiting on metrics endpoint

## Testing

```typescript
import { recordMetric, getMetricCount, clearMetrics } from '@/lib/monitoring/metrics';

describe('Metrics', () => {
  beforeEach(() => {
    clearMetrics();
  });

  it('should record and retrieve metrics', () => {
    recordMetric('test.metric', 1);
    expect(getMetricCount('test.metric')).toBe(1);
  });
});
```

## Troubleshooting

### Metrics not appearing
- Check that metrics are being recorded with `recordMetric()`
- Verify admin authentication for API access
- Check browser console for errors

### High memory usage
- Metrics are capped at 1000 entries per type
- Old metrics are automatically cleaned up
- Consider reducing retention or using external storage

### Alerts not triggering
- Verify alert thresholds in `checkAlerts()`
- Check that metrics are being recorded correctly
- Ensure sufficient time window for rate calculation
