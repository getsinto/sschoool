'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  FileQuestion, 
  Users, 
  BookOpen, 
  DollarSign,
  TrendingUp,
  Activity
} from 'lucide-react'

interface EmptyStateProps {
  type: 'users' | 'courses' | 'revenue' | 'activities' | 'general'
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

const emptyStateConfig = {
  users: {
    icon: Users,
    title: 'No Users Yet',
    description: 'Start by inviting users to your platform or wait for new registrations.',
    actionLabel: 'Invite Users',
    illustration: (
      <svg className="w-48 h-48 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  courses: {
    icon: BookOpen,
    title: 'No Courses Available',
    description: 'Create your first course to start offering educational content to students.',
    actionLabel: 'Create Course',
    illustration: (
      <svg className="w-48 h-48 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  },
  revenue: {
    icon: DollarSign,
    title: 'No Revenue Data',
    description: 'Revenue data will appear here once you start receiving payments from students.',
    actionLabel: 'View Pricing',
    illustration: (
      <svg className="w-48 h-48 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  activities: {
    icon: Activity,
    title: 'No Recent Activity',
    description: 'Activity feed will show recent events like registrations, enrollments, and payments.',
    actionLabel: 'Refresh',
    illustration: (
      <svg className="w-48 h-48 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  general: {
    icon: FileQuestion,
    title: 'No Data Available',
    description: 'Data will appear here once your platform has activity.',
    actionLabel: 'Learn More',
    illustration: (
      <svg className="w-48 h-48 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  }
}

export default function EmptyState({
  type,
  title,
  description,
  actionLabel,
  onAction
}: EmptyStateProps) {
  const config = emptyStateConfig[type]
  const Icon = config.icon

  return (
    <Card className="border-2 border-dashed border-gray-300">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        {/* Illustration */}
        <div className="mb-6">
          {config.illustration}
        </div>

        {/* Icon */}
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-gray-400" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {title || config.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-6 max-w-md">
          {description || config.description}
        </p>

        {/* Action Button */}
        {(onAction || actionLabel) && (
          <Button onClick={onAction} variant="outline" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            {actionLabel || config.actionLabel}
          </Button>
        )}

        {/* Help Text */}
        <p className="text-sm text-gray-500 mt-6">
          Need help getting started? Check out our documentation or contact support.
        </p>
      </CardContent>
    </Card>
  )
}
