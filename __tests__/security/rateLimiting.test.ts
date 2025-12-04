/**
 * Rate Limiting Security Tests
 * Implements Task 13.4: Write security tests for rate limiting
 */

import {
  checkRateLimit,
  rateLimitCourseCreation,
  rateLimitCategoryCreation,
  rateLimitFileUpload,
  rateLimitCategoryUpdate,
  createRateLimitHeaders,
} from '@/lib/middleware/rateLimit';

describe('Rate Limiting Security Tests', () => {
  const testUserId = 'test-user-123';

  describe('Basic Rate Limiting', () => {
    it('should allow requests within limit', async () => {
      const result = await checkRateLimit(testUserId, 'test-operation', {
        maxRequests: 5,
        windowMs: 60000,
        keyPrefix: 'test',
      });

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThan(0);
    });

    it('should block requests exceeding limit', async () => {
      const config = {
        maxRequests: 2,
        windowMs: 60000,
        keyPrefix: 'test-block',
      };

      // Make requests up to limit
      await checkRateLimit(testUserId, 'block-test', config);
      await checkRateLimit(testUserId, 'block-test', config);

      // This should be blocked
      const result = await checkRateLimit(testUserId, 'block-test', config);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should reset after window expires', async () => {
      const config = {
        maxRequests: 1,
        windowMs: 100, // 100ms window
        keyPrefix: 'test-reset',
      };

      // Use up the limit
      const first = await checkRateLimit(testUserId, 'reset-test', config);
      expect(first.allowed).toBe(true);

      // Should be blocked immediately
      const second = await checkRateLimit(testUserId, 'reset-test', config);
      expect(second.allowed).toBe(false);

      // Wait for window to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Should be allowed again
      const third = await checkRateLimit(testUserId, 'reset-test', config);
      expect(third.allowed).toBe(true);
    });

    it('should track different users separately', async () => {
      const config = {
        maxRequests: 1,
        windowMs: 60000,
        keyPrefix: 'test-users',
      };

      const user1 = await checkRateLimit('user-1', 'multi-user', config);
      const user2 = await checkRateLimit('user-2', 'multi-user', config);

      expect(user1.allowed).toBe(true);
      expect(user2.allowed).toBe(true);
    });
  });

  describe('Category Creation Rate Limiting', () => {
    it('should limit category creation to 5 per minute', async () => {
      const userId = 'category-test-user';

      // Make 5 requests (should all succeed)
      for (let i = 0; i < 5; i++) {
        const result = await rateLimitCategoryCreation(userId);
        expect(result.allowed).toBe(true);
      }

      // 6th request should be blocked
      const blocked = await rateLimitCategoryCreation(userId);
      expect(blocked.allowed).toBe(false);
      expect(blocked.retryAfter).toBeGreaterThan(0);
    });
  });

  describe('File Upload Rate Limiting', () => {
    it('should limit file uploads to 20 per hour', async () => {
      const userId = 'upload-test-user';

      // Make 20 requests (should all succeed)
      for (let i = 0; i < 20; i++) {
        const result = await rateLimitFileUpload(userId);
        expect(result.allowed).toBe(true);
      }

      // 21st request should be blocked
      const blocked = await rateLimitFileUpload(userId);
      expect(blocked.allowed).toBe(false);
    });
  });

  describe('Course Creation Rate Limiting', () => {
    it('should limit course creation to 10 per hour', async () => {
      const userId = 'course-test-user';

      // Make 10 requests (should all succeed)
      for (let i = 0; i < 10; i++) {
        const result = await rateLimitCourseCreation(userId);
        expect(result.allowed).toBe(true);
      }

      // 11th request should be blocked
      const blocked = await rateLimitCourseCreation(userId);
      expect(blocked.allowed).toBe(false);
    });
  });

  describe('Category Update Rate Limiting', () => {
    it('should limit category updates to 10 per minute', async () => {
      const userId = 'update-test-user';

      // Make 10 requests (should all succeed)
      for (let i = 0; i < 10; i++) {
        const result = await rateLimitCategoryUpdate(userId);
        expect(result.allowed).toBe(true);
      }

      // 11th request should be blocked
      const blocked = await rateLimitCategoryUpdate(userId);
      expect(blocked.allowed).toBe(false);
    });
  });

  describe('Rate Limit Headers', () => {
    it('should create correct headers for allowed requests', () => {
      const result = {
        allowed: true,
        remaining: 5,
        resetAt: new Date('2025-01-01T00:00:00Z'),
      };

      const headers = createRateLimitHeaders(result);

      expect(headers['X-RateLimit-Limit']).toBe('6');
      expect(headers['X-RateLimit-Remaining']).toBe('5');
      expect(headers['X-RateLimit-Reset']).toBe('2025-01-01T00:00:00.000Z');
      expect(headers['Retry-After']).toBeUndefined();
    });

    it('should create correct headers for blocked requests', () => {
      const result = {
        allowed: false,
        remaining: 0,
        resetAt: new Date('2025-01-01T00:00:00Z'),
        retryAfter: 60,
      };

      const headers = createRateLimitHeaders(result);

      expect(headers['X-RateLimit-Remaining']).toBe('0');
      expect(headers['Retry-After']).toBe('60');
    });
  });

  describe('Distributed Rate Limiting', () => {
    it('should handle concurrent requests correctly', async () => {
      const userId = 'concurrent-test-user';
      const config = {
        maxRequests: 5,
        windowMs: 60000,
        keyPrefix: 'test-concurrent',
      };

      // Make 10 concurrent requests
      const promises = Array.from({ length: 10 }, () =>
        checkRateLimit(userId, 'concurrent', config)
      );

      const results = await Promise.all(promises);

      // Only 5 should be allowed
      const allowed = results.filter((r) => r.allowed);
      const blocked = results.filter((r) => !r.allowed);

      expect(allowed.length).toBeLessThanOrEqual(5);
      expect(blocked.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('Rate Limit Bypass Prevention', () => {
    it('should not allow bypassing limits with different operations', async () => {
      const userId = 'bypass-test-user';

      // Each operation should have its own limit
      const op1 = await rateLimitCategoryCreation(userId);
      const op2 = await rateLimitFileUpload(userId);

      expect(op1.allowed).toBe(true);
      expect(op2.allowed).toBe(true);

      // But they should not share limits
      for (let i = 0; i < 5; i++) {
        await rateLimitCategoryCreation(userId);
      }

      const blocked = await rateLimitCategoryCreation(userId);
      expect(blocked.allowed).toBe(false);

      // File upload should still work
      const fileUpload = await rateLimitFileUpload(userId);
      expect(fileUpload.allowed).toBe(true);
    });
  });

  describe('Rate Limit Error Handling', () => {
    it('should handle invalid user IDs gracefully', async () => {
      const result = await checkRateLimit('', 'test', {
        maxRequests: 5,
        windowMs: 60000,
        keyPrefix: 'test',
      });

      expect(result).toBeDefined();
      expect(typeof result.allowed).toBe('boolean');
    });

    it('should handle invalid configurations gracefully', async () => {
      const result = await checkRateLimit(testUserId, 'test', {
        maxRequests: 0,
        windowMs: 0,
        keyPrefix: 'test',
      });

      expect(result).toBeDefined();
    });
  });
});
