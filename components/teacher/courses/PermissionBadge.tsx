'use client'

import { 
  BookOpen, 
  Award, 
  MessageSquare,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export type PermissionType = 'can_manage_content' | 'can_grade' | 'can_communicate'

interface PermissionBadgeProps {
  type: PermissionType
  granted: boolean
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const permissionConfig = {
  can_manage_content: {
    label: 'Content Management',
    icon: BookOpen,
    description: 'Can create, edit, and manage course content including lessons, modules, assignments, and quizzes',
    grantedColor: 'bg-green-100 text-green-800 border-green-200',
    deniedColor: 'bg-gray-100 text-gray-500 border-gray-200'
  },
  can_grade: {
    label: 'Grading',
    icon: Award,
    description: 'Can grade student assignments, quizzes, and provide feedback on submissions',
    grantedColor: 'bg-purple-100 text-purple-800 border-purple-200',
    deniedColor: 'bg-gray-100 text-gray-500 border-gray-200'
  },
  can_communicate: {
    label: 'Communication',
    icon: MessageSquare,
    description: 'Can send messages to students, create announcements, and schedule live classes',
    grantedColor: 'bg-orange-100 text-orange-800 border-orange-200',
    deniedColor: 'bg-gray-100 text-gray-500 border-gray-200'
  }
}

export function PermissionBadge({ 
  type, 
  granted, 
  showLabel = true,
  size = 'md' 
}: PermissionBadgeProps) {
  const config = permissionConfig[type]
  const Icon = config.icon
  const StatusIcon = granted ? CheckCircle2 : XCircle
  
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
              ${granted ? config.grantedColor : config.deniedColor}
              ${sizeClasses[size]}
              flex items-center gap-1.5 cursor-help transition-all hover:shadow-sm
            `}
          >
            <Icon className={iconSizes[size]} />
            {showLabel && (
              <span className="font-medium">{config.label}</span>
            )}
            <StatusIcon className={`${iconSizes[size]} ${granted ? 'text-green-600' : 'text-gray-400'}`} />
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span className="font-semibold">{config.label}</span>
            </div>
            <p className="text-sm text-gray-600">{config.description}</p>
            <div className={`flex items-center gap-1.5 text-sm font-medium ${
              granted ? 'text-green-600' : 'text-gray-500'
            }`}>
              <StatusIcon className="w-4 h-4" />
              <span>{granted ? 'Permission Granted' : 'Permission Not Granted'}</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface PermissionBadgeGroupProps {
  permissions: {
    can_manage_content: boolean
    can_grade: boolean
    can_communicate: boolean
  }
  showLabels?: boolean
  size?: 'sm' | 'md' | 'lg'
  layout?: 'horizontal' | 'vertical'
}

export function PermissionBadgeGroup({ 
  permissions, 
  showLabels = true,
  size = 'md',
  layout = 'horizontal'
}: PermissionBadgeGroupProps) {
  const layoutClasses = layout === 'horizontal' ? 'flex flex-wrap gap-2' : 'flex flex-col gap-2'
  
  return (
    <div className={layoutClasses}>
      <PermissionBadge 
        type="can_manage_content" 
        granted={permissions.can_manage_content}
        showLabel={showLabels}
        size={size}
      />
      <PermissionBadge 
        type="can_grade" 
        granted={permissions.can_grade}
        showLabel={showLabels}
        size={size}
      />
      <PermissionBadge 
        type="can_communicate" 
        granted={permissions.can_communicate}
        showLabel={showLabels}
        size={size}
      />
    </div>
  )
}

interface PermissionSummaryProps {
  permissions: {
    can_manage_content: boolean
    can_grade: boolean
    can_communicate: boolean
  }
}

export function PermissionSummary({ permissions }: PermissionSummaryProps) {
  const grantedCount = Object.values(permissions).filter(Boolean).length
  const totalCount = Object.keys(permissions).length
  const allGranted = grantedCount === totalCount
  const noneGranted = grantedCount === 0
  
  return (
    <div className={`
      p-4 rounded-lg border-2 
      ${allGranted ? 'bg-green-50 border-green-200' : 
        noneGranted ? 'bg-gray-50 border-gray-200' : 
        'bg-blue-50 border-blue-200'}
    `}>
      <div className="flex items-start gap-3">
        <Info className={`
          w-5 h-5 mt-0.5
          ${allGranted ? 'text-green-600' : 
            noneGranted ? 'text-gray-500' : 
            'text-blue-600'}
        `} />
        <div className="flex-1">
          <h4 className={`
            font-semibold text-sm mb-1
            ${allGranted ? 'text-green-900' : 
              noneGranted ? 'text-gray-700' : 
              'text-blue-900'}
          `}>
            {allGranted ? 'Full Access' : 
             noneGranted ? 'Limited Access' : 
             'Partial Access'}
          </h4>
          <p className={`
            text-sm
            ${allGranted ? 'text-green-700' : 
              noneGranted ? 'text-gray-600' : 
              'text-blue-700'}
          `}>
            You have {grantedCount} of {totalCount} permissions for this course.
            {noneGranted && ' Contact an administrator to request additional permissions.'}
          </p>
          <div className="mt-3">
            <PermissionBadgeGroup 
              permissions={permissions}
              showLabels={true}
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
