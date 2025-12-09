/**
 * Property Test: Countdown Display
 * Feature: remaining-high-priority-work-jan-2025, Property 44: Countdown Display
 * Validates: Requirements 5.2
 * 
 * For any timeout warning dialog, a countdown timer should be displayed
 */

import { fc } from '@fast-check/jest';
import { render, screen, waitFor } from '@testing-library/react';
import { TimeoutWarningDialog } from '@/components/session/TimeoutWarningDialog';

describe('Property: Countdown Display', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  fc.it(
    'should display countdown timer when dialog is open',
    [fc.integer({ min: 60, max: 600 })], // Timeout duration in seconds
    (timeoutDuration) => {
      const { rerender } = render(
        <TimeoutWarningDialog
          isOpen={true}
          onStayLoggedIn={jest.fn()}
          onLogout={jest.fn()}
          timeoutDuration={timeoutDuration}
        />
      );

      // Should display initial time
      const mins = Math.floor(timeoutDuration / 60);
      const secs = timeoutDuration % 60;
      const expectedTime = `${mins}:${secs.toString().padStart(2, '0')}`;
      
      expect(screen.getByText(expectedTime)).toBeInTheDocument();
    },
    { numRuns: 100 }
  );

  fc.it(
    'should decrement countdown every second',
    [fc.integer({ min: 10, max: 60 })], // Initial countdown
    async (initialCountdown) => {
      render(
        <TimeoutWarningDialog
          isOpen={true}
          onStayLoggedIn={jest.fn()}
          onLogout={jest.fn()}
          timeoutDuration={initialCountdown}
        />
      );

      // Advance time by 1 second
      jest.advanceTimersByTime(1000);

      // Wait for state update
      await waitFor(() => {
        const expectedCountdown = initialCountdown - 1;
        const mins = Math.floor(expectedCountdown / 60);
        const secs = expectedCountdown % 60;
        const expectedTime = `${mins}:${secs.toString().padStart(2, '0')}`;
        
        expect(screen.getByText(expectedTime)).toBeInTheDocument();
      });
    },
    { numRuns: 50 }
  );

  fc.it(
    'should format time correctly for all values',
    [fc.integer({ min: 0, max: 600 })], // Time in seconds
    (seconds) => {
      render(
        <TimeoutWarningDialog
          isOpen={true}
          onStayLoggedIn={jest.fn()}
          onLogout={jest.fn()}
          timeoutDuration={seconds}
        />
      );

      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      const expectedFormat = `${mins}:${secs.toString().padStart(2, '0')}`;

      expect(screen.getByText(expectedFormat)).toBeInTheDocument();
      
      // Verify format is MM:SS
      expect(expectedFormat).toMatch(/^\d+:\d{2}$/);
    },
    { numRuns: 100 }
  );

  it('should call onLogout when countdown reaches zero', async () => {
    const onLogout = jest.fn();

    render(
      <TimeoutWarningDialog
        isOpen={true}
        onStayLoggedIn={jest.fn()}
        onLogout={onLogout}
        timeoutDuration={2}
      />
    );

    // Advance time to countdown completion
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(onLogout).toHaveBeenCalled();
    });
  });

  it('should reset countdown when dialog is reopened', () => {
    const timeoutDuration = 300;
    const { rerender } = render(
      <TimeoutWarningDialog
        isOpen={true}
        onStayLoggedIn={jest.fn()}
        onLogout={jest.fn()}
        timeoutDuration={timeoutDuration}
      />
    );

    // Advance time
    jest.advanceTimersByTime(10000);

    // Close dialog
    rerender(
      <TimeoutWarningDialog
        isOpen={false}
        onStayLoggedIn={jest.fn()}
        onLogout={jest.fn()}
        timeoutDuration={timeoutDuration}
      />
    );

    // Reopen dialog
    rerender(
      <TimeoutWarningDialog
        isOpen={true}
        onStayLoggedIn={jest.fn()}
        onLogout={jest.fn()}
        timeoutDuration={timeoutDuration}
      />
    );

    // Should show full duration again
    const mins = Math.floor(timeoutDuration / 60);
    const secs = timeoutDuration % 60;
    const expectedTime = `${mins}:${secs.toString().padStart(2, '0')}`;
    
    expect(screen.getByText(expectedTime)).toBeInTheDocument();
  });
});
