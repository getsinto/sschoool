# Sentry Monitoring Testing Guide

This guide explains how to test the Sentry monitoring setup in production.

## Pre-Deployment Testing

### 1. Local Testing

Before deploying, test Sentry locally:

```bash
# Enable monitoring in development
export ENABLE_MONITORING=true
export SENTRY_DSN=your_sentry_dsn
export NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn

# Run the application
npm run dev
```

### 2. Test Error Capture

Create a test page to trigger errors:

```typescript
// app/test-sentry/page.tsx
'use client';

import { captureError, captureMessage } from '@/lib/monitoring/sentry';

export default function TestSentryPage() {
  const testError = () => {
    try {
      throw new Error('Test error from Sentry test page');
    } catch (error) {
      captureError(error as Error, {
        test: true,
        page: 'test-sentry',
      });
    }
  };

  const testMessage = () => {
    captureMessage('Test message from Sentry', 'info', {
      test: true,
    });
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Sentry Test Page</h1>
      <div className="space-y-4">
        <button
          onClick={testError}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Test Error Capture
        </button>
        <button
          onClick={testMessage}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Test Message Capture
        </button>
      </div>
    </div>
  );
}
```

### 3. Test Performance Tracking

```typescript
// Test API route with performance tracking
// app/api/test-performance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPerformanceTracking } from '@/lib/monitoring/api-middleware';

async function handler(req: NextRequest) {
  // Simulate slow operation
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return NextResponse.json({
    message: 'Performance test complete',
    duration: 1500,
  });
}

export const GET = withPerformanceTracking(handler, 'test-performance');
```

## Production Testing Checklist

### Phase 1: Initial Deployment

- [ ] 1. Deploy application with Sentry configuration
- [ ] 2. Verify Sentry DSN is set in environment variables
- [ ] 3. Check Sentry dashboard for initial connection
- [ ] 4. Verify source maps are uploaded

### Phase 2: Error Capture Testing

- [ ] 1. Trigger a test error in production
- [ ] 2. Verify error appears in Sentry dashboard within 1 minute
- [ ] 3. Check that error includes:
  - [ ] Stack trace
  - [ ] User context (if logged in)
  - [ ] Environment information
  - [ ] Breadcrumbs
- [ ] 4. Verify error is tagged correctly
- [ ] 5. Check that sensitive data is redacted

### Phase 3: Performance Monitoring Testing

- [ ] 1. Make API requests to monitored endpoints
- [ ] 2. Verify transactions appear in Sentry Performance tab
- [ ] 3. Check transaction duration is accurate
- [ ] 4. Verify slow transactions are flagged
- [ ] 5. Check database query performance tracking

### Phase 4: Alert Testing

- [ ] 1. Trigger a critical error
- [ ] 2. Verify email alert is received
- [ ] 3. Check Slack notification (if configured)
- [ ] 4. Verify alert includes correct information
- [ ] 5. Test alert throttling (action intervals)

### Phase 5: User Context Testing

- [ ] 1. Log in as different user types (student, teacher, admin)
- [ ] 2. Trigger errors for each user type
- [ ] 3. Verify user context is captured correctly
- [ ] 4. Check that user email is included
- [ ] 5. Verify user role is tagged

### Phase 6: Breadcrumb Testing

- [ ] 1. Perform a series of actions
- [ ] 2. Trigger an error
- [ ] 3. Verify breadcrumbs show action trail
- [ ] 4. Check breadcrumb timestamps
- [ ] 5. Verify breadcrumb data is complete

## Test Scenarios

### Scenario 1: Payment Error

```typescript
// Simulate payment error
import { captureError, setTags } from '@/lib/monitoring/sentry';

setTags({
  errorType: 'payment',
  paymentMethod: 'stripe',
});

captureError(new Error('Payment processing failed'), {
  amount: 100,
  currency: 'USD',
  transactionId: 'test-txn-123',
  test: true,
});
```

**Expected Results**:
- Error appears in Sentry within 1 minute
- Tagged as `errorType: payment`
- Alert sent to payment team
- Includes transaction details

### Scenario 2: Database Error

```typescript
// Simulate database error
import { trackDatabaseQuery } from '@/lib/monitoring/api-middleware';

try {
  await trackDatabaseQuery(
    async () => {
      throw new Error('Database connection timeout');
    },
    'test-query'
  );
} catch (error) {
  // Error should be captured automatically
}
```

**Expected Results**:
- Error captured with database context
- Tagged as database error
- Includes query name
- Performance data recorded

### Scenario 3: Authentication Error

```typescript
// Simulate auth error
import { captureError, setTags } from '@/lib/monitoring/sentry';

setTags({
  errorType: 'authentication',
});

captureError(new Error('Invalid credentials'), {
  email: 'test@example.com',
  ipAddress: '192.168.1.1',
  test: true,
});
```

**Expected Results**:
- Error captured with auth context
- Tagged as authentication error
- Includes user email (redacted in production)
- Security team notified if threshold exceeded

### Scenario 4: File Upload Error

```typescript
// Simulate upload error
import { captureError, setTags } from '@/lib/monitoring/sentry';

setTags({
  errorType: 'file_upload',
  fileType: 'image/jpeg',
});

captureError(new Error('File upload failed'), {
  fileName: 'test-image.jpg',
  fileSize: 5000000,
  uploadProgress: 75,
  test: true,
});
```

**Expected Results**:
- Error captured with file metadata
- Tagged as file upload error
- Includes file details
- Upload team notified if threshold exceeded

## Verification Steps

### 1. Check Sentry Dashboard

1. Go to https://sentry.io
2. Select your project
3. Navigate to **Issues**
4. Verify test errors appear
5. Click on an error to see details

### 2. Verify Error Details

For each captured error, verify:

- **Message**: Clear error message
- **Stack Trace**: Complete stack trace with source maps
- **Breadcrumbs**: Action trail leading to error
- **Context**: User, environment, and custom context
- **Tags**: Correct tags applied
- **User**: User information (if logged in)

### 3. Check Performance Data

1. Navigate to **Performance** tab
2. Select a transaction
3. Verify:
   - Transaction duration
   - Database queries
   - External API calls
   - Spans and operations

### 4. Test Alerts

1. Trigger a critical error
2. Check email inbox
3. Check Slack channel
4. Verify alert content
5. Confirm alert timing

## Monitoring Health Checks

### Daily Checks

- [ ] Check Sentry dashboard for new errors
- [ ] Review error rate trends
- [ ] Check performance metrics
- [ ] Verify alerts are working

### Weekly Checks

- [ ] Review error patterns
- [ ] Analyze slow transactions
- [ ] Check alert effectiveness
- [ ] Update alert thresholds if needed

### Monthly Checks

- [ ] Review overall error trends
- [ ] Analyze performance degradation
- [ ] Update monitoring configuration
- [ ] Review and update documentation

## Troubleshooting

### Errors Not Appearing

1. **Check DSN Configuration**
   ```bash
   echo $SENTRY_DSN
   echo $NEXT_PUBLIC_SENTRY_DSN
   ```

2. **Verify Sentry Initialization**
   - Check browser console for Sentry logs
   - Look for initialization errors

3. **Check Environment**
   - Verify `NODE_ENV` is set to `production`
   - Or `ENABLE_MONITORING=true` is set

### Source Maps Not Working

1. **Check Auth Token**
   ```bash
   echo $SENTRY_AUTH_TOKEN
   ```

2. **Verify Upload**
   - Check build logs for source map upload
   - Look for upload errors

3. **Check Project Settings**
   - Verify `SENTRY_ORG` and `SENTRY_PROJECT` are correct

### Performance Data Missing

1. **Check Sample Rate**
   - Verify `tracesSampleRate` in config
   - Increase if too low

2. **Verify Transactions**
   - Check that transactions are being created
   - Look for transaction creation errors

3. **Check Performance Tab**
   - Navigate to Performance in Sentry
   - Look for transaction data

## Best Practices

1. **Test in Staging First**: Always test monitoring in staging before production
2. **Use Test Tags**: Tag test errors with `test: true`
3. **Clean Up Test Data**: Remove test errors from Sentry after testing
4. **Document Issues**: Document any issues found during testing
5. **Regular Testing**: Test monitoring regularly, not just after deployment
6. **Monitor Monitoring**: Set up alerts for monitoring system failures

## Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Testing Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/troubleshooting/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
