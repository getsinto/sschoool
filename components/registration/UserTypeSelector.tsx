'use client'

import { useState } from 'react'
import { UserType } from '@/types/registration'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GraduationCap, Users, UserCheck, MessageCircle } from 'lucide-react'

interface UserTypeSelectorProps {
  selectedType: UserType
  onSelect: (type: UserType) => void
  onNext: () => void
}

const userTypeOptions = [
  {
    type: 'student' as UserType,
    icon: GraduationCap,
    title: 'Student (Online School)',
    description: 'Join our online school for grades Pre-Nursery to Grade 10',
    highlight: 'Comprehensive Curriculum',
    color: 'border-blue-200 hover:border-blue-400 hover:bg-blue-50'
  },
  {
    type: 'teacher' as UserType,
    icon: UserCheck,
    title: 'Teacher',
    description: 'Create and teach courses, earn income',
    highlight: 'Teach & Earn',
    color: 'border-green-200 hover:border-green-400 hover:bg-green-50'
  },
  {
    type: 'parent' as UserType,
    icon: Users,
    title: 'Parent/Guardian',
    description: 'Monitor your child\'s academic progress',
    highlight: 'Track Progress',
    color: 'border-purple-200 hover:border-purple-400 hover:bg-purple-50'
  },
  {
    type: 'spoken_english' as UserType,
    icon: MessageCircle,
    title: 'Spoken English Student',
    description: 'Learn English speaking for all ages worldwide',
    highlight: 'All Levels Welcome',
    color: 'border-orange-200 hover:border-orange-400 hover:bg-orange-50'
  }
]

export function UserTypeSelector({ selectedType, onSelect, onNext }: UserTypeSelectorProps) {
  const [hoveredType, setHoveredType] = useState<UserType | null>(null)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choose Your Role
        </h2>
        <p className="text-gray-600">
          Select the option that best describes you to get started
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {userTypeOptions.map((option) => {
          const Icon = option.icon
          const isSelected = selectedType === option.type
          const isHovered = hoveredType === option.type

          return (
            <Card
              key={option.type}
              className={`
                cursor-pointer transition-all duration-200 transform
                ${isSelected 
                  ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50 scale-105' 
                  : option.color
                }
                ${isHovered && !isSelected ? 'scale-102' : ''}
              `}
              onMouseEnter={() => setHoveredType(option.type)}
              onMouseLeave={() => setHoveredType(null)}
              onClick={() => onSelect(option.type)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`
                    p-4 rounded-full
                    ${isSelected 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600'
                    }
                  `}>
                    <Icon className="w-8 h-8" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {option.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {option.description}
                    </p>
                    <div className={`
                      inline-block px-3 py-1 rounded-full text-xs font-medium
                      ${isSelected 
                        ? 'bg-blue-200 text-blue-800' 
                        : 'bg-gray-200 text-gray-700'
                      }
                    `}>
                      {option.highlight}
                    </div>
                  </div>
                  
                  <Button
                    variant={isSelected ? 'default' : 'outline'}
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelect(option.type)
                    }}
                  >
                    Continue as {option.title.split(' ')[0]}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {selectedType && (
        <div className="text-center">
          <Button 
            onClick={onNext}
            size="lg"
            className="px-8"
          >
            Continue to Personal Information
          </Button>
        </div>
      )}
    </div>
  )
}