/**
 * Property-Based Tests for Sentry Error Context Completeness
 * 
 * Feature: remaining-high-priority-work-jan-2025, Property 36: Error Context Completeness
 * Validates: Requirements 4.4
 * 
 * Tests that all errors include complete context information for debugging.
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import * as fc from 'fast-check';
import * as Sentry from '@sentry/nextjs';
import {
  captureError,
  setUserContext,
  addBreadcrumb,
  setTags,
} from '../../lib/monitoring/sentry';

// Mock Sentry
jest.mock('@sentry/nextjs');

describe('Property 36: Error Context Completeness', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Property: All errors include timestamp
   * Every error capture should include a timestamp
   */
  it('should include timestamp for all errors', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        (errorMessage) => {
          // Arrange
          const error = new Error(errorMessage);
          const beforeCapture = Date.now();
          (Sentry.captureException as jest.Mock).mockReturnValue('event-id');

          // Act
          captureError(error, {
            timestamp: new Date().toISOString(),
          });

          const afterCapture = Date.now();

          // Assert
          expect(Sentry.captureException).toHaveBeenCalled();
          const context = (Sentry.setContext as jest.Mock).mock.calls[0][1];
          expect(context.timestamp).toBeDefined();
          
          // Verify timestamp is within reasonable range
          const capturedTime = new Date(context.timestamp).getTime();
          expect(capturedTime).toBeGreaterThanOrEqual(beforeCapture);
          expect(capturedTime).toBeLessThanOrEqual(afterCapture);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Errors with user context include all user fields
   * When user context is set, all user fields should be included
   */
  it('should include complete user context', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          email: fc.emailAddress(),
          username: fc.string({ minLength: 3 }),
          role: fc.constantFrom('student', 'teacher', 'parent', 'admin'),
        }),
        fc.string({ minLength: 1 }),
        (user, errorMessage) => {
          // Arrange
          const error = new Error(errorMessage);
          (Sentry.captureException as jest.Mock).mockReturnValue('event-id');

          // Act
          setUserContext(user);
          captureError(error);

          // Assert
          expect(Sentry.setUser).toHaveBeenCalledWith({
            id: user.id,
            email: user.email,
            username: user.username,
            role: user.role,
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Errors include environment information
   * All errors should include environment context
   */
  it('should include environment information', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.record({
          environment: fc.constantFrom('development', 'staging', 'production'),
          version: fc.string(),
          platform: fc.constantFrom('web', 'mobile', 'api'),
        }),
        (errorMessage, envContext) => {
          // Arrange
          const error = new Error(errorMessage);
          (Sentry.captureException as jest.Mock).mockReturnValue('event-id');

          // Act
          setTags({
            environment: envContext.environment,
            version: envContext.version,
            platform: envContext.platform,
          });
          captureError(error);

          // Assert
          expect(Sentry.setTag).toHaveBeenCalledWith('environment', envContext.environment);
          expect(Sentry.setTag).toHaveBeenCalledWith('version', envContext.version);
          expect(Sentry.setTag).toHaveBeenCalledWith('platform', envContext.platform);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: API errors include request details
   * All API errors should include method, URL, and headers
   */
  it('should include complete request context for API errors', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.record({
          method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE', 'PATCH'),
          url: fc.webUrl(),
          statusCode: fc.integer({ min: 400, max: 599 }),
          headers: fc.record({
            'user-agent': fc.string(),
            'content-type': fc.constantFrom('application/json', 'text/html'),
          }),
          body: fc.anything(),
        }),
        (errorMessage, requestContext) => {
          // Arrange
          const error = new Error(errorMessage);
          (Sentry.captureException as jest.Mock).mockReturnValue('event-id');

          // Act
          captureError(error, requestContext);

          // Assert
          expect(Sentry.setContext).toHaveBeenCalledWith('additional', requestContext);
          const context = (Sentry.setContext as jest.Mock).mock.calls[0][1];
          expect(context.method).toBe(requestContext.method);
          expect(context.url).toBe(requestContext.url);
          expect(context.statusCode).toBe(requestContext.statusCode);
          expect(context.headers).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Database errors include query context
   * All database errors should include query, table, and operation
   */
  it('should include complete database context', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.record({
          query: fc.string(),
          table: fc.string(),
          operation: fc.constantFrom('SELECT', 'INSERT', 'UPDATE', 'DELETE'),
          duration: fc.integer({ min: 0, max: 10000 }),
          rowCount: fc.integer({ min: 0, max: 1000 }),
        }),
        (errorMessage, dbContext) => {
          // Arrange
          const error = new Error(errorMessage);
          (Sentry.captureException as jest.Mock).mockReturnValue('event-id');

          // Act
          captureError(error, dbContext);

          // Assert
          expect(Sentry.setContext).toHaveBeenCalledWith('additional', dbContext);
          const context = (Sentry.setContext as jest.Mock).mock.calls[0][1];
          expect(context.query).toBe(dbContext.query);
          expect(context.table).toBe(dbContext.table);
          expect(context.operation).toBe(dbContext.operation);
          expect(context.duration).toBe(dbContext.duration);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Breadcrumbs provide action trail
   * Multiple breadcrumbs should create a complete action trail
   */
  it('should maintain complete breadcrumb trail', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            message: fc.string({ minLength: 1 }),
            category: fc.string(),
            level: fc.constantFrom('info', 'warning', 'error'),
            data: fc.record({
              action: fc.string(),
              value: fc.anything(),
            }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        fc.string({ minLength: 1 }),
        (breadcrumbs, errorMessage) => {
          // Arrange
          const error = new Error(errorMessage);
          (Sentry.captureException as jest.Mock).mockReturnValue('event-id');

          // Act
          breadcrumbs.forEach(breadcrumb => addBreadcrumb(breadcrumb));
          captureError(error);

          // Assert
          expect(Sentry.addBreadcrumb).toHaveBeenCalledTimes(breadcrumbs.length);
          breadcrumbs.forEach((breadcrumb, index) => {
            const call = (Sentry.addBreadcrumb as jest.Mock).mock.calls[index][0];
            expect(call.message).toBe(breadcrumb.message);
            expect(call.category).toBe(breadcrumb.category);
            expect(call.level).toBe(breadcrumb.level);
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: File upload errors include file metadata
   * All file upload errors should include complete file information
   */
  it('should include complete file context for upload errors', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.record({
          fileName: fc.string(),
          fileSize: fc.integer({ min: 0, max: 100000000 }),
          fileType: fc.constantFrom('image/jpeg', 'image/png', 'application/pdf', 'video/mp4'),
          uploadProgress: fc.integer({ min: 0, max: 100 }),
          bucket: fc.string(),
          path: fc.string(),
        }),
        (errorMessage, fileContext) => {
          // Arrange
          const error = new Error(errorMessage);
          (Sentry.captureException as jest.Mock).mockReturnValue('event-id');

          // Act
          captureError(error, fileContext);

          // Assert
          expect(Sentry.setContext).toHaveBeenCalledWith('additional', fileContext);
          const context = (Sentry.setContext as jest.Mock).mock.calls[0][1];
          expect(context.fileName).toBe(fileContext.fileName);
          expect(context.fileSize).toBe(fileContext.fileSize);
          expect(context.fileType).toBe(fileContext.fileType);
          expect(context.uploadProgress).toBe(fileContext.uploadProgress);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Payment errors include transaction details
   * All payment errors should include complete transaction context
   */
  it('should include complete payment context', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.record({
          amount: fc.integer({ min: 1, max: 100000 }),
          currency: fc.constantFrom('USD', 'EUR', 'GBP', 'INR'),
          paymentMethod: fc.constantFrom('stripe', 'paypal', 'razorpay'),
          transactionId: fc.uuid(),
          customerId: fc.uuid(),
          status: fc.constantFrom('pending', 'processing', 'failed'),
        }),
        (errorMessage, paymentContext) => {
          // Arrange
          const error = new Error(errorMessage);
          (Sentry.captureException as jest.Mock).mockReturnValue('event-id');

          // Act
          captureError(error, paymentContext);

          // Assert
          expect(Sentry.setContext).toHaveBeenCalledWith('additional', paymentContext);
          const context = (Sentry.setContext as jest.Mock).mock.calls[0][1];
          expect(context.amount).toBe(paymentContext.amount);
          expect(context.currency).toBe(paymentContext.currency);
          expect(context.paymentMethod).toBe(paymentContext.paymentMethod);
          expect(context.transactionId).toBe(paymentContext.transactionId);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Context is preserved across multiple operations
   * Setting multiple context types should preserve all information
   */
  it('should preserve all context types', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          email: fc.emailAddress(),
          username: fc.string(),
          role: fc.string(),
        }),
        fc.record({
          feature: fc.string(),
          version: fc.string(),
        }),
        fc.record({
          action: fc.string(),
          value: fc.anything(),
        }),
        fc.string({ minLength: 1 }),
        (user, tags, additionalContext, errorMessage) => {
          // Arrange
          const error = new Error(errorMessage);
          (Sentry.captureException as jest.Mock).mockReturnValue('event-id');

          // Act
          setUserContext(user);
          setTags(tags);
          captureError(error, additionalContext);

          // Assert
          expect(Sentry.setUser).toHaveBeenCalledWith(user);
          Object.entries(tags).forEach(([key, value]) => {
            expect(Sentry.setTag).toHaveBeenCalledWith(key, value);
          });
          expect(Sentry.setContext).toHaveBeenCalledWith('additional', additionalContext);
        }
      ),
      { numRuns: 50 }
    );
  });
});
