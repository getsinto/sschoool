/**
 * App Error Page
 * 
 * This catches errors in the app directory
 */

'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        
        <h2 className="mt-4 text-xl font-semibold text-center text-gray-900">
          Something went wrong
        </h2>
        
        <p className="mt-2 text-sm text-center text-gray-600">
          We're sorry for the inconvenience. The error has been reported to our team.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <p className="text-xs font-mono text-gray-800 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-gray-600">
                Error ID: {error.digest}
              </p>
            )}
            {error.stack && (
              <details className="mt-2">
                <summary className="text-xs text-gray-600 cursor-pointer">
                  Stack Trace
                </summary>
                <pre className="mt-2 text-xs text-gray-700 overflow-auto max-h-40">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={reset}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
          
          <a
            href="/"
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
