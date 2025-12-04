/**
 * Optimized Highlight Item Component
 * Implements Task 12.2: Optimize form rendering with React.memo
 */

import React, { memo, useCallback } from 'react';
import { Trash2, GripVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface HighlightItemProps {
  highlight: {
    text: string;
    icon?: string;
  };
  index: number;
  onUpdate: (index: number, field: 'text' | 'icon', value: string) => void;
  onRemove: (index: number) => void;
  onIconSelect: (index: number) => void;
  maxLength?: number;
}

/**
 * Memoized highlight item component to prevent unnecessary re-renders
 */
export const OptimizedHighlightItem = memo<HighlightItemProps>(
  ({ highlight, index, onUpdate, onRemove, onIconSelect, maxLength = 100 }) => {
    // Memoize handlers to prevent recreation on every render
    const handleTextChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate(index, 'text', e.target.value);
      },
      [index, onUpdate]
    );

    const handleRemove = useCallback(() => {
      onRemove(index);
    }, [index, onRemove]);

    const handleIconClick = useCallback(() => {
      onIconSelect(index);
    }, [index, onIconSelect]);

    const remainingChars = maxLength - highlight.text.length;
    const isNearLimit = remainingChars <= 20;

    return (
      <div className="flex items-center gap-2 p-3 border rounded-lg bg-white">
        {/* Drag handle */}
        <div className="cursor-move text-gray-400 hover:text-gray-600">
          <GripVertical className="w-5 h-5" />
        </div>

        {/* Icon selector */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleIconClick}
          className="w-10 h-10 p-0"
        >
          {highlight.icon ? (
            <span className="text-lg">{highlight.icon}</span>
          ) : (
            <span className="text-gray-400">+</span>
          )}
        </Button>

        {/* Text input */}
        <div className="flex-1">
          <Input
            type="text"
            value={highlight.text}
            onChange={handleTextChange}
            placeholder="Enter highlight text..."
            maxLength={maxLength}
            className="w-full"
          />
          <div
            className={`text-xs mt-1 ${
              isNearLimit ? 'text-orange-600' : 'text-gray-500'
            }`}
          >
            {remainingChars} characters remaining
          </div>
        </div>

        {/* Remove button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleRemove}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    );
  },
  // Custom comparison function for better memoization
  (prevProps, nextProps) => {
    return (
      prevProps.highlight.text === nextProps.highlight.text &&
      prevProps.highlight.icon === nextProps.highlight.icon &&
      prevProps.index === nextProps.index &&
      prevProps.maxLength === nextProps.maxLength
    );
  }
);

OptimizedHighlightItem.displayName = 'OptimizedHighlightItem';
