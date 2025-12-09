/**
 * Sentry Monitoring Service
 * 
 * Provides centralized error tracking and performance monitoring
 * using Sentry for production environments.
 */

import * as Sentry from '@sentry/nextjs';

interface SentryConfig {
  dsn: string;
  environment: string;
  release?: string;
  tracesSampleRate?: number;
  replaysSessionSampleRate?: number;
  replaysOnErrorSampleRate?: number;
}

/**
 * Initialize Sentry with configuration
 * 
 * @param config - Sentry configuration options
 */
export function initializeSentry(config: SentryConfig): void {
  if (!config.dsn) {
    console.warn('Sentry DSN not provided. Monitoring disabled.');
    return;
  }

  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    release: config.release,
    
    // Performance Monitoring
    tracesSampleRate: config.tracesSampleRate ?? 1.0,
    
    // Session Replay
    replaysSessionSampleRate: config.replaysSessionSampleRate ?? 0.1,
    replaysOnErrorSampleRate: config.replaysOnErrorSampleRate ?? 1.0,
    
    // Integrations
    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Filter out sensitive data
    beforeSend(event) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
      
      // Remove sensitive query params
      if (event.request?.query_string) {
        const sensitiveParams = ['token', 'password', 'secret', 'api_key'];
        sensitiveParams.forEach(param => {
          if (event.request?.query_string?.includes(param)) {
            event.request.query_string = event.request.query_string.replace(
              new RegExp(`${param}=[^&]*`, 'gi'),
              `${param}=[REDACTED]`
            );
          }
        });
      }
      
      return event;
    },
  });
}

/**
 * Capture an error and send to Sentry
 * 
 * @param error - Error object or message
 * @param context - Additional context data
 * @returns Event ID from Sentry
 */
export function captureError(
  error: Error | string,
  context?: Record<string, any>
): string {
  if (context) {
    Sentry.setContext('additional', context);
  }
  
  const eventId = typeof error === 'string'
    ? Sentry.captureMessage(error, 'error')
    : Sentry.captureException(error);
  
  return eventId;
}

/**
 * Track performance of an operation
 * 
 * @param name - Operation name
 * @param operation - Function to track
 * @param data - Additional data to attach
 * @returns Result of the operation
 */
export async function trackPerformance<T>(
  name: string,
  operation: () => Promise<T>,
  data?: Record<string, any>
): Promise<T> {
  const transaction = Sentry.startTransaction({
    name,
    op: 'function',
    data,
  });
  
  try {
    const result = await operation();
    transaction.setStatus('ok');
    return result;
  } catch (error) {
    transaction.setStatus('internal_error');
    throw error;
  } finally {
    transaction.finish();
  }
}

/**
 * Set user context for error tracking
 * 
 * @param user - User information
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  username?: string;
  role?: string;
}): void {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearUserContext(): void {
  Sentry.setUser(null);
}

/**
 * Capture a message (non-error event)
 * 
 * @param message - Message to capture
 * @param level - Severity level
 * @param context - Additional context
 * @returns Event ID from Sentry
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' | 'fatal' = 'info',
  context?: Record<string, any>
): string {
  if (context) {
    Sentry.setContext('additional', context);
  }
  
  return Sentry.captureMessage(message, level);
}

/**
 * Add breadcrumb for debugging context
 * 
 * @param breadcrumb - Breadcrumb data
 */
export function addBreadcrumb(breadcrumb: {
  message: string;
  category?: string;
  level?: 'info' | 'warning' | 'error';
  data?: Record<string, any>;
}): void {
  Sentry.addBreadcrumb({
    message: breadcrumb.message,
    category: breadcrumb.category ?? 'custom',
    level: breadcrumb.level ?? 'info',
    data: breadcrumb.data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Set custom tags for filtering in Sentry
 * 
 * @param tags - Key-value pairs of tags
 */
export function setTags(tags: Record<string, string>): void {
  Object.entries(tags).forEach(([key, value]) => {
    Sentry.setTag(key, value);
  });
}

/**
 * Start a new transaction for performance tracking
 * 
 * @param name - Transaction name
 * @param op - Operation type
 * @returns Transaction object
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({ name, op });
}

/**
 * Flush all pending events to Sentry
 * Useful before process termination
 * 
 * @param timeout - Timeout in milliseconds
 * @returns Promise that resolves when flush is complete
 */
export async function flush(timeout: number = 2000): Promise<boolean> {
  return Sentry.flush(timeout);
}

/**
 * Check if Sentry is enabled
 * 
 * @returns True if Sentry is initialized
 */
export function isEnabled(): boolean {
  return Sentry.getCurrentHub().getClient() !== undefined;
}
