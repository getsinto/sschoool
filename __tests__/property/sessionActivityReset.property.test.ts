/**
 * Property Test: Activity Timer Reset
 * Feature: remaining-high-priority-work-jan-2025, Property 48: Activity Timer Reset
 * Validates: Requirements 5.6
 * 
 * For any user action, the inactivity timer should be reset
 */

import { fc } from '@fast-check/jest';
import {
  initializeSessionTracking,
  cleanupSessionTracking,
  getTimeUntilWarning,
} from '@/lib/session/manager';

describe('Property: Activity Timer Reset', () => {
  beforeEach(() => {
    cleanupSessionTracking();
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanupSessionTracking();
    jest.useRealTimers();
  });

  const activityEvents = [
    { type: 'mousedown', event: MouseEvent },
    { type: 'mousemove', event: MouseEvent },
    { type: 'keypress', event: KeyboardEvent },
    { type: 'scroll', event: Event },
    { type: 'touchstart', event: TouchEvent },
    { type: 'click', event: MouseEvent },
  ];

  fc.it(
    'should reset timer on any activity event',
    [
      fc.constantFrom(...activityEvents),
      fc.integer({ min: 1, max: 24 }), // Minutes before activity
    ],
    ({ type, event }, minutesBefore) => {
      const onWarning = jest.fn();

      initializeSessionTracking({
        onWarning,
        onLogout: jest.fn(),
      });

      // Advance time
      jest.advanceTimersByTime(minutesBefore * 60 * 1000);

      // Get time until warning before activity
      const timeBefore = getTimeUntilWarning();

      // Simulate activity
      window.dispatchEvent(new event(type));
      jest.advanceTimersByTime(1500); // Allow time for processing

      // Get time until warning after activity
      const timeAfter = getTimeUntilWarning();

      // Timer should be reset (more time until warning)
      expect(timeAfter).toBeGreaterThan(timeBefore);
    },
    { numRuns: 100 }
  );

  fc.it(
    'should prevent warning after activity resets timer',
    [
      fc.integer({ min: 20, max: 24 }), // Minutes before activity
      fc.constantFrom(...activityEvents),
    ],
    (minutesBefore, { type, event }) => {
      const onWarning = jest.fn();

      initializeSessionTracking({
        onWarning,
        onLogout: jest.fn(),
      });

      // Advance time close to warning
      jest.advanceTimersByTime(minutesBefore * 60 * 1000);

      // Simulate activity
      window.dispatchEvent(new event(type));
      jest.advanceTimersByTime(1500);

      // Advance to what would have been warning time
      jest.advanceTimersByTime((25 - minutesBefore) * 60 * 1000);

      // Warning should not have been triggered
      expect(onWarning).not.toHaveBeenCalled();
    },
    { numRuns: 100 }
  );

  fc.it(
    'should handle multiple activities correctly',
    [
      fc.array(fc.constantFrom(...activityEvents), { minLength: 2, maxLength: 10 }),
      fc.array(fc.integer({ min: 1, max: 5 }), { minLength: 2, maxLength: 10 }),
    ],
    (activities, intervals) => {
      const onWarning = jest.fn();

      initializeSessionTracking({
        onWarning,
        onLogout: jest.fn(),
      });

      const minLength = Math.min(activities.length, intervals.length);

      for (let i = 0; i < minLength; i++) {
        // Advance time
        jest.advanceTimersByTime(intervals[i] * 60 * 1000);

        // Simulate activity
        const { type, event } = activities[i];
        window.dispatchEvent(new event(type));
        jest.advanceTimersByTime(1500);
      }

      // Warning should not have been triggered
      expect(onWarning).not.toHaveBeenCalled();
    },
    { numRuns: 50 }
  );

  it('should throttle activity updates', () => {
    initializeSessionTracking({
      onWarning: jest.fn(),
      onLogout: jest.fn(),
    });

    const initialTime = getTimeUntilWarning();

    // Rapid activities within 1 second
    for (let i = 0; i < 10; i++) {
      window.dispatchEvent(new MouseEvent('mousemove'));
      jest.advanceTimersByTime(100);
    }

    const afterTime = getTimeUntilWarning();

    // Time should not have changed significantly (throttled)
    expect(Math.abs(afterTime - initialTime)).toBeLessThan(2000);
  });

  it('should update storage on activity', () => {
    initializeSessionTracking({
      onWarning: jest.fn(),
      onLogout: jest.fn(),
    });

    // Clear storage
    localStorage.removeItem('session_activity');

    // Simulate activity
    window.dispatchEvent(new MouseEvent('click'));
    jest.advanceTimersByTime(1500);

    // Storage should be updated
    const stored = localStorage.getItem('session_activity');
    expect(stored).not.toBeNull();

    const data = JSON.parse(stored!);
    expect(data.lastActivity).toBeDefined();
    expect(typeof data.lastActivity).toBe('number');
  });
});
