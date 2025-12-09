# Monitoring Library

This library provides comprehensive monitoring and error tracking using Sentry.

## Setup

### 1. Environment Variables

Add the following to your `.env.local`:

```env
SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_ORG=your_sentry_organization
SENTRY_PROJECT=your_sentry_project
```

### 2. Sentry Project Setup

1. Create a Sentry account at https://sentry.io
2. Create a new project for your application
3. Copy the DSN from the project settings
4. Generate an auth token for source map uploads

## Usage

### Error Tracking

```typescript
import { captureError, captureMessage } from '@/lib/monitoring/sentry';

// Capture an error
try {
  // Your code
} catch (error) {
  captureError(error, {
    userId: user.id,
    action: 'create_course',
  });
}

// Capture a message
captureMessage('User completed onboarding', 'info', {
  userId: user.id,
});
```

### Performance Tracking

```typescript
import { trackPerformance } from '@/lib/monitoring/sentry';

// Track an operation
const result = await trackPerformance(
  'process_payment',
  async () => {
    return await processPayment(data);
  },
  {
    amount: data.amount,
    currency: data.currency,
  }
);
```

### API Route Monitoring

```typescript
import { withPerformanceTracking } from '@/lib/monitoring/api-middleware';
import { NextRequest, NextResponse } from 'next/server';

async function handler(req: NextRequest) {
  // Your API logic
  return NextResponse.json({ success: true });
}

// Wrap with performance tracking
export const GET = withPerformanceTracking(handler, 'get-users');
```

### Database Query Tracking

```typescript
import { trackDatabaseQuery } from '@/lib/monitoring/api-middleware';

const users = await trackDatabaseQuery(
  async () => {
    return await supabase
      .from('users')
      .select('*')
      .eq('role', 'teacher');
  },
  'get-teachers'
);
```

### External API Tracking

```typescript
import { trackExternalApi } from '@/lib/monitoring/api-middleware';

const response = await trackExternalApi(
  async () => {
    return await fetch('https://api.example.com/data');
  },
  'example-api'
);
```

### User Context

```typescript
import { setUserContext, clearUserContext } from '@/lib/monitoring/sentry';

// Set user context (on login)
setUserContext({
  id: user.id,
  email: user.email,
  username: user.username,
  role: user.role,
});

// Clear user context (on logout)
clearUserContext();
```

### Breadcrumbs

```typescript
import { addBreadcrumb } from '@/lib/monitoring/sentry';

addBreadcrumb({
  message: 'User clicked submit button',
  category: 'ui',
  level: 'info',
  data: {
    formId: 'registration-form',
  },
});
```

### Tags

```typescript
import { setTags } from '@/lib/monitoring/sentry';

setTags({
  feature: 'course-creation',
  version: '2.0',
  environment: 'production',
});
```

## Error Boundaries

### React Error Boundary

```typescript
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

function MyComponent() {
  return (
    <ErrorBoundary>
      <YourComponent />
    </ErrorBoundary>
  );
}
```

### Higher-Order Component

```typescript
import { withErrorBoundary } from '@/components/error/ErrorBoundary';

const SafeComponent = withErrorBoundary(MyComponent);
```

## Performance Thresholds

The monitoring system automatically flags:

- **Slow API Requests**: > 1000ms
- **Slow Database Queries**: > 500ms
- **Slow External API Calls**: > 2000ms

These thresholds can be adjusted in `lib/monitoring/api-middleware.ts`.

## Best Practices

1. **Always add context**: Include relevant data when capturing errors
2. **Use breadcrumbs**: Add breadcrumbs for important user actions
3. **Set user context**: Always set user context after authentication
4. **Track performance**: Wrap expensive operations with performance tracking
5. **Use error boundaries**: Wrap major sections of your app with error boundaries
6. **Monitor slow queries**: Pay attention to slow query warnings
7. **Clean up**: Clear user context on logout

## Alerts

Configure alerts in Sentry dashboard:

1. Go to your project settings
2. Navigate to Alerts
3. Create alert rules for:
   - Error rate spikes
   - Slow transaction alerts
   - New error types
   - Performance degradation

## Troubleshooting

### Sentry not capturing errors

1. Check that `SENTRY_DSN` is set correctly
2. Verify that you're in production mode or have `ENABLE_MONITORING=true`
3. Check browser console for Sentry initialization errors

### Source maps not uploading

1. Verify `SENTRY_AUTH_TOKEN` is set
2. Check that `SENTRY_ORG` and `SENTRY_PROJECT` match your Sentry project
3. Run build with `--debug` flag to see upload logs

### Performance data not showing

1. Check `tracesSampleRate` in Sentry config
2. Verify transactions are being created
3. Check Sentry dashboard for transaction data

## Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Next.js Integration](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
