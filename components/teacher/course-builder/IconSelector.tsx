'use client'

/**
 * IconSelector Component
 * Grid-based icon selection interface for course highlights
 * Includes search/filter functionality and preview
 */

import { useState, useMemo } from 'react'
import { 
  Book, 
  Video, 
  Award, 
  Trophy, 
  Star, 
  CheckCircle, 
  Target, 
  Users, 
  Clock, 
  Calendar, 
  Globe, 
  Lightbulb, 
  GraduationCap, 
  Bookmark,
  Search,
  X
} from 'lucide-react'
import { HIGHLIGHT_ICONS, HighlightIcon } from '@/types/course'

interface IconSelectorProps {
  selectedIcon?: string
  onSelect: (icon: string) => void
  onClose?: () => void
}

// Map icon names to Lucide components
const iconComponents: Record<string, any> = {
  'book': Book,
  'video': Video,
  'certificate': Award,
  'trophy': Trophy,
  'star': Star,
  'check-circle': CheckCircle,
  'award': Award,
  'target': Target,
  'users': Users,
  'clock': Clock,
  'calendar': Calendar,
  'globe': Globe,
  'lightbulb': Lightbulb,
  'graduation-cap': GraduationCap,
  'bookmark': Bookmark
}

// Icon display names
const iconNames: Record<string, string> = {
  'book': 'Book',
  'video': 'Video',
  'certificate': 'Certificate',
  'trophy': 'Trophy',
  'star': 'Star',
  'check-circle': 'Check',
  'award': 'Award',
  'target': 'Target',
  'users': 'Users',
  'clock': 'Clock',
  'calendar': 'Calendar',
  'globe': 'Globe',
  'lightbulb': 'Idea',
  'graduation-cap': 'Graduate',
  'bookmark': 'Bookmark'
}

export default function IconSelector({ selectedIcon, onSelect, onClose }: IconSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  
  // Filter icons based on search query
  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) {
      return HIGHLIGHT_ICONS
    }
    
    const query = searchQuery.toLowerCase()
    return HIGHLIGHT_ICONS.filter(icon => {
      const name = iconNames[icon]?.toLowerCase() || icon.toLowerCase()
      return name.includes(query) || icon.includes(query)
    })
  }, [searchQuery])
  
  const handleIconClick = (icon: string) => {
    onSelect(icon)
    if (onClose) {
      onClose()
    }
  }
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-full max-w-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Select Icon</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search icons..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      {/* Selected Icon Preview */}
      {selectedIcon && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-gray-600 mb-2">Selected:</p>
          <div className="flex items-center space-x-2">
            {iconComponents[selectedIcon] && (
              <>
                {(() => {
                  const IconComponent = iconComponents[selectedIcon]
                  return <IconComponent className="w-5 h-5 text-blue-600" />
                })()}
                <span className="text-sm font-medium text-gray-900">
                  {iconNames[selectedIcon] || selectedIcon}
                </span>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Icon Grid */}
      <div className="max-h-80 overflow-y-auto">
        {filteredIcons.length > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {filteredIcons.map((icon) => {
              const IconComponent = iconComponents[icon]
              const isSelected = selectedIcon === icon
              
              if (!IconComponent) return null
              
              return (
                <button
                  key={icon}
                  onClick={() => handleIconClick(icon)}
                  className={`
                    flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-50 text-blue-600' 
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50 text-gray-600'
                    }
                  `}
                  title={iconNames[icon] || icon}
                >
                  <IconComponent className="w-6 h-6 mb-1" />
                  <span className="text-xs text-center truncate w-full">
                    {iconNames[icon] || icon}
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No icons found</p>
            <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          {filteredIcons.length} icon{filteredIcons.length !== 1 ? 's' : ''} available
        </p>
      </div>
    </div>
  )
}

/**
 * Render icon component by name
 * Utility function to render an icon from its string identifier
 */
export function renderIcon(iconName: string, className?: string) {
  const IconComponent = iconComponents[iconName]
  if (!IconComponent) {
    return <Book className={className} /> // Fallback icon
  }
  return <IconComponent className={className} />
}

/**
 * Get icon display name
 * Utility function to get the display name for an icon
 */
export function getIconName(iconName: string): string {
  return iconNames[iconName] || iconName
}
