# Sentry Production Monitoring Setup Guide

## Overview

This guide covers the complete setup of Sentry for production error tracking and performance monitoring on the online education platform.

## Prerequisites

- Sentry account (free tier available)
- Admin access to the platform
- Environment variable configuration access

## Step 1: Create Sentry Project

1. Go to [sentry.io](https://sentry.io) and sign up or log in

2. Click "Create Project"

3. Select platform: **Next.js**

4. Configure project:
   - Project name: "online-education-platform"
   - Team: Select or create team
   - Alert frequency: "Alert me on every new issue"

5. Click "Create Project"

6. Copy the DSN (Data Source Name) - you'll need this later

## Step 2: Install Sentry SDK

The Sentry SDK should already be installed. Verify:

```bash
npm list @sentry/nextjs
```

If not installed:

```bash
npm install --save @sentry/nextjs
```

## Step 3: Configure Environment Variables

Add to `.env.local`:

```env
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=your-organization-slug
SENTRY_PROJECT=online-education-platform

# Environment
NEXT_PUBLIC_ENVIRONMENT=production  # or development, staging

# Release tracking
NEXT_PUBLIC_SENTRY_RELEASE=1.0.0  # Update with each deployment
```

### Get Sentry Auth Token

1. Go to Sentry → Settings → Account → API → Auth Tokens
2. Click "Create New Token"
3. Scopes needed:
   - `project:read`
   - `project:releases`
   - `org:read`
4. Copy the token

## Step 4: Sentry Configuration Files

The following files should already exist:

### `sentry.client.config.ts`
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions in production
  
  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
  
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Filter out sensitive data
  beforeSend(event, hint) {
    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    return event;
  },
});
```

### `sentry.server.config.ts`
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  
  tracesSampleRate: 1.0,
  
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
  ],
  
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    return event;
  },
});
```

### `sentry.edge.config.ts`
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
  release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
  tracesSampleRate: 1.0,
});
```

## Step 5: Instrumentation Setup

Verify `instrumentation.ts` exists at the root:

```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}
```

## Step 6: Configure Alert Rules

### Critical Error Alerts

1. Go to Sentry → Alerts → Create Alert Rule

2. Configure:
   - **Name**: "Critical Production Errors"
   - **Environment**: production
   - **Conditions**:
     - When an event is seen
     - AND event.level equals error OR fatal
     - AND event.tags.critical equals true
   - **Actions**:
     - Send email to: admin@yourdomain.com
     - Send Slack notification to: #alerts

### Performance Degradation Alerts

1. Create another alert rule:
   - **Name**: "Slow API Responses"
   - **Conditions**:
     - When transaction duration is above 2000ms
     - For at least 10 events in 5 minutes
   - **Actions**:
     - Send email to: devops@yourdomain.com

### High Error Rate Alerts

1. Create alert rule:
   - **Name**: "High Error Rate"
   - **Conditions**:
     - When error count is above 50
     - In a 5-minute window
   - **Actions**:
     - Send email and Slack notification

## Step 7: Slack Integration

1. Go to Sentry → Settings → Integrations

2. Find "Slack" and click "Install"

3. Authorize Sentry to access your Slack workspace

4. Configure:
   - Select channel: #alerts or #sentry
   - Choose notification types:
     - New issues
     - Issue state changes
     - Comments

## Step 8: Error Boundaries

Verify error boundaries are set up in key components:

```typescript
// app/error.tsx
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

## Step 9: API Monitoring

Verify API routes use the monitoring middleware:

```typescript
// lib/monitoring/api-middleware.ts
import * as Sentry from '@sentry/nextjs';

export function withMonitoring(handler: Function) {
  return async (req: Request) => {
    const transaction = Sentry.startTransaction({
      op: 'http.server',
      name: `${req.method} ${new URL(req.url).pathname}`,
    });

    try {
      const response = await handler(req);
      transaction.setHttpStatus(response.status);
      return response;
    } catch (error) {
      Sentry.captureException(error);
      transaction.setHttpStatus(500);
      throw error;
    } finally {
      transaction.finish();
    }
  };
}
```

## Step 10: User Context

Set user context for better error tracking:

```typescript
import * as Sentry from '@sentry/nextjs';

// After user authentication
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.name,
  role: user.role,
});

// On logout
Sentry.setUser(null);
```

## Step 11: Custom Error Tracking

### Track Custom Events

```typescript
import * as Sentry from '@sentry/nextjs';

// Track important business events
Sentry.captureMessage('Payment processed', {
  level: 'info',
  tags: {
    payment_method: 'stripe',
    amount: '99.99',
  },
});

// Track errors with context
try {
  await processPayment();
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      payment_gateway: 'stripe',
      user_id: userId,
    },
    contexts: {
      payment: {
        amount: 99.99,
        currency: 'USD',
      },
    },
  });
}
```

### Performance Tracking

```typescript
import * as Sentry from '@sentry/nextjs';

// Track custom operations
const transaction = Sentry.startTransaction({
  op: 'task',
  name: 'Process Student Grades',
});

try {
  await processGrades();
  transaction.setStatus('ok');
} catch (error) {
  transaction.setStatus('internal_error');
  throw error;
} finally {
  transaction.finish();
}
```

## Step 12: Source Maps

Configure source maps for better error tracking:

### `next.config.js`

```javascript
const { withSentryConfig } = require('@sentry/nextjs');

const moduleExports = {
  // Your existing Next.js config
};

const sentryWebpackPluginOptions = {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
};

module.exports = withSentryConfig(moduleExports, sentryWebpackPluginOptions);
```

## Step 13: Release Tracking

### Automatic Release Creation

Add to your deployment script:

```bash
#!/bin/bash

# Get current version
VERSION=$(node -p "require('./package.json').version")

# Create Sentry release
sentry-cli releases new "$VERSION"
sentry-cli releases set-commits "$VERSION" --auto
sentry-cli releases finalize "$VERSION"

# Deploy
npm run build
vercel --prod

# Mark release as deployed
sentry-cli releases deploys "$VERSION" new -e production
```

### Manual Release Creation

```bash
# Install Sentry CLI
npm install -g @sentry/cli

# Create release
sentry-cli releases new 1.0.0

# Upload source maps
sentry-cli releases files 1.0.0 upload-sourcemaps .next

# Finalize release
sentry-cli releases finalize 1.0.0
```

## Step 14: Testing

### Test Error Capture

```typescript
// Add a test button in development
<button onClick={() => {
  throw new Error('Test Sentry Error');
}}>
  Test Sentry
</button>
```

### Test Performance Tracking

```typescript
// Trigger a slow operation
<button onClick={async () => {
  const transaction = Sentry.startTransaction({
    op: 'test',
    name: 'Test Performance',
  });
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  transaction.finish();
}}>
  Test Performance
</button>
```

## Monitoring Dashboard

### Key Metrics to Monitor

1. **Error Rate**: Errors per minute/hour
2. **Response Time**: P50, P75, P95, P99
3. **Throughput**: Requests per second
4. **Apdex Score**: Application performance index
5. **User Impact**: Number of users affected by errors

### Create Custom Dashboards

1. Go to Sentry → Dashboards → Create Dashboard

2. Add widgets:
   - Error count by endpoint
   - Response time by endpoint
   - Error rate by user role
   - Most common errors
   - Performance by region

## Troubleshooting

### Errors Not Appearing in Sentry

**Solution**: 
- Verify DSN is correct
- Check network tab for failed requests to Sentry
- Ensure Sentry is initialized before errors occur

### Source Maps Not Working

**Solution**:
- Verify `SENTRY_AUTH_TOKEN` is set
- Check source map upload in build logs
- Ensure release version matches

### Too Many Alerts

**Solution**:
- Adjust alert thresholds
- Use issue grouping to reduce noise
- Set up alert rules with proper filters

## Best Practices

1. **Tag Everything**: Use tags for filtering and grouping
2. **Set User Context**: Always set user info when available
3. **Use Breadcrumbs**: Add breadcrumbs for debugging context
4. **Filter Sensitive Data**: Never send passwords or tokens
5. **Monitor Performance**: Track slow queries and operations
6. **Review Regularly**: Check Sentry dashboard daily
7. **Resolve Issues**: Mark issues as resolved when fixed
8. **Use Releases**: Track which version has which bugs

## Cost Optimization

1. **Adjust Sample Rates**: Lower sample rates for high-traffic apps
2. **Filter Noise**: Ignore known errors (e.g., browser extensions)
3. **Use Quotas**: Set monthly error quotas
4. **Archive Old Issues**: Clean up resolved issues regularly

## Next Steps

1. Set up custom dashboards for your team
2. Configure PagerDuty or OpsGenie integration
3. Set up automated issue assignment
4. Create runbooks for common errors
5. Train team on Sentry usage

## Support Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Next.js Integration Guide](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Sentry Community Forum](https://forum.sentry.io/)
