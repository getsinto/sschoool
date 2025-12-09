/**
 * Property Test: Inactivity Warning
 * Feature: remaining-high-priority-work-jan-2025, Property 43: Inactivity Warning
 * Validates: Requirements 5.1
 * 
 * For any user session, 25 minutes of inactivity should trigger a warning dialog
 */

import { fc } from '@fast-check/jest';
import {
  initializeSessionTracking,
  cleanupSessionTracking,
  getSessionState,
  getTimeUntilWarning,
} from '@/lib/session/manager';

describe('Property: Inactivity Warning', () => {
  beforeEach(() => {
    // Clean up any existing session tracking
    cleanupSessionTracking();
    
    // Clear localStorage
    localStorage.clear();
    
    // Mock timers
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanupSessionTracking();
    jest.useRealTimers();
  });

  fc.it(
    'should trigger warning callback after 25 minutes of inactivity',
    [fc.integer({ min: 0, max: 100 })], // Random initial delay
    (initialDelay) => {
      let warningTriggered = false;
      const onWarning = jest.fn(() => {
        warningTriggered = true;
      });

      // Initialize session tracking
      initializeSessionTracking({
        onWarning,
        onLogout: jest.fn(),
      });

      // Advance time by initial delay (should not trigger warning)
      if (initialDelay > 0) {
        jest.advanceTimersByTime(initialDelay * 1000);
      }

      // Advance time to just before warning (24 minutes 59 seconds)
      jest.advanceTimersByTime(24 * 60 * 1000 + 59 * 1000);
      expect(warningTriggered).toBe(false);

      // Advance time to warning threshold (25 minutes)
      jest.advanceTimersByTime(2 * 1000); // 2 more seconds
      expect(warningTriggered).toBe(true);
      expect(onWarning).toHaveBeenCalled();
    },
    { numRuns: 100 }
  );

  fc.it(
    'should not trigger warning if activity occurs before 25 minutes',
    [
      fc.integer({ min: 1, max: 24 }), // Activity time in minutes
      fc.integer({ min: 1, max: 5 }), // Number of activities
    ],
    (activityMinutes, numActivities) => {
      const onWarning = jest.fn();

      initializeSessionTracking({
        onWarning,
        onLogout: jest.fn(),
      });

      // Simulate activities before warning threshold
      for (let i = 0; i < numActivities; i++) {
        jest.advanceTimersByTime(activityMinutes * 60 * 1000);
        
        // Simulate user activity
        window.dispatchEvent(new MouseEvent('mousedown'));
        
        // Small delay after activity
        jest.advanceTimersByTime(1000);
      }

      // Warning should not have been triggered
      expect(onWarning).not.toHaveBeenCalled();
    },
    { numRuns: 100 }
  );

  fc.it(
    'should calculate correct time until warning',
    [fc.integer({ min: 0, max: 24 * 60 })], // Elapsed time in seconds
    (elapsedSeconds) => {
      initializeSessionTracking({
        onWarning: jest.fn(),
        onLogout: jest.fn(),
      });

      // Advance time
      jest.advanceTimersByTime(elapsedSeconds * 1000);

      const timeUntilWarning = getTimeUntilWarning();
      const expectedTime = (25 * 60 - elapsedSeconds) * 1000;

      // Allow small tolerance for timing
      expect(Math.abs(timeUntilWarning - expectedTime)).toBeLessThan(2000);
    },
    { numRuns: 100 }
  );

  it('should only trigger warning once until reset', () => {
    const onWarning = jest.fn();

    initializeSessionTracking({
      onWarning,
      onLogout: jest.fn(),
    });

    // Advance to warning time
    jest.advanceTimersByTime(25 * 60 * 1000);
    expect(onWarning).toHaveBeenCalledTimes(1);

    // Advance more time (should not trigger again)
    jest.advanceTimersByTime(2 * 60 * 1000);
    expect(onWarning).toHaveBeenCalledTimes(1);

    // Activity should reset warning state
    window.dispatchEvent(new MouseEvent('mousedown'));
    jest.advanceTimersByTime(1000);

    // Advance to warning time again
    jest.advanceTimersByTime(25 * 60 * 1000);
    expect(onWarning).toHaveBeenCalledTimes(2);
  });
});
