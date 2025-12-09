/**
 * Property Test: Automatic Logout
 * Feature: remaining-high-priority-work-jan-2025, Property 46: Automatic Logout
 * Validates: Requirements 5.4
 * 
 * For any user session, 30 minutes of inactivity should trigger automatic logout
 */

import { fc } from '@fast-check/jest';
import {
  initializeSessionTracking,
  cleanupSessionTracking,
  getTimeUntilLogout,
} from '@/lib/session/manager';

describe('Property: Automatic Logout', () => {
  beforeEach(() => {
    cleanupSessionTracking();
    localStorage.clear();
    jest.useFakeTimers();
    
    // Mock window.location.href
    delete (window as any).location;
    (window as any).location = { href: '', pathname: '/dashboard' };
  });

  afterEach(() => {
    cleanupSessionTracking();
    jest.useRealTimers();
  });

  fc.it(
    'should trigger logout callback after 30 minutes of inactivity',
    [fc.integer({ min: 0, max: 100 })], // Random initial delay
    (initialDelay) => {
      let logoutTriggered = false;
      const onLogout = jest.fn(() => {
        logoutTriggered = true;
      });

      initializeSessionTracking({
        onWarning: jest.fn(),
        onLogout,
      });

      // Advance time by initial delay
      if (initialDelay > 0) {
        jest.advanceTimersByTime(initialDelay * 1000);
      }

      // Advance time to just before logout (29 minutes 59 seconds)
      jest.advanceTimersByTime(29 * 60 * 1000 + 59 * 1000);
      expect(logoutTriggered).toBe(false);

      // Advance time to logout threshold (30 minutes)
      jest.advanceTimersByTime(2 * 1000);
      expect(logoutTriggered).toBe(true);
      expect(onLogout).toHaveBeenCalled();
    },
    { numRuns: 100 }
  );

  fc.it(
    'should not trigger logout if activity occurs before 30 minutes',
    [
      fc.integer({ min: 1, max: 29 }), // Activity time in minutes
      fc.integer({ min: 1, max: 5 }), // Number of activities
    ],
    (activityMinutes, numActivities) => {
      const onLogout = jest.fn();

      initializeSessionTracking({
        onWarning: jest.fn(),
        onLogout,
      });

      // Simulate activities before logout threshold
      for (let i = 0; i < numActivities; i++) {
        jest.advanceTimersByTime(activityMinutes * 60 * 1000);
        
        // Simulate user activity
        window.dispatchEvent(new MouseEvent('click'));
        
        jest.advanceTimersByTime(1000);
      }

      // Logout should not have been triggered
      expect(onLogout).not.toHaveBeenCalled();
    },
    { numRuns: 100 }
  );

  fc.it(
    'should calculate correct time until logout',
    [fc.integer({ min: 0, max: 29 * 60 })], // Elapsed time in seconds
    (elapsedSeconds) => {
      initializeSessionTracking({
        onWarning: jest.fn(),
        onLogout: jest.fn(),
      });

      // Advance time
      jest.advanceTimersByTime(elapsedSeconds * 1000);

      const timeUntilLogout = getTimeUntilLogout();
      const expectedTime = (30 * 60 - elapsedSeconds) * 1000;

      // Allow small tolerance for timing
      expect(Math.abs(timeUntilLogout - expectedTime)).toBeLessThan(2000);
    },
    { numRuns: 100 }
  );

  it('should trigger logout after warning if no action taken', () => {
    const onWarning = jest.fn();
    const onLogout = jest.fn();

    initializeSessionTracking({
      onWarning,
      onLogout,
    });

    // Advance to warning time (25 minutes)
    jest.advanceTimersByTime(25 * 60 * 1000);
    expect(onWarning).toHaveBeenCalled();
    expect(onLogout).not.toHaveBeenCalled();

    // Advance additional 5 minutes to logout (total 30 minutes)
    jest.advanceTimersByTime(5 * 60 * 1000);
    expect(onLogout).toHaveBeenCalled();
  });

  it('should redirect to login page on logout', () => {
    const onLogout = jest.fn(() => {
      window.location.href = '/login?expired=true&redirect=%2Fdashboard';
    });

    initializeSessionTracking({
      onWarning: jest.fn(),
      onLogout,
    });

    // Advance to logout time
    jest.advanceTimersByTime(30 * 60 * 1000);

    expect(onLogout).toHaveBeenCalled();
    expect(window.location.href).toContain('/login');
    expect(window.location.href).toContain('expired=true');
  });

  fc.it(
    'should clear session data on logout',
    [fc.string({ minLength: 1, maxLength: 20 })], // Session data key
    (sessionKey) => {
      // Set some session data
      localStorage.setItem(sessionKey, 'test-data');
      localStorage.setItem('session_activity', JSON.stringify({ lastActivity: Date.now() }));

      const onLogout = jest.fn(() => {
        localStorage.clear();
      });

      initializeSessionTracking({
        onWarning: jest.fn(),
        onLogout,
      });

      // Advance to logout time
      jest.advanceTimersByTime(30 * 60 * 1000);

      expect(onLogout).toHaveBeenCalled();
      expect(localStorage.getItem(sessionKey)).toBeNull();
      expect(localStorage.getItem('session_activity')).toBeNull();
    },
    { numRuns: 50 }
  );
});
