'use client'

import { UserType } from './CreateUserModal'
import { GraduationCap, Users, UserCircle, Shield } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface UserTypeSelectorProps {
  selectedType: UserType | null
  onSelect: (type: UserType) => void
}

const USER_TYPES = [
  {
    type: 'student' as UserType,
    icon: GraduationCap,
    title: 'Student',
    description: 'Create a student account for online school or spoken English courses',
    color: 'blue',
  },
  {
    type: 'teacher' as UserType,
    icon: Users,
    title: 'Teacher',
    description: 'Create a teacher account with course creation and management capabilities',
    color: 'green',
  },
  {
    type: 'parent' as UserType,
    icon: UserCircle,
    title: 'Parent',
    description: 'Create a parent account to monitor and manage student progress',
    color: 'purple',
  },
  {
    type: 'admin' as UserType,
    icon: Shield,
    title: 'Admin',
    description: 'Create an admin account with full system access and management',
    color: 'red',
  },
]

const colorClasses = {
  blue: {
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    selected: 'border-blue-600 bg-blue-50',
  },
  green: {
    border: 'border-green-200',
    bg: 'bg-green-50',
    icon: 'text-green-600',
    selected: 'border-green-600 bg-green-50',
  },
  purple: {
    border: 'border-purple-200',
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    selected: 'border-purple-600 bg-purple-50',
  },
  red: {
    border: 'border-red-200',
    bg: 'bg-red-50',
    icon: 'text-red-600',
    selected: 'border-red-600 bg-red-50',
  },
}

export default function UserTypeSelector({ selectedType, onSelect }: UserTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Select User Type</h3>
        <p className="text-sm text-gray-600 mt-1">
          Choose the type of user account you want to create
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {USER_TYPES.map((userType) => {
          const Icon = userType.icon
          const colors = colorClasses[userType.color as keyof typeof colorClasses]
          const isSelected = selectedType === userType.type

          return (
            <Card
              key={userType.type}
              className={`p-6 cursor-pointer transition-all hover:shadow-md ${
                isSelected
                  ? `${colors.selected} border-2`
                  : `${colors.border} border hover:${colors.bg}`
              }`}
              onClick={() => onSelect(userType.type)}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${colors.bg}`}>
                  <Icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{userType.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{userType.description}</p>
                </div>
                {isSelected && (
                  <div className="flex-shrink-0">
                    <div className={`w-6 h-6 rounded-full ${colors.bg} flex items-center justify-center`}>
                      <div className={`w-3 h-3 rounded-full bg-${userType.color}-600`} />
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
