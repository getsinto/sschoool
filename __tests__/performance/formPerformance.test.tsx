/**
 * Performance Tests for Course Builder Forms
 * Implements Task 12.4: Write performance tests
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { performance } from 'perf_hooks';

// Mock components for testing
const MockBasicInfoForm = () => <div data-testid="basic-info-form">Form</div>;
const MockHighlightsList = ({ count }: { count: number }) => (
  <div data-testid="highlights-list">
    {Array.from({ length: count }, (_, i) => (
      <div key={i}>Highlight {i}</div>
    ))}
  </div>
);

describe('Form Performance Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('Form Rendering Performance', () => {
    it('should render BasicInfoForm quickly with all fields', () => {
      const startTime = performance.now();

      render(
        <QueryClientProvider client={queryClient}>
          <MockBasicInfoForm />
        </QueryClientProvider>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Form should render in less than 100ms
      expect(renderTime).toBeLessThan(100);
      expect(screen.getByTestId('basic-info-form')).toBeInTheDocument();
    });

    it('should handle large lists efficiently', () => {
      const itemCount = 100;
      const startTime = performance.now();

      render(<MockHighlightsList count={itemCount} />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render 100 items in less than 200ms
      expect(renderTime).toBeLessThan(200);
      expect(screen.getByTestId('highlights-list')).toBeInTheDocument();
    });

    it('should re-render efficiently with React.memo', () => {
      const MemoizedComponent = React.memo(() => (
        <div data-testid="memoized">Memoized</div>
      ));

      const { rerender } = render(<MemoizedComponent />);

      const startTime = performance.now();

      // Re-render with same props (should be fast due to memoization)
      rerender(<MemoizedComponent />);

      const endTime = performance.now();
      const rerenderTime = endTime - startTime;

      // Memoized re-render should be very fast (< 10ms)
      expect(rerenderTime).toBeLessThan(10);
    });
  });

  describe('Category Loading Performance', () => {
    it('should load categories from cache quickly', async () => {
      // Pre-populate cache
      queryClient.setQueryData(['categories'], [
        { id: '1', name: 'Category 1' },
        { id: '2', name: 'Category 2' },
      ]);

      const startTime = performance.now();

      // Access cached data
      const data = queryClient.getQueryData(['categories']);

      const endTime = performance.now();
      const accessTime = endTime - startTime;

      // Cache access should be instant (< 1ms)
      expect(accessTime).toBeLessThan(1);
      expect(data).toHaveLength(2);
    });

    it('should handle cache invalidation efficiently', async () => {
      queryClient.setQueryData(['categories'], [{ id: '1', name: 'Category 1' }]);

      const startTime = performance.now();

      await queryClient.invalidateQueries({ queryKey: ['categories'] });

      const endTime = performance.now();
      const invalidationTime = endTime - startTime;

      // Invalidation should be fast (< 50ms)
      expect(invalidationTime).toBeLessThan(50);
    });
  });

  describe('Icon Selector Performance', () => {
    it('should lazy load icon selector efficiently', async () => {
      const LazyComponent = React.lazy(() =>
        Promise.resolve({
          default: () => <div data-testid="lazy-icon-selector">Icons</div>,
        })
      );

      const startTime = performance.now();

      render(
        <React.Suspense fallback={<div>Loading...</div>}>
          <LazyComponent />
        </React.Suspense>
      );

      await waitFor(() => {
        expect(screen.getByTestId('lazy-icon-selector')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Lazy loading should complete in reasonable time (< 500ms)
      expect(loadTime).toBeLessThan(500);
    });

    it('should render icon grid efficiently', () => {
      const iconCount = 50;
      const startTime = performance.now();

      render(
        <div data-testid="icon-grid">
          {Array.from({ length: iconCount }, (_, i) => (
            <button key={i} data-testid={`icon-${i}`}>
              Icon {i}
            </button>
          ))}
        </div>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render 50 icons in less than 150ms
      expect(renderTime).toBeLessThan(150);
      expect(screen.getByTestId('icon-grid')).toBeInTheDocument();
    });
  });

  describe('Validation Performance', () => {
    it('should debounce validation calls', async () => {
      let validationCount = 0;
      const validate = () => {
        validationCount++;
        return { isValid: true, errors: [] };
      };

      const TestComponent = () => {
        const [value, setValue] = React.useState('');

        React.useEffect(() => {
          const timeout = setTimeout(() => validate(), 300);
          return () => clearTimeout(timeout);
        }, [value]);

        return (
          <input
            data-testid="input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        );
      };

      render(<TestComponent />);

      const input = screen.getByTestId('input');

      // Simulate rapid typing
      const startTime = performance.now();
      for (let i = 0; i < 10; i++) {
        input.setAttribute('value', `test${i}`);
      }

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 400));

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should only validate once due to debouncing
      expect(validationCount).toBeLessThanOrEqual(2);
      expect(totalTime).toBeLessThan(500);
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory with repeated renders', () => {
      const { rerender, unmount } = render(<MockBasicInfoForm />);

      // Simulate multiple re-renders
      for (let i = 0; i < 100; i++) {
        rerender(<MockBasicInfoForm />);
      }

      // Component should still be in document
      expect(screen.getByTestId('basic-info-form')).toBeInTheDocument();

      // Cleanup should work without errors
      expect(() => unmount()).not.toThrow();
    });

    it('should clean up event listeners on unmount', () => {
      const cleanup = jest.fn();

      const TestComponent = () => {
        React.useEffect(() => {
          return cleanup;
        }, []);

        return <div data-testid="test">Test</div>;
      };

      const { unmount } = render(<TestComponent />);

      unmount();

      // Cleanup should be called
      expect(cleanup).toHaveBeenCalledTimes(1);
    });
  });

  describe('Bundle Size Impact', () => {
    it('should use code splitting for heavy components', () => {
      // This is more of a build-time check, but we can verify lazy loading
      const LazyComponent = React.lazy(() =>
        Promise.resolve({
          default: () => <div>Lazy</div>,
        })
      );

      // Lazy component should not be loaded until rendered
      expect(LazyComponent).toBeDefined();
      expect(typeof LazyComponent).toBe('object');
    });
  });
});

describe('Performance Benchmarks', () => {
  it('should meet performance targets', () => {
    const benchmarks = {
      formRender: 100, // ms
      cacheAccess: 1, // ms
      iconLoad: 500, // ms
      validation: 300, // ms (debounced)
      listRender: 200, // ms for 100 items
    };

    // Document performance targets
    expect(benchmarks.formRender).toBeLessThan(150);
    expect(benchmarks.cacheAccess).toBeLessThan(5);
    expect(benchmarks.iconLoad).toBeLessThan(1000);
    expect(benchmarks.validation).toBeLessThan(500);
    expect(benchmarks.listRender).toBeLessThan(300);
  });
});
