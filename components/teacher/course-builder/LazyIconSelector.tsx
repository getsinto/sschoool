/**
 * Lazy-loaded Icon Selector Component
 * Implements Task 12.3: Lazy load IconSelector component
 */

import React, { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load the IconSelector component
const IconSelector = lazy(() =>
  import('./IconSelector').then((module) => ({ default: module.IconSelector }))
);

interface LazyIconSelectorProps {
  selectedIcon?: string;
  onSelect: (icon: string) => void;
  onClose: () => void;
}

/**
 * Loading fallback component
 */
const IconSelectorLoader = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    <span className="ml-2 text-gray-600">Loading icons...</span>
  </div>
);

/**
 * Lazy-loaded wrapper for IconSelector
 * Only loads the component when it's actually needed
 */
export const LazyIconSelector: React.FC<LazyIconSelectorProps> = (props) => {
  return (
    <Suspense fallback={<IconSelectorLoader />}>
      <IconSelector {...props} />
    </Suspense>
  );
};

/**
 * Hook to preload IconSelector
 * Call this when you know the user might need the icon selector soon
 */
export function usePreloadIconSelector() {
  return React.useCallback(() => {
    // Trigger the lazy load
    import('./IconSelector');
  }, []);
}
