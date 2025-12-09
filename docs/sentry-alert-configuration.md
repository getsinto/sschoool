# Sentry Alert Configuration Guide

This guide explains how to configure alerts in Sentry for the St Haroon Online School platform.

## Prerequisites

1. Sentry account with admin access
2. Project created in Sentry
3. DSN configured in environment variables

## Alert Types

### 1. Critical Error Alerts

**Purpose**: Notify team immediately when critical errors occur

**Configuration**:
- Go to **Alerts** → **Create Alert Rule**
- Select **Issues**
- Configure:
  - **When**: An event is seen
  - **If**: All of these conditions are met:
    - `level` equals `fatal` OR `error`
    - `tags.errorType` equals `payment` OR `database` OR `authentication`
  - **Then**: Send notification to:
    - Email: `dev-team@stharoonschool.com`
    - Slack: `#critical-alerts`
  - **Action Interval**: Every time

### 2. Error Rate Spike Alerts

**Purpose**: Detect sudden increases in error rates

**Configuration**:
- Go to **Alerts** → **Create Alert Rule**
- Select **Issues**
- Configure:
  - **When**: The issue is seen more than `100` times in `1 hour`
  - **If**: All of these conditions are met:
    - `level` equals `error`
  - **Then**: Send notification to:
    - Email: `dev-team@stharoonschool.com`
    - Slack: `#error-alerts`
  - **Action Interval**: Once per issue

### 3. Performance Degradation Alerts

**Purpose**: Alert when API response times exceed thresholds

**Configuration**:
- Go to **Alerts** → **Create Alert Rule**
- Select **Performance**
- Configure:
  - **When**: `p95(transaction.duration)` is above `1000ms`
  - **If**: All of these conditions are met:
    - `transaction.op` equals `http.server`
  - **Then**: Send notification to:
    - Email: `dev-team@stharoonschool.com`
    - Slack: `#performance-alerts`
  - **Action Interval**: Every 30 minutes

### 4. Slow Database Query Alerts

**Purpose**: Identify database performance issues

**Configuration**:
- Go to **Alerts** → **Create Alert Rule**
- Select **Performance**
- Configure:
  - **When**: `p95(transaction.duration)` is above `500ms`
  - **If**: All of these conditions are met:
    - `transaction.op` equals `db`
  - **Then**: Send notification to:
    - Email: `dev-team@stharoonschool.com`
    - Slack: `#database-alerts`
  - **Action Interval**: Every 1 hour

### 5. New Error Type Alerts

**Purpose**: Notify team of new, unseen errors

**Configuration**:
- Go to **Alerts** → **Create Alert Rule**
- Select **Issues**
- Configure:
  - **When**: A new issue is created
  - **If**: All of these conditions are met:
    - `level` equals `error` OR `fatal`
  - **Then**: Send notification to:
    - Email: `dev-team@stharoonschool.com`
    - Slack: `#new-errors`
  - **Action Interval**: Once per issue

### 6. Payment Processing Alerts

**Purpose**: Immediate notification for payment failures

**Configuration**:
- Go to **Alerts** → **Create Alert Rule**
- Select **Issues**
- Configure:
  - **When**: An event is seen
  - **If**: All of these conditions are met:
    - `tags.errorType` equals `payment`
  - **Then**: Send notification to:
    - Email: `finance@stharoonschool.com`, `dev-team@stharoonschool.com`
    - Slack: `#payment-alerts`
    - PagerDuty: `Payment Team`
  - **Action Interval**: Every time

### 7. Authentication Failure Alerts

**Purpose**: Detect potential security issues

**Configuration**:
- Go to **Alerts** → **Create Alert Rule**
- Select **Issues**
- Configure:
  - **When**: The issue is seen more than `50` times in `5 minutes`
  - **If**: All of these conditions are met:
    - `tags.errorType` equals `authentication`
  - **Then**: Send notification to:
    - Email: `security@stharoonschool.com`, `dev-team@stharoonschool.com`
    - Slack: `#security-alerts`
  - **Action Interval**: Every 15 minutes

### 8. File Upload Failure Alerts

**Purpose**: Monitor file upload system health

**Configuration**:
- Go to **Alerts** → **Create Alert Rule**
- Select **Issues**
- Configure:
  - **When**: The issue is seen more than `20` times in `1 hour`
  - **If**: All of these conditions are met:
    - `tags.errorType` equals `file_upload`
  - **Then**: Send notification to:
    - Email: `dev-team@stharoonschool.com`
    - Slack: `#upload-alerts`
  - **Action Interval**: Every 1 hour

## Slack Integration

### Setup

1. Go to **Settings** → **Integrations**
2. Find **Slack** and click **Add to Slack**
3. Authorize Sentry to access your Slack workspace
4. Select channels for different alert types:
   - `#critical-alerts` - Fatal errors, payment issues
   - `#error-alerts` - General error rate spikes
   - `#performance-alerts` - Slow API responses
   - `#database-alerts` - Database performance issues
   - `#new-errors` - New error types
   - `#payment-alerts` - Payment processing issues
   - `#security-alerts` - Authentication failures
   - `#upload-alerts` - File upload issues

### Channel Configuration

Create the following Slack channels:

```
#critical-alerts - @dev-team, @on-call
#error-alerts - @dev-team
#performance-alerts - @dev-team, @devops
#database-alerts - @dev-team, @database-admin
#new-errors - @dev-team
#payment-alerts - @finance-team, @dev-team
#security-alerts - @security-team, @dev-team
#upload-alerts - @dev-team
```

## Email Notifications

### Setup

1. Go to **Settings** → **Notifications**
2. Configure email addresses:
   - `dev-team@stharoonschool.com` - All alerts
   - `finance@stharoonschool.com` - Payment alerts
   - `security@stharoonschool.com` - Security alerts

### Email Templates

Sentry will use default templates, but you can customize:

1. Go to **Settings** → **Integrations** → **Email**
2. Click **Configure**
3. Customize templates for different alert types

## PagerDuty Integration (Optional)

For critical 24/7 monitoring:

1. Go to **Settings** → **Integrations**
2. Find **PagerDuty** and click **Add Integration**
3. Enter your PagerDuty API key
4. Configure services:
   - **Payment Team** - Payment processing alerts
   - **On-Call Team** - Critical system errors

## Alert Testing

### Test Critical Error Alert

```typescript
import { captureError, setTags } from '@/lib/monitoring/sentry';

// Trigger a test critical error
setTags({
  errorType: 'payment',
  test: 'true',
});

captureError(new Error('Test critical payment error'), {
  amount: 100,
  currency: 'USD',
  test: true,
});
```

### Test Performance Alert

```typescript
import { trackPerformance } from '@/lib/monitoring/sentry';

// Simulate slow operation
await trackPerformance(
  'test-slow-operation',
  async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
);
```

## Alert Maintenance

### Weekly Review

1. Review alert frequency in Sentry dashboard
2. Adjust thresholds if too many false positives
3. Add new alerts for emerging issues
4. Remove or modify alerts that are no longer relevant

### Monthly Review

1. Analyze alert response times
2. Review which alerts led to actual fixes
3. Update team notification preferences
4. Review and update Slack channel memberships

## Best Practices

1. **Start Conservative**: Begin with higher thresholds and adjust down
2. **Avoid Alert Fatigue**: Too many alerts = ignored alerts
3. **Clear Ownership**: Each alert type should have a clear owner
4. **Document Actions**: Document what to do when each alert fires
5. **Test Regularly**: Test alerts monthly to ensure they work
6. **Review Metrics**: Track alert response times and resolution times

## Troubleshooting

### Alerts Not Firing

1. Check alert rule configuration in Sentry
2. Verify conditions match actual error tags
3. Check notification channel configuration
4. Verify email addresses and Slack channels exist

### Too Many Alerts

1. Increase thresholds
2. Add more specific conditions
3. Increase action intervals
4. Consider grouping similar errors

### Missing Alerts

1. Verify error tagging in code
2. Check Sentry DSN configuration
3. Verify errors are being captured
4. Check Sentry project settings

## Resources

- [Sentry Alerts Documentation](https://docs.sentry.io/product/alerts/)
- [Slack Integration Guide](https://docs.sentry.io/product/integrations/notification-incidents/slack/)
- [PagerDuty Integration](https://docs.sentry.io/product/integrations/notification-incidents/pagerduty/)
