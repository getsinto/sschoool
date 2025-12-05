'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Tag } from 'lucide-react'

interface Label {
  id: string
  name: string
  color: string
  icon?: string
}

interface CourseLabelsProps {
  courseId?: string
  selectedLabels: string[]
  onChange: (labels: string[]) => void
}

export default function CourseLabels({
  courseId,
  selectedLabels,
  onChange
}: CourseLabelsProps) {
  const [availableLabels, setAvailableLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchLabels()
  }, [])

  const fetchLabels = async () => {
    try {
      const response = await fetch('/api/admin/labels')
      if (response.ok) {
        const data = await response.json()
        setAvailableLabels(data.labels || [])
      }
    } catch (error) {
      console.error('Error fetching labels:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleLabel = (labelName: string) => {
    if (selectedLabels.includes(labelName)) {
      onChange(selectedLabels.filter(l => l !== labelName))
    } else {
      onChange([...selectedLabels, labelName])
    }
  }

  const filteredLabels = availableLabels.filter(label =>
    label.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedLabelObjects = availableLabels.filter(label =>
    selectedLabels.includes(label.name)
  )

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Selected Labels */}
      {selectedLabelObjects.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selected Labels
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedLabelObjects.map(label => (
              <button
                key={label.id}
                type="button"
                onClick={() => toggleLabel(label.name)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                style={{
                  backgroundColor: label.color + '20',
                  color: label.color,
                  border: `1px solid ${label.color}40`
                }}
              >
                {label.icon && <span>{label.icon}</span>}
                <span>{label.name}</span>
                <X className="w-3 h-3" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Labels
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search labels..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Tag className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Available Labels */}
      <div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
          {filteredLabels.map(label => {
            const isSelected = selectedLabels.includes(label.name)
            
            return (
              <button
                key={label.id}
                type="button"
                onClick={() => toggleLabel(label.name)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${isSelected
                    ? 'ring-2 ring-offset-2'
                    : 'hover:scale-105'
                  }
                `}
                style={{
                  backgroundColor: label.color + (isSelected ? '30' : '10'),
                  color: label.color,
                  borderColor: label.color + '40',
                  ringColor: label.color
                }}
              >
                {label.icon && <span className="text-base">{label.icon}</span>}
                <span className="flex-1 text-left truncate">{label.name}</span>
                {isSelected && (
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: label.color }}
                  >
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {filteredLabels.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Tag className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No labels found</p>
            {searchQuery && (
              <p className="text-sm mt-1">Try a different search term</p>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              About Course Labels
            </h4>
            <p className="text-sm text-blue-700">
              Labels help students discover your course. Select relevant labels that describe your course content, difficulty level, or special features.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
