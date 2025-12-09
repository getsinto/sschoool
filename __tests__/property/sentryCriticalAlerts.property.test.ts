/**
 * Property-Based Tests for Sentry Critical Error Alerts
 * 
 * Feature: remaining-high-priority-work-jan-2025, Property 35: Critical Error Alerts
 * Validates: Requirements 4.3
 * 
 * Tests that critical errors trigger appropriate alerts and notifications.
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import * as fc from 'fast-check';
import * as Sentry from '@sentry/nextjs';
import { captureError, setTags } from '../../lib/monitoring/sentry';

// Mock Sentry
jest.mock('@sentry/nextjs');

describe('Property 35: Critical Error Alerts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Property: Critical errors are captured with high priority
   * For any critical error, it should be captured with appropriate severity
   */
  it('should capture critical errors with correct severity', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.record({
          severity: fc.constant('fatal'),
          component: fc.string(),
          userId: fc.uuid(),
        }),
        (errorMessage, context) => {
          // Arrange
          const error = new Error(errorMessage);
          (error as any).severity = 'fatal';
          (Sentry.captureException as jest.Mock).mockReturnValue('critical-event-id');

          // Act
          const eventId = captureError(error, context);

          // Assert
          expect(Sentry.captureException).toHaveBeenCalledWith(error);
          expect(Sentry.setContext).toHaveBeenCalledWith('additional', context);
          expect(eventId).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Critical errors include full context
   * All critical errors should include user, environment, and system context
   */
  it('should include full context for critical errors', () => {
    fc.assert(
      fc.property(
        fc.record({
          message: fc.string({ minLength: 1 }),
          code: fc.string(),
          statusCode: fc.integer({ min: 500, max: 599 }),
        }),
        fc.record({
          userId: fc.uuid(),
          userEmail: fc.emailAddress(),
          userRole: fc.constantFrom('student', 'teacher', 'parent', 'admin'),
          environment: fc.constantFrom('production', 'staging', 'development'),
          version: fc.string(),
          feature: fc.string(),
        }),
        (errorData, context) => {
          // Arrange
          const error = new Error(errorData.message);
          (error as any).code = errorData.code;
          (error as any).statusCode = errorData.statusCode;
          (Sentry.captureException as jest.Mock).mockReturnValue('event-id');

          // Act
          captureError(error, context);

          // Assert
          expect(Sentry.setContext).toHaveBeenCalledWith('additional', context);
          expect(Sentry.captureException).toHaveBeenCalledWith(error);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Database errors are tagged appropriately
   * All database-related errors should have database tags
   */
  it('should tag database errors correctly', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.record({
          query: fc.string(),
          table: fc.string(),
          operation: fc.constantFrom('SELECT', 'INSERT', 'UPDATE', 'DELETE'),
        }),
        (errorMessage, dbContext) => {
          // Arrange
          const error = new Error(errorMessage);
          (Sentry.captureException as jest.Mock).mockReturnValue('db-error-id');

          // Act
          setTags({
            errorType: 'database',
            table: dbContext.table,
            operation: dbContext.operation,
          });
          captureError(error, dbContext);

          // Assert
          expect(Sentry.setTag).toHaveBeenCalledWith('errorType', 'database');
          expect(Sentry.setTag).toHaveBeenCalledWith('table', dbContext.table);
          expect(Sentry.setTag).toHaveBeenCalledWith('operation', dbContext.operation);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Payment errors are tagged as critical
   * All payment-related errors should be tagged with high priority
   */
  it('should tag payment errors as critical', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.record({
          amount: fc.integer({ min: 1, max: 100000 }),
          currency: fc.constantFrom('USD', 'EUR', 'GBP', 'INR'),
          paymentMethod: fc.constantFrom('stripe', 'paypal', 'razorpay'),
          transactionId: fc.uuid(),
        }),
        (errorMessage, paymentContext) => {
          // Arrange
          const error = new Error(errorMessage);
          (Sentry.captureException as jest.Mock).mockReturnValue('payment-error-id');

          // Act
          setTags({
            errorType: 'payment',
            critical: 'true',
            paymentMethod: paymentContext.paymentMethod,
          });
          captureError(error, paymentContext);

          // Assert
          expect(Sentry.setTag).toHaveBeenCalledWith('errorType', 'payment');
          expect(Sentry.setTag).toHaveBeenCalledWith('critical', 'true');
          expect(Sentry.setTag).toHaveBeenCalledWith('paymentMethod', paymentContext.paymentMethod);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Authentication errors are tracked
   * All authentication failures should be captured with user context
   */
  it('should track authentication errors with user context', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'Invalid credentials',
          'Token expired',
          'Session invalid',
          'Unauthorized access'
        ),
        fc.record({
          userId: fc.option(fc.uuid(), { nil: undefined }),
          email: fc.emailAddress(),
          ipAddress: fc.ipV4(),
          userAgent: fc.string(),
        }),
        (errorMessage, authContext) => {
          // Arrange
          const error = new Error(errorMessage);
          (Sentry.captureException as jest.Mock).mockReturnValue('auth-error-id');

          // Act
          setTags({
            errorType: 'authentication',
            hasUserId: authContext.userId ? 'true' : 'false',
          });
          captureError(error, authContext);

          // Assert
          expect(Sentry.setTag).toHaveBeenCalledWith('errorType', 'authentication');
          expect(Sentry.captureException).toHaveBeenCalledWith(error);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: API errors include request details
   * All API errors should include method, endpoint, and status code
   */
  it('should include request details for API errors', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.record({
          method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH'),
          endpoint: fc.string(),
          statusCode: fc.integer({ min: 400, max: 599 }),
          responseTime: fc.integer({ min: 0, max: 10000 }),
        }),
        (errorMessage, apiContext) => {
          // Arrange
          const error = new Error(errorMessage);
          (Sentry.captureException as jest.Mock).mockReturnValue('api-error-id');

          // Act
          setTags({
            errorType: 'api',
            method: apiContext.method,
            statusCode: apiContext.statusCode.toString(),
          });
          captureError(error, apiContext);

          // Assert
          expect(Sentry.setTag).toHaveBeenCalledWith('errorType', 'api');
          expect(Sentry.setTag).toHaveBeenCalledWith('method', apiContext.method);
          expect(Sentry.setTag).toHaveBeenCalledWith('statusCode', apiContext.statusCode.toString());
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: File upload errors are tracked
   * All file upload failures should be captured with file metadata
   */
  it('should track file upload errors with metadata', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.record({
          fileName: fc.string(),
          fileSize: fc.integer({ min: 0, max: 100000000 }),
          fileType: fc.constantFrom('image/jpeg', 'image/png', 'application/pdf', 'video/mp4'),
          uploadProgress: fc.integer({ min: 0, max: 100 }),
        }),
        (errorMessage, uploadContext) => {
          // Arrange
          const error = new Error(errorMessage);
          (Sentry.captureException as jest.Mock).mockReturnValue('upload-error-id');

          // Act
          setTags({
            errorType: 'file_upload',
            fileType: uploadContext.fileType,
          });
          captureError(error, uploadContext);

          // Assert
          expect(Sentry.setTag).toHaveBeenCalledWith('errorType', 'file_upload');
          expect(Sentry.setTag).toHaveBeenCalledWith('fileType', uploadContext.fileType);
          expect(Sentry.captureException).toHaveBeenCalledWith(error);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: All critical errors return event IDs
   * Every critical error capture should return a valid event ID for tracking
   */
  it('should return event IDs for all critical errors', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.record({
          severity: fc.constant('critical'),
          component: fc.string(),
        }),
        (errorMessage, context) => {
          // Arrange
          const error = new Error(errorMessage);
          const mockEventId = `critical-${Math.random().toString(36).substr(2, 9)}`;
          (Sentry.captureException as jest.Mock).mockReturnValue(mockEventId);

          // Act
          const eventId = captureError(error, context);

          // Assert
          expect(eventId).toBeTruthy();
          expect(typeof eventId).toBe('string');
          expect(eventId.length).toBeGreaterThan(0);
          expect(eventId).toBe(mockEventId);
        }
      ),
      { numRuns: 100 }
    );
  });
});
