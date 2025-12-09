/**
 * Property Test: Cross-Tab Synchronization
 * Feature: remaining-high-priority-work-jan-2025, Property 51: Cross-Tab Synchronization
 * Validates: Requirements 5.9
 * 
 * For any multi-tab session, session state should be synchronized across all tabs
 */

import { fc } from '@fast-check/jest';
import {
  initializeSessionTracking,
  cleanupSessionTracking,
  syncSessionAcrossTabs,
  getSessionState,
} from '@/lib/session/manager';

describe('Property: Cross-Tab Synchronization', () => {
  beforeEach(() => {
    cleanupSessionTracking();
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanupSessionTracking();
    jest.useRealTimers();
  });

  fc.it(
    'should sync activity across tabs via localStorage',
    [fc.integer({ min: 1, max: 20 })], // Minutes of activity
    (activityMinutes) => {
      initializeSessionTracking({
        onWarning: jest.fn(),
        onLogout: jest.fn(),
      });

      // Simulate activity
      window.dispatchEvent(new MouseEvent('click'));
      jest.advanceTimersByTime(1500);

      // Check localStorage was updated
      const stored = localStorage.getItem('session_activity');
      expect(stored).not.toBeNull();

      const data = JSON.parse(stored!);
      expect(data.lastActivity).toBeDefined();
      expect(typeof data.lastActivity).toBe('number');
    },
    { numRuns: 50 }
  );

  fc.it(
    'should update local state when storage event received',
    [fc.integer({ min: 1000, max: 100000 })], // Activity timestamp
    (activityTimestamp) => {
      const onWarning = jest.fn();

      initializeSessionTracking({
        onWarning,
        onLogout: jest.fn(),
      });

      // Advance time to near warning
      jest.advanceTimersByTime(24 * 60 * 1000);

      // Simulate storage event from another tab with recent activity
      const storageEvent = new StorageEvent('storage', {
        key: 'session_activity',
        newValue: JSON.stringify({
          lastActivity: Date.now(),
          timestamp: Date.now(),
        }),
      });

      window.dispatchEvent(storageEvent);
      jest.advanceTimersByTime(1500);

      // Advance to what would have been warning time
      jest.advanceTimersByTime(2 * 60 * 1000);

      // Warning should not trigger (activity from other tab)
      expect(onWarning).not.toHaveBeenCalled();
    },
    { numRuns: 50 }
  );

  it('should broadcast logout to all tabs', () => {
    initializeSessionTracking({
      onWarning: jest.fn(),
      onLogout: jest.fn(),
    });

    // Sync logout
    syncSessionAcrossTabs('logout');

    // Check localStorage
    const logoutFlag = localStorage.getItem('session_logout');
    expect(logoutFlag).toBe('true');
  });

  it('should handle logout event from another tab', () => {
    const onLogout = jest.fn();

    // Mock window.location
    delete (window as any).location;
    (window as any).location = { href: '', pathname: '/dashboard' };

    initializeSessionTracking({
      onWarning: jest.fn(),
      onLogout,
    });

    // Simulate logout event from another tab
    const storageEvent = new StorageEvent('storage', {
      key: 'session_logout',
      newValue: 'true',
    });

    window.dispatchEvent(storageEvent);

    // Logout should be triggered
    expect(onLogout).toHaveBeenCalled();
  });

  fc.it(
    'should ignore storage events for other keys',
    [fc.string({ minLength: 1, maxLength: 20 })], // Random key
    (randomKey) => {
      // Skip if random key matches our keys
      if (randomKey === 'session_activity' || randomKey === 'session_logout') {
        return;
      }

      const onWarning = jest.fn();
      const onLogout = jest.fn();

      initializeSessionTracking({
        onWarning,
        onLogout,
      });

      // Simulate storage event for different key
      const storageEvent = new StorageEvent('storage', {
        key: randomKey,
        newValue: 'some-value',
      });

      window.dispatchEvent(storageEvent);
      jest.advanceTimersByTime(1500);

      // Should not affect session
      expect(onWarning).not.toHaveBeenCalled();
      expect(onLogout).not.toHaveBeenCalled();
    },
    { numRuns: 50 }
  );

  it('should handle malformed storage data gracefully', () => {
    const onWarning = jest.fn();

    initializeSessionTracking({
      onWarning,
      onLogout: jest.fn(),
    });

    // Simulate storage event with invalid JSON
    const storageEvent = new StorageEvent('storage', {
      key: 'session_activity',
      newValue: 'invalid-json{',
    });

    // Should not throw
    expect(() => {
      window.dispatchEvent(storageEvent);
    }).not.toThrow();
  });
});
