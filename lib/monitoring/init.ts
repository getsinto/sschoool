/**
 * Monitoring Initialization
 * 
 * Initializes all monitoring services for the application
 */

import { initializeSentry } from './sentry';

/**
 * Initialize all monitoring services
 * Should be called once at application startup
 */
export function initializeMonitoring(): void {
  // Only initialize in production or when explicitly enabled
  const isProduction = process.env.NODE_ENV === 'production';
  const forceEnable = process.env.ENABLE_MONITORING === 'true';
  
  if (!isProduction && !forceEnable) {
    console.log('Monitoring disabled in development');
    return;
  }

  // Initialize Sentry
  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
  
  if (sentryDsn) {
    initializeSentry({
      dsn: sentryDsn,
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
      release: process.env.VERCEL_GIT_COMMIT_SHA,
      tracesSampleRate: isProduction ? 0.1 : 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
    
    console.log('Sentry monitoring initialized');
  } else {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
  }
}

/**
 * Check if monitoring is enabled
 */
export function isMonitoringEnabled(): boolean {
  const isProduction = process.env.NODE_ENV === 'production';
  const forceEnable = process.env.ENABLE_MONITORING === 'true';
  const hasDsn = !!(process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN);
  
  return (isProduction || forceEnable) && hasDsn;
}
