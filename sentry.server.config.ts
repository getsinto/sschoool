/**
 * Sentry Server Configuration
 * 
 * This file configures Sentry for the server-side (API routes, SSR)
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Environment
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  
  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  integrations: [
    Sentry.httpIntegration(),
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
        delete event.request.headers['x-api-key'];
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
      
      // Redact sensitive data from request body
      if (event.request.data) {
        const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'accessToken', 'refreshToken'];
        const redactData = (obj: any): any => {
          if (typeof obj !== 'object' || obj === null) return obj;
          
          const redacted = { ...obj };
          sensitiveFields.forEach(field => {
            if (field in redacted) {
              redacted[field] = '[REDACTED]';
            }
          });
          
          // Recursively redact nested objects
          Object.keys(redacted).forEach(key => {
            if (typeof redacted[key] === 'object' && redacted[key] !== null) {
              redacted[key] = redactData(redacted[key]);
            }
          });
          
          return redacted;
        };
        
        event.request.data = redactData(event.request.data);
      }
    }
    
    // Remove sensitive data from extra context
    if (event.extra) {
      const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'accessToken', 'refreshToken'];
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
    // Database connection errors (handled separately)
    'ECONNREFUSED',
    'ETIMEDOUT',
    
    // Expected errors
    'Unauthorized',
    'Forbidden',
    'Not Found',
  ],
});
