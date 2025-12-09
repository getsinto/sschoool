/**
 * Property-Based Tests for Sentry Performance Tracking
 * 
 * Feature: remaining-high-priority-work-jan-2025, Property 34: Performance Tracking
 * Validates: Requirements 4.2
 * 
 * Tests that performance metrics are properly tracked and sent to Sentry
 * for all operations.
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import * as fc from 'fast-check';
import * as Sentry from '@sentry/nextjs';
import {
  trackPerformance,
  startTransaction,
} from '../../lib/monitoring/sentry';

// Mock Sentry
jest.mock('@sentry/nextjs');

describe('Property 34: Performance Tracking', () => {
  let mockTransaction: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock transaction object
    mockTransaction = {
      setStatus: jest.fn(),
      finish: jest.fn(),
      setData: jest.fn(),
      setTag: jest.fn(),
    };
    
    // Mock Sentry.startTransaction
    (Sentry.startTransaction as any) = jest.fn().mockReturnValue(mockTransaction);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Property: All operations are tracked
   * For any operation, trackPerformance should create a transaction
   */
  it('should create transaction for all operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        fc.record({
          userId: fc.uuid(),
          endpoint: fc.string(),
        }),
        fc.integer({ min: 0, max: 1000 }),
        async (operationName, data, delay) => {
          // Arrange
          const operation = async () => {
            await new Promise(resolve => setTimeout(resolve, delay));
            return 'success';
          };

          // Act
          const result = await trackPerformance(operationName, operation, data);

          // Assert
          expect(Sentry.startTransaction).toHaveBeenCalledWith({
            name: operationName,
            op: 'function',
            data,
          });
          expect(mockTransaction.setStatus).toHaveBeenCalledWith('ok');
          expect(mockTransaction.finish).toHaveBeenCalled();
          expect(result).toBe('success');
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Failed operations are tracked with error status
   * For any operation that throws, trackPerformance should set error status
   */
  it('should track failed operations with error status', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        async (operationName, errorMessage) => {
          // Arrange
          const operation = async () => {
            throw new Error(errorMessage);
          };

          // Act & Assert
          await expect(trackPerformance(operationName, operation)).rejects.toThrow(errorMessage);
          expect(mockTransaction.setStatus).toHaveBeenCalledWith('internal_error');
          expect(mockTransaction.finish).toHaveBeenCalled();
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Transaction is always finished
   * Regardless of success or failure, transaction.finish() should be called
   */
  it('should always finish transactions', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        fc.boolean(),
        async (operationName, shouldSucceed) => {
          // Arrange
          const operation = async () => {
            if (shouldSucceed) {
              return 'success';
            } else {
              throw new Error('Operation failed');
            }
          };

          // Act
          try {
            await trackPerformance(operationName, operation);
          } catch (error) {
            // Expected for failed operations
          }

          // Assert
          expect(mockTransaction.finish).toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Transaction data is preserved
   * Any data passed to trackPerformance should be included in the transaction
   */
  it('should preserve transaction data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        fc.record({
          userId: fc.uuid(),
          action: fc.string(),
          metadata: fc.record({
            key: fc.string(),
            value: fc.anything(),
          }),
        }),
        async (operationName, data) => {
          // Arrange
          const operation = async () => 'success';

          // Act
          await trackPerformance(operationName, operation, data);

          // Assert
          expect(Sentry.startTransaction).toHaveBeenCalledWith({
            name: operationName,
            op: 'function',
            data,
          });
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Manual transactions can be started
   * For any transaction name and operation, startTransaction should return a transaction object
   */
  it('should create manual transactions', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.constantFrom('http', 'db', 'function', 'task'),
        (name, op) => {
          // Act
          const transaction = startTransaction(name, op);

          // Assert
          expect(Sentry.startTransaction).toHaveBeenCalledWith({ name, op });
          expect(transaction).toBe(mockTransaction);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Performance tracking preserves return values
   * For any operation return value, trackPerformance should return the same value
   */
  it('should preserve operation return values', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        fc.anything(),
        async (operationName, returnValue) => {
          // Arrange
          const operation = async () => returnValue;

          // Act
          const result = await trackPerformance(operationName, operation);

          // Assert
          expect(result).toEqual(returnValue);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Nested operations are tracked independently
   * Multiple trackPerformance calls should create separate transactions
   */
  it('should track nested operations independently', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        async (outerName, innerName) => {
          // Arrange
          fc.pre(outerName !== innerName); // Ensure names are different
          
          const innerOperation = async () => 'inner-result';
          const outerOperation = async () => {
            await trackPerformance(innerName, innerOperation);
            return 'outer-result';
          };

          // Act
          await trackPerformance(outerName, outerOperation);

          // Assert
          expect(Sentry.startTransaction).toHaveBeenCalledWith({
            name: outerName,
            op: 'function',
            data: undefined,
          });
          expect(Sentry.startTransaction).toHaveBeenCalledWith({
            name: innerName,
            op: 'function',
            data: undefined,
          });
          expect(Sentry.startTransaction).toHaveBeenCalledTimes(2);
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property: Performance tracking handles async operations
   * For any async operation with delay, trackPerformance should wait for completion
   */
  it('should handle async operations correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }),
        fc.integer({ min: 10, max: 500 }),
        async (operationName, delay) => {
          // Arrange
          let completed = false;
          const operation = async () => {
            await new Promise(resolve => setTimeout(resolve, delay));
            completed = true;
            return 'done';
          };

          // Act
          const result = await trackPerformance(operationName, operation);

          // Assert
          expect(completed).toBe(true);
          expect(result).toBe('done');
          expect(mockTransaction.finish).toHaveBeenCalled();
        }
      ),
      { numRuns: 30 }
    );
  });
});
