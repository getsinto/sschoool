'use client'

import { 
  Crown, 
  User,
  Shield,
  Star
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export type TeacherRole = 'primary' | 'content_manager' | 'grader' | 'assistant'

interface RoleBadgeProps {
  role: TeacherRole
  isPrimaryTeacher?: boolean
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

const roleConfig = {
  primary: {
    label: 'Primary Teacher',
    icon: Crown,
    description: 'Main instructor responsible for this course. Has full permissions including content management, grading, and student communication.',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    iconColor: 'text-blue-600'
  },
  content_manager: {
    label: 'Content Manager',
    icon: User,
    description: 'Can manage course content including lessons, modules, and materials. May have additional permissions for grading and communication.',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    iconColor: 'text-purple-600'
  },
  grader: {
    label: 'Grader',
    icon: Star,
    description: 'Assists with grading assignments and providing feedback to students. Limited content management access.',
    color: 'bg-green-100 text-green-800 border-green-300',
    iconColor: 'text-green-600'
  },
  assistant: {
    label: 'Teaching Assistant',
    icon: Shield,
    description: 'Supports the primary teacher with various course activities. Permissions vary based on assignment.',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    iconColor: 'text-orange-600'
  }
}

export function RoleBadge({ 
  role, 
  isPrimaryTeacher = false,
  size = 'md',
  showIcon = true 
}: RoleBadgeProps) {
  // Override role if explicitly marked as primary teacher
  const effectiveRole = isPrimaryTeacher ? 'primary' : role
  const config = roleConfig[effectiveRole]
  const Icon = config.icon
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  }
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline"
            className={`
              ${config.color}
              ${sizeClasses[size]}
              flex items-center gap-1.5 cursor-help font-semibold transition-all hover:shadow-sm
            `}
          >
            {showIcon && <Icon className={`${iconSizes[size]} ${config.iconColor}`} />}
            <span>{config.label}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon className={`w-5 h-5 ${config.iconColor}`} />
              <span className="font-semibold text-base">{config.label}</span>
            </div>
            <p className="text-sm text-gray-600">{config.description}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface RoleWithPermissionsProps {
  role: TeacherRole
  isPrimaryTeacher?: boolean
  permissions: {
    can_manage_content: boolean
    can_grade: boolean
    can_communicate: boolean
  }
  size?: 'sm' | 'md' | 'lg'
}

export function RoleWithPermissions({ 
  role, 
  isPrimaryTeacher = false,
  permissions,
  size = 'md'
}: RoleWithPermissionsProps) {
  const effectiveRole = isPrimaryTeacher ? 'primary' : role
  const config = roleConfig[effectiveRole]
  const Icon = config.icon
  
  const grantedPermissions = Object.entries(permissions)
    .filter(([_, granted]) => granted)
    .map(([key]) => key.replace('can_', '').replace('_', ' '))
  
  return (
    <div className={`
      p-4 rounded-lg border-2 ${config.color}
    `}>
      <div className="flex items-start gap-3">
        <Icon className={`w-6 h-6 ${config.iconColor} mt-0.5`} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-base">{config.label}</h4>
            {isPrimaryTeacher && (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                <Star className="w-3 h-3 mr-1" />
                Primary
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-3">{config.description}</p>
          
          {grantedPermissions.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                Your Permissions:
              </p>
              <div className="flex flex-wrap gap-1">
                {grantedPermissions.map((permission) => (
                  <Badge 
                    key={permission}
                    variant="outline" 
                    className="text-xs bg-white capitalize"
                  >
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface CompactRoleBadgeProps {
  isPrimaryTeacher: boolean
  hasContentAccess: boolean
}

export function CompactRoleBadge({ 
  isPrimaryTeacher, 
  hasContentAccess 
}: CompactRoleBadgeProps) {
  if (isPrimaryTeacher) {
    return (
      <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-semibold">
        <Crown className="w-3 h-3 mr-1" />
        Primary Teacher
      </Badge>
    )
  }
  
  if (hasContentAccess) {
    return (
      <Badge className="bg-purple-100 text-purple-800 border-purple-300 font-semibold">
        <User className="w-3 h-3 mr-1" />
        Content Manager
      </Badge>
    )
  }
  
  return (
    <Badge className="bg-green-100 text-green-800 border-green-300 font-semibold">
      <Star className="w-3 h-3 mr-1" />
      Teaching Assistant
    </Badge>
  )
}
