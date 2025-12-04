/**
 * Debounced Validation Hook
 * Implements Task 12.2: Debounce validation checks for better performance
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

type ValidationFunction<T> = (value: T) => ValidationResult | Promise<ValidationResult>;

interface UseDebouncedValidationOptions<T> {
  value: T;
  validate: ValidationFunction<T>;
  delay?: number;
  immediate?: boolean;
}

/**
 * Hook to debounce validation checks
 * Prevents excessive validation calls during rapid input changes
 */
export function useDebouncedValidation<T>({
  value,
  validate,
  delay = 300,
  immediate = false,
}: UseDebouncedValidationOptions<T>) {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
  });
  const [isValidating, setIsValidating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousValueRef = useRef<T>(value);

  // Memoize the validation function
  const performValidation = useCallback(async () => {
    setIsValidating(true);
    try {
      const result = await validate(value);
      setValidationResult(result);
    } catch (error) {
      setValidationResult({
        isValid: false,
        errors: ['Validation error occurred'],
      });
    } finally {
      setIsValidating(false);
    }
  }, [value, validate]);

  useEffect(() => {
    // Skip if value hasn't changed
    if (previousValueRef.current === value) {
      return;
    }

    previousValueRef.current = value;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Validate immediately if requested
    if (immediate) {
      performValidation();
      return;
    }

    // Debounce validation
    timeoutRef.current = setTimeout(() => {
      performValidation();
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, immediate, performValidation]);

  return {
    ...validationResult,
    isValidating,
  };
}

/**
 * Hook for debouncing any value
 * Useful for search inputs, filters, etc.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for debouncing callbacks
 * Useful for event handlers that shouldn't fire too frequently
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay = 300
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );
}

/**
 * Hook for throttling callbacks
 * Ensures callback is called at most once per specified interval
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay = 300
): (...args: Parameters<T>) => void {
  const lastRunRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRunRef.current;

      if (timeSinceLastRun >= delay) {
        // Execute immediately if enough time has passed
        callbackRef.current(...args);
        lastRunRef.current = now;
      } else {
        // Schedule for later
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(
          () => {
            callbackRef.current(...args);
            lastRunRef.current = Date.now();
          },
          delay - timeSinceLastRun
        );
      }
    },
    [delay]
  );
}
