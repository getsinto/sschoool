'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GraduationCap, Users, BookOpen, MessageCircle } from 'lucide-react'
import { RegistrationData } from '@/app/(auth)/register/page'

interface UserTypeStepProps {
  data: RegistrationData
  updateData: (updates: Partial<RegistrationData>) => void
  onNext: () => void
}

const USER_TYPES = [
  {
    id: 'student' as const,
    title: 'Student',
    description: 'Join our online school program',
    icon: GraduationCap,
    color: 'bg-blue-500',
    features: ['Access to all courses', 'Live classes', 'Assignments & quizzes', 'Progress tracking']
  },
  {
    id: 'teacher' as const,
    title: 'Teacher',
    description: 'Teach and inspire students',
    icon: Users,
    color: 'bg-green-500',
    features: ['Create courses', 'Conduct live classes', 'Grade assignments', 'Student analytics']
  },
  {
    id: 'parent' as const,
    title: 'Parent',
    description: 'Monitor your child\'s progress',
    icon: BookOpen,
    color: 'bg-purple-500',
    features: ['Track child progress', 'Communicate with teachers', 'View reports', 'Payment management']
  },
  {
    id: 'spoken_english' as const,
    title: 'Spoken English',
    description: 'Improve your English speaking skills',
    icon: MessageCircle,
    color: 'bg-orange-500',
    features: ['Speaking practice', 'Pronunciation training', 'Conversation sessions', 'Fluency assessment']
  }
]

export default function UserTypeStep({ data, updateData, onNext }: UserTypeStepProps) {
  const [selectedType, setSelectedType] = useState(data.userType)

  const handleSelect = (type: typeof selectedType) => {
    setSelectedType(type)
    updateData({ userType: type })
  }

  const handleNext = () => {
    if (selectedType) {
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Choose Your Role</h2>
        <p className="text-gray-600">
          Select the option that best describes how you'll use our platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {USER_TYPES.map((type) => {
          const Icon = type.icon
          const isSelected = selectedType === type.id
          
          return (
            <Card
              key={type.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected
                  ? 'ring-2 ring-primary border-primary shadow-lg'
                  : 'hover:border-gray-300'
              }`}
              onClick={() => handleSelect(type.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`${type.color} p-3 rounded-lg text-white`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{type.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{type.description}</p>
                    <ul className="space-y-1">
                      {type.features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-500 flex items-center">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {isSelected && (
                    <div className="text-primary">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={!selectedType}
          className="px-8"
        >
          Continue
        </Button>
      </div>
    </div>
  )
}