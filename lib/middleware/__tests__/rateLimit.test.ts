/**
 * Rate Limiting Tests
 * Tests for the rate limiting middleware and functions
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import {
  checkRateLimit,
  rateLimitCourseCreation,
  rateLimitTeacherAssignment,
  rateLimitPermissionUpdate,
  createRateLimitHeaders,
  cleanupRateLimitStore
} from '../rateLimit';

describe('Rate Limiting', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    // Clean up rate limit store after each test
    cleanupRateLimitStore();
  });

  describe('checkRateLimit', () => {
    it('should allow requests within limit', async () => {
      const result = await checkRateLimit('user1', 'test_operation', {
        maxRequests: 5,
        windowMs: 60000,
        keyPrefix: 'test'
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
      expect(result.resetAt).toBeInstanceOf(Date);
      expect(result.retryAfter).toBeUndefined();
    });

    it('should block requests when limit exceeded', async () => {
      const config = {
        maxRequests: 2,
        windowMs: 60000,
        keyPrefix: 'test'
      };

      // Make requests up to the limit
      await checkRateLimit('user1', 'test_operation', config);
      await checkRateLimit('user1', 'test_operation', config);

      // This should be blocked
      const result = await checkRateLimit('user1', 'test_operation', config);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should reset counter after window expires', async () => {
      const config = {
        maxRequests: 1,
        windowMs: 100, // Very short window
        keyPrefix: 'test'
      };

      // Make a request
      const result1 = await checkRateLimit('user1', 'test_operation', config);
      expect(result1.allowed).toBe(true);

      // Wait for window to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Should be allowed again
      const result2 = await checkRateLimit('user1', 'test_operation', config);
      expect(result2.allowed).toBe(true);
    });

    it('should handle different users independently', async () => {
      const config = {
        maxRequests: 1,
        windowMs: 60000,
        keyPrefix: 'test'
      };

      // User 1 makes a request
      const result1 = await checkRateLimit('user1', 'test_operation', config);
      expect(result1.allowed).toBe(true);

      // User 2 should still be allowed
      const result2 = await checkRateLimit('user2', 'test_operation', config);
      expect(result2.allowed).toBe(true);
    });

    it('should handle different operations independently', async () => {
      const config = {
        maxRequests: 1,
        windowMs: 60000,
        keyPrefix: 'test'
      };

      // Make request for operation 1
      const result1 = await checkRateLimit('user1', 'operation1', config);
      expect(result1.allowed).toBe(true);

      // Should still be allowed for operation 2
      const result2 = await checkRateLimit('user1', 'operation2', config);
      expect(result2.allowed).toBe(true);
    });
  });

  describe('Specific rate limiters', () => {
    it('should apply course creation limits', async () => {
      const userId = 'teacher1';

      // Should allow initial requests
      for (let i = 0; i < 5; i++) {
        const result = await rateLimitCourseCreation(userId);
        expect(result.allowed).toBe(true);
      }

      // Should still allow more (limit is 10)
      const result = await rateLimitCourseCreation(userId);
      expect(result.allowed).toBe(true);
    });

    it('should apply teacher assignment limits', async () => {
      const userId = 'admin1';

      // Should allow many requests (limit is 50)
      for (let i = 0; i < 25; i++) {
        const result = await rateLimitTeacherAssignment(userId);
        expect(result.allowed).toBe(true);
      }
    });

    it('should apply permission update limits', async () => {
      const userId = 'admin1';

      // Should allow many requests (limit is 100)
      for (let i = 0; i < 50; i++) {
        const result = await rateLimitPermissionUpdate(userId);
        expect(result.allowed).toBe(true);
      }
    });
  });

  describe('createRateLimitHeaders', () => {
    it('should create correct headers for allowed request', () => {
      const result = {
        allowed: true,
        remaining: 5,
        resetAt: new Date('2024-01-01T12:00:00Z')
      };

      const headers = createRateLimitHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe('6');
      expect(headers['X-RateLimit-Remaining']).toBe('5');
      expect(headers['X-RateLimit-Reset']).toBe('2024-01-01T12:00:00.000Z');
      expect(headers['Retry-After']).toBeUndefined();
    });

    it('should create correct headers for blocked request', () => {
      const result = {
        allowed: false,
        remaining: 0,
        resetAt: new Date('2024-01-01T12:00:00Z'),
        retryAfter: 30
      };

      const headers = createRateLimitHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe('0');
      expect(headers['X-RateLimit-Remaining']).toBe('0');
      expect(headers['X-RateLimit-Reset']).toBe('2024-01-01T12:00:00.000Z');
      expect(headers['Retry-After']).toBe('30');
    });
  });

  describe('cleanupRateLimitStore', () => {
    it('should remove expired entries', async () => {
      const config = {
        maxRequests: 1,
        windowMs: 100, // Very short window
        keyPrefix: 'test'
      };

      // Create an entry
      await checkRateLimit('user1', 'test_operation', config);

      // Wait for it to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Cleanup
      cleanupRateLimitStore();

      // Should be able to make request again (entry was cleaned up)
      const result = await checkRateLimit('user1', 'test_operation', config);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(0); // Fresh counter
    });
  });

  describe('Edge cases', () => {
    it('should handle concurrent requests correctly', async () => {
      const config = {
        maxRequests: 5,
        windowMs: 60000,
        keyPrefix: 'test'
      };

      // Make multiple concurrent requests
      const promises = Array.from({ length: 10 }, () => 
        checkRateLimit('user1', 'test_operation', config)
      );

      const results = await Promise.all(promises);

      // Should allow first 5, block the rest
      const allowedCount = results.filter(r => r.allowed).length;
      const blockedCount = results.filter(r => !r.allowed).length;

      expect(allowedCount).toBe(5);
      expect(blockedCount).toBe(5);
    });

    it('should handle very large user IDs', async () => {
      const longUserId = 'a'.repeat(1000);
      const config = {
        maxRequests: 1,
        windowMs: 60000,
        keyPrefix: 'test'
      };

      const result = await checkRateLimit(longUserId, 'test_operation', config);
      expect(result.allowed).toBe(true);
    });

    it('should handle special characters in user IDs', async () => {
      const specialUserId = 'user-123_test@example.com';
      const config = {
        maxRequests: 1,
        windowMs: 60000,
        keyPrefix: 'test'
      };

      const result = await checkRateLimit(specialUserId, 'test_operation', config);
      expect(result.allowed).toBe(true);
    });
  });
});
