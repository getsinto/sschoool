'use client';

import React from 'react';
import { Check } from 'lucide-react';

interface AgeGroupSelectorProps {
  selectedGroups: string[];
  onChange: (groups: string[]) => void;
  error?: string;
}

const AGE_GROUPS = [
  { value: '3-5', label: '3-5 years', description: 'Pre-school' },
  { value: '6-8', label: '6-8 years', description: 'Early elementary' },
  { value: '9-12', label: '9-12 years', description: 'Upper elementary' },
  { value: '13-15', label: '13-15 years', description: 'Middle school' },
  { value: '16-18', label: '16-18 years', description: 'High school' },
  { value: 'adults', label: 'Adults', description: '18+ years' },
];

export default function AgeGroupSelector({
  selectedGroups,
  onChange,
  error,
}: AgeGroupSelectorProps) {
  const handleToggle = (value: string) => {
    if (selectedGroups.includes(value)) {
      // Remove from selection
      onChange(selectedGroups.filter((g) => g !== value));
    } else {
      // Add to selection
      onChange([...selectedGroups, value]);
    }
  };

  const isSelected = (value: string) => selectedGroups.includes(value);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Age Groups *
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Select all age groups that this course is suitable for
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {AGE_GROUPS.map((group) => {
          const selected = isSelected(group.value);
          
          return (
            <button
              key={group.value}
              type="button"
              onClick={() => handleToggle(group.value)}
              className={`
                relative flex items-start p-4 rounded-lg border-2 transition-all
                ${
                  selected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }
                ${error && !selected ? 'border-red-300' : ''}
              `}
            >
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <div
                    className={`
                      flex items-center justify-center w-5 h-5 rounded border-2 transition-all
                      ${
                        selected
                          ? 'bg-blue-500 border-blue-500'
                          : 'bg-white border-gray-300'
                      }
                    `}
                  >
                    {selected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span
                    className={`
                      font-medium text-sm
                      ${selected ? 'text-blue-900' : 'text-gray-900'}
                    `}
                  >
                    {group.label}
                  </span>
                </div>
                <p
                  className={`
                    text-xs mt-1 ml-7
                    ${selected ? 'text-blue-700' : 'text-gray-500'}
                  `}
                >
                  {group.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}

      {selectedGroups.length > 0 && !error && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
          <Check className="w-4 h-4 text-green-500" />
          <span>
            {selectedGroups.length} age group{selectedGroups.length !== 1 ? 's' : ''} selected
          </span>
        </div>
      )}
    </div>
  );
}
