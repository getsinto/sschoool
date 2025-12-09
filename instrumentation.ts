/**
 * Next.js Instrumentation
 * 
 * This file is automatically loaded by Next.js before the application starts.
 * It's the recommended place to initialize monitoring and other instrumentation.
 * 
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on server
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Import and initialize Sentry for server
    await import('./sentry.server.config');
  }

  // Only run on edge
  if (process.env.NEXT_RUNTIME === 'edge') {
    // Import and initialize Sentry for edge
    await import('./sentry.edge.config');
  }
}
