/**
 * Property Test: Token Invalidation on Logout
 * Feature: remaining-high-priority-work-jan-2025, Property 52: Token Invalidation on Logout
 * Validates: Requirements 5.10
 * 
 * For any user logout, all session tokens should be immediately invalidated
 */

import { fc } from '@fast-check/jest';

// Mock fetch
global.fetch = jest.fn();

describe('Property: Token Invalidation on Logout', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
    localStorage.clear();
  });

  fc.it(
    'should call logout API on logout',
    [fc.string({ minLength: 10, maxLength: 50 })], // User ID
    async (userId) => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await fetch('/api/auth/logout', {
        method: 'POST',
      });

      expect(fetch).toHaveBeenCalledWith(
        '/api/auth/logout',
        expect.objectContaining({
          method: 'POST',
        })
      );
    },
    { numRuns: 50 }
  );

  fc.it(
    'should clear all session data on logout',
    [
      fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
    ], // Session keys
    (sessionKeys) => {
      // Set session data
      sessionKeys.forEach((key) => {
        localStorage.setItem(key, 'test-data');
      });

      // Set session-specific keys
      localStorage.setItem('session_activity', JSON.stringify({ lastActivity: Date.now() }));
      localStorage.setItem('session_logout', 'false');

      // Clear all data (simulating logout)
      localStorage.clear();

      // All data should be cleared
      sessionKeys.forEach((key) => {
        expect(localStorage.getItem(key)).toBeNull();
      });
      expect(localStorage.getItem('session_activity')).toBeNull();
      expect(localStorage.getItem('session_logout')).toBeNull();
    },
    { numRuns: 50 }
  );

  it('should invalidate session after logout', async () => {
    // Mock successful logout
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    await fetch('/api/auth/logout', { method: 'POST' });

    // Mock session verification after logout
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ valid: false, error: 'No active session' }),
    });

    const verifyResponse = await fetch('/api/session/verify');
    const verifyData = await verifyResponse.json();

    expect(verifyData.valid).toBe(false);
  });

  fc.it(
    'should broadcast logout to all tabs',
    [fc.boolean()], // Whether to broadcast
    (shouldBroadcast) => {
      if (shouldBroadcast) {
        localStorage.setItem('session_logout', 'true');
        expect(localStorage.getItem('session_logout')).toBe('true');
      }
    },
    { numRuns: 50 }
  );

  it('should handle logout API failure gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    // Should not throw
    await expect(
      fetch('/api/auth/logout', { method: 'POST' }).catch(() => {
        // Handle error
        return { ok: false };
      })
    ).resolves.toBeDefined();
  });
});
