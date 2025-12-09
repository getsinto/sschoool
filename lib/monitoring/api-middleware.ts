/**
 * API Monitoring Middleware
 * 
 * Middleware for tracking API performance and errors
 */

import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { trackPerformance, captureError, addBreadcrumb } from './sentry';

interface ApiMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  statusCode?: number;
  error?: Error;
}

/**
 * Middleware to track API route performance
 * 
 * @param handler - The API route handler
 * @param routeName - Name of the route for tracking
 * @returns Wrapped handler with performance tracking
 */
export function withPerformanceTracking<T = any>(
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse<T>>,
  routeName: string
) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse<T>> => {
    const metrics: ApiMetrics = {
      startTime: Date.now(),
    };

    // Add breadcrumb for request
    addBreadcrumb({
      message: `API Request: ${routeName}`,
      category: 'api',
      level: 'info',
      data: {
        method: req.method,
        url: req.url,
        headers: Object.fromEntries(req.headers.entries()),
      },
    });

    try {
      // Track performance
      const response = await trackPerformance(
        `api.${routeName}`,
        async () => handler(req, ...args),
        {
          method: req.method,
          url: req.url,
          userAgent: req.headers.get('user-agent'),
        }
      );

      metrics.endTime = Date.now();
      metrics.duration = metrics.endTime - metrics.startTime;
      metrics.statusCode = response.status;

      // Log slow requests
      if (metrics.duration > 1000) {
        addBreadcrumb({
          message: `Slow API Request: ${routeName}`,
          category: 'performance',
          level: 'warning',
          data: {
            duration: metrics.duration,
            method: req.method,
            url: req.url,
          },
        });
      }

      return response;
    } catch (error) {
      metrics.endTime = Date.now();
      metrics.duration = metrics.endTime - metrics.startTime;
      metrics.error = error as Error;

      // Capture error
      captureError(error as Error, {
        route: routeName,
        method: req.method,
        url: req.url,
        duration: metrics.duration,
      });

      throw error;
    }
  };
}

/**
 * Middleware to track database query performance
 * 
 * @param query - The database query function
 * @param queryName - Name of the query for tracking
 * @returns Wrapped query with performance tracking
 */
export async function trackDatabaseQuery<T>(
  query: () => Promise<T>,
  queryName: string
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await trackPerformance(
      `db.${queryName}`,
      query,
      {
        type: 'database',
      }
    );

    const duration = Date.now() - startTime;

    // Log slow queries
    if (duration > 500) {
      addBreadcrumb({
        message: `Slow Database Query: ${queryName}`,
        category: 'database',
        level: 'warning',
        data: {
          duration,
          query: queryName,
        },
      });
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    captureError(error as Error, {
      query: queryName,
      duration,
      type: 'database',
    });

    throw error;
  }
}

/**
 * Middleware to track external API calls
 * 
 * @param apiCall - The external API call function
 * @param apiName - Name of the external API
 * @returns Wrapped API call with performance tracking
 */
export async function trackExternalApi<T>(
  apiCall: () => Promise<T>,
  apiName: string
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await trackPerformance(
      `external.${apiName}`,
      apiCall,
      {
        type: 'external_api',
      }
    );

    const duration = Date.now() - startTime;

    // Log slow external calls
    if (duration > 2000) {
      addBreadcrumb({
        message: `Slow External API Call: ${apiName}`,
        category: 'external',
        level: 'warning',
        data: {
          duration,
          api: apiName,
        },
      });
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    captureError(error as Error, {
      api: apiName,
      duration,
      type: 'external_api',
    });

    throw error;
  }
}

/**
 * Create a Sentry transaction for manual tracking
 * 
 * @param name - Transaction name
 * @param op - Operation type
 * @returns Transaction object
 */
export function createTransaction(name: string, op: string = 'http.server') {
  return Sentry.startTransaction({
    name,
    op,
  });
}

/**
 * Add custom span to current transaction
 * 
 * @param operation - Operation name
 * @param description - Operation description
 * @param callback - Function to execute within span
 * @returns Result of callback
 */
export async function addSpan<T>(
  operation: string,
  description: string,
  callback: () => Promise<T>
): Promise<T> {
  const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();
  
  if (!transaction) {
    return callback();
  }

  const span = transaction.startChild({
    op: operation,
    description,
  });

  try {
    const result = await callback();
    span.setStatus('ok');
    return result;
  } catch (error) {
    span.setStatus('internal_error');
    throw error;
  } finally {
    span.finish();
  }
}
