/**
 * Property-Based Tests for Sentry Error Capture
 * 
 * Feature: remaining-high-priority-work-jan-2025, Property 33: Error Capture
 * Validates: Requirements 4.1
 * 
 * Tests that all errors are properly captured and sent to Sentry
 * with appropriate context and metadata.
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import * as fc from 'fast-check';
import * as Sentry from '@sentry/nextjs';
import {
  captureError,
  captureMessage,
  setUserContext,
  addBreadcrumb,
  setTags,
} from '../../lib/monitoring/sentry';

// Mock Sentry
jest.mock('@sentry/nextjs');

describe('Property 33: Error Capture', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Property: All errors are captured
   * For any error, calling captureError should result in Sentry.captureException being called
   */
  it('should capture all Error objects', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        fc.record({
          code: fc.string(),
          statusCode: fc.integer({ min: 400, max: 599 }),
          userId: fc.uuid(),
        }),
        (message, stack, context) => {
          // Arrange
          const error = new Error(message);
          error.stack = stack;
          (Sentry.captureException as jest.Mock).mockReturnValue('test-event-id');

          // Act
          const eventId = captureError(error, context);

          // Assert
          expect(Sentry.captureException).toHaveBeenCalledWith(error);
          expect(Sentry.setContext).toHaveBeenCalledWith('additional', context);
          expect(eventId).toBe('test-event-id');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: String errors are captured as messages
   * For any string error, calling captureError should result in Sentry.captureMessage being called
   */
  it('should capture string errors as messages', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.record({
          component: fc.string(),
          action: fc.string(),
        }),
        (errorMessage, context) => {
          // Arrange
          (Sentry.captureMessage as jest.Mock).mockReturnValue('test-message-id');

          // Act
          const eventId = captureError(errorMessage, context);

          // Assert
          expect(Sentry.captureMessage).toHaveBeenCalledWith(errorMessage, 'error');
          expect(Sentry.setContext).toHaveBeenCalledWith('additional', context);
          expect(eventId).toBe('test-message-id');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: User context is properly set
   * For any user data, calling setUserContext should result in Sentry.setUser being called
   */
  it('should set user context correctly', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          email: fc.emailAddress(),
          username: fc.string({ minLength: 3 }),
          role: fc.constantFrom('student', 'teacher', 'parent', 'admin'),
        }),
        (user) => {
          // Act
          setUserContext(user);

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
   * Property: Messages are captured with correct severity
   * For any message and severity level, captureMessage should call Sentry with correct parameters
   */
  it('should capture messages with correct severity levels', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.constantFrom('info', 'warning', 'error', 'fatal'),
        fc.record({
          feature: fc.string(),
          timestamp: fc.date(),
        }),
        (message, level, context) => {
          // Arrange
          (Sentry.captureMessage as jest.Mock).mockReturnValue('test-message-id');

          // Act
          const eventId = captureMessage(message, level as any, context);

          // Assert
          expect(Sentry.captureMessage).toHaveBeenCalledWith(message, level);
          expect(Sentry.setContext).toHaveBeenCalledWith('additional', context);
          expect(eventId).toBe('test-message-id');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Breadcrumbs are added correctly
   * For any breadcrumb data, addBreadcrumb should call Sentry.addBreadcrumb
   */
  it('should add breadcrumbs with all required fields', () => {
    fc.assert(
      fc.property(
        fc.record({
          message: fc.string({ minLength: 1 }),
          category: fc.string(),
          level: fc.constantFrom('info', 'warning', 'error'),
          data: fc.record({
            action: fc.string(),
            value: fc.anything(),
          }),
        }),
        (breadcrumb) => {
          // Act
          addBreadcrumb(breadcrumb);

          // Assert
          expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
            expect.objectContaining({
              message: breadcrumb.message,
              category: breadcrumb.category,
              level: breadcrumb.level,
              data: breadcrumb.data,
              timestamp: expect.any(Number),
            })
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Tags are set correctly
   * For any set of tags, setTags should call Sentry.setTag for each tag
   */
  it('should set all tags correctly', () => {
    fc.assert(
      fc.property(
        fc.dictionary(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          { minKeys: 1, maxKeys: 10 }
        ),
        (tags) => {
          // Act
          setTags(tags);

          // Assert
          Object.entries(tags).forEach(([key, value]) => {
            expect(Sentry.setTag).toHaveBeenCalledWith(key, value);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Context is preserved across multiple operations
   * Setting context, then capturing an error should include that context
   */
  it('should preserve context across operations', () => {
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
          action: fc.string(),
        }),
        fc.string({ minLength: 1 }),
        (user, tags, errorMessage) => {
          // Arrange
          (Sentry.captureMessage as jest.Mock).mockReturnValue('test-id');

          // Act
          setUserContext(user);
          setTags(tags);
          captureError(errorMessage);

          // Assert
          expect(Sentry.setUser).toHaveBeenCalledWith(user);
          Object.entries(tags).forEach(([key, value]) => {
            expect(Sentry.setTag).toHaveBeenCalledWith(key, value);
          });
          expect(Sentry.captureMessage).toHaveBeenCalledWith(errorMessage, 'error');
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Error capture returns valid event IDs
   * All captured errors should return a non-empty event ID
   */
  it('should return valid event IDs for all captures', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string({ minLength: 1 }),
          fc.constant(new Error('Test error'))
        ),
        (error) => {
          // Arrange
          const mockEventId = `event-${Math.random().toString(36).substr(2, 9)}`;
          if (typeof error === 'string') {
            (Sentry.captureMessage as jest.Mock).mockReturnValue(mockEventId);
          } else {
            (Sentry.captureException as jest.Mock).mockReturnValue(mockEventId);
          }

          // Act
          const eventId = captureError(error);

          // Assert
          expect(eventId).toBeTruthy();
          expect(typeof eventId).toBe('string');
          expect(eventId.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
