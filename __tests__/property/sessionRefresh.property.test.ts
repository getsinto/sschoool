/**
 * Property Test: Session Refresh on Action
 * Feature: remaining-high-priority-work-jan-2025, Property 45: Session Refresh on Action
 * Validates: Requirements 5.3
 * 
 * For any "Stay Logged In" action, the session should be refreshed and timeout reset
 */

import { fc } from '@fast-check/jest';
import {
  initializeSessionTracking,
  cleanupSessionTracking,
  refreshSession,
  getTimeUntilWarning,
} from '@/lib/session/manager';

// Mock fetch
global.fetch = jest.fn();

describe('Property: Session Refresh on Action', () => {
  beforeEach(() => {
    cleanupSessionTracking();
    localStorage.clear();
    jest.useFakeTimers();
    (global.fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    cleanupSessionTracking();
    jest.useRealTimers();
  });

  fc.it(
    'should reset timeout after successful session refresh',
    [fc.integer({ min: 20, max: 29 })], // Minutes of inactivity before refresh
    async (inactivityMinutes) => {
      // Mock successful refresh
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, expiresAt: Date.now() + 3600000 }),
      });

      initializeSessionTracking({
        onWarning: jest.fn(),
        onLogout: jest.fn(),
      });

      // Advance time to simulate inactivity
      jest.advanceTimersByTime(inactivityMinutes * 60 * 1000);

      // Get time until warning before refresh
      const timeBeforeRefresh = getTimeUntilWarning();

      // Refresh session
      await refreshSession();

      // Get time until warning after refresh
      const timeAfterRefresh = getTimeUntilWarning();

      // Time until warning should be reset (increased)
      expect(timeAfterRefresh).toBeGreaterThan(timeBeforeRefresh);
      expect(timeAfterRefresh).toBeGreaterThan(20 * 60 * 1000); // At least 20 minutes
    },
    { numRuns: 50 }
  );

  fc.it(
    'should call refresh API endpoint',
    [fc.string({ minLength: 1, maxLength: 50 })], // Random session token
    async (sessionToken) => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      initializeSessionTracking({
        onWarning: jest.fn(),
        onLogout: jest.fn(),
      });

      await refreshSession();

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/session/refresh',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    },
    { numRuns: 50 }
  );

  it('should return true on successful refresh', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    initializeSessionTracking({
      onWarning: jest.fn(),
      onLogout: jest.fn(),
    });

    const result = await refreshSession();
    expect(result).toBe(true);
  });

  it('should return false on failed refresh', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    initializeSessionTracking({
      onWarning: jest.fn(),
      onLogout: jest.fn(),
    });

    const result = await refreshSession();
    expect(result).toBe(false);
  });

  it('should trigger onRefresh callback on successful refresh', async () => {
    const onRefresh = jest.fn();

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    initializeSessionTracking({
      onWarning: jest.fn(),
      onLogout: jest.fn(),
      onRefresh,
    });

    await refreshSession();

    expect(onRefresh).toHaveBeenCalled();
  });

  fc.it(
    'should clear warning state after refresh',
    [fc.boolean()], // Whether warning was shown
    async (warningShown) => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const onWarning = jest.fn();

      initializeSessionTracking({
        onWarning,
        onLogout: jest.fn(),
      });

      if (warningShown) {
        // Trigger warning
        jest.advanceTimersByTime(25 * 60 * 1000);
        expect(onWarning).toHaveBeenCalled();
      }

      // Refresh session
      await refreshSession();

      // Advance to warning time again
      jest.advanceTimersByTime(25 * 60 * 1000);

      // Warning should be triggered again (state was reset)
      expect(onWarning).toHaveBeenCalledTimes(warningShown ? 2 : 1);
    },
    { numRuns: 50 }
  );
});
