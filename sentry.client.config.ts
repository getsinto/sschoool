/**
 * Sentry Client Configuration
 * 
 * This file configures Sentry for the browser/client-side
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Environment
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || 'development',
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
  
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
  ],
  
  // Filter out sensitive data
  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry Event (dev):', event, hint);
      return null;
    }
    
    // Remove sensitive data from request
    if (event.request) {
      // Remove auth headers
      if (event.request.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
      
      // Redact sensitive query params
      if (event.request.query_string) {
        const sensitiveParams = ['token', 'password', 'secret', 'api_key', 'access_token'];
        sensitiveParams.forEach(param => {
          if (event.request?.query_string?.includes(param)) {
            event.request.query_string = event.request.query_string.replace(
              new RegExp(`${param}=[^&]*`, 'gi'),
              `${param}=[REDACTED]`
            );
          }
        });
      }
    }
    
    // Remove sensitive data from extra context
    if (event.extra) {
      const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'accessToken'];
      sensitiveKeys.forEach(key => {
        if (event.extra && key in event.extra) {
          event.extra[key] = '[REDACTED]';
        }
      });
    }
    
    return event;
  },
  
  // Ignore certain errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'chrome-extension://',
    'moz-extension://',
    
    // Network errors
    'NetworkError',
    'Network request failed',
    'Failed to fetch',
    
    // Common user errors
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
  ],
  
  // Don't report errors from certain URLs
  denyUrls: [
    // Browser extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^moz-extension:\/\//i,
  ],
});
