'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Users, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Bell,
  Flame
} from 'lucide-react'

interface EnrollmentStatusProps {
  maxStudents?: number
  currentEnrollments?: number
  enableWaitlist?: boolean
  registrationDeadline?: string
  minStudents?: number
  className?: string
}

export default function EnrollmentStatus({
  maxStudents,
  currentEnrollments = 0,
  enableWaitlist = false,
  registrationDeadline,
  minStudents,
  className = ''
}: EnrollmentStatusProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('')

  // Calculate spots remaining
  const spotsRemaining = maxStudents ? maxStudents - currentEnrollments : null
  const enrollmentPercentage = maxStudents 
    ? Math.round((currentEnrollments / maxStudents) * 100)
    : 0

  // Check if course is full
  const isFull = maxStudents ? currentEnrollments >= maxStudents : false

  // Check if almost full (90% or more)
  const isAlmostFull = enrollmentPercentage >= 90

  // Check if filling fast (70% or more)
  const isFillingFast = enrollmentPercentage >= 70 && enrollmentPercentage < 90

  // Check if minimum students requirement is met
  const isMinimumMet = minStudents ? currentEnrollments >= minStudents : true

  // Calculate time remaining until deadline
  useEffect(() => {
    if (!registrationDeadline) return

    const calculateTimeRemaining = () => {
      const now = new Date()
      const deadline = new Date(registrationDeadline)
      const diff = deadline.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining('Registration closed')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        setTimeRemaining(`${days} day${days !== 1 ? 's' : ''} remaining`)
      } else if (hours > 0) {
        setTimeRemaining(`${hours} hour${hours !== 1 ? 's' : ''} remaining`)
      } else {
        setTimeRemaining(`${minutes} minute${minutes !== 1 ? 's' : ''} remaining`)
      }
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [registrationDeadline])

  // Get urgency level
  const getUrgencyLevel = () => {
    if (isFull) return 'full'
    if (isAlmostFull) return 'critical'
    if (isFillingFast) return 'high'
    if (spotsRemaining && spotsRemaining <= 10) return 'medium'
    return 'normal'
  }

  const urgencyLevel = getUrgencyLevel()

  // Get progress bar color
  const getProgressColor = () => {
    if (enrollmentPercentage >= 90) return 'bg-red-500'
    if (enrollmentPercentage >= 70) return 'bg-orange-500'
    if (enrollmentPercentage >= 50) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  // Render enrollment stats
  const renderEnrollmentStats = () => {
    if (!maxStudents) {
      return (
        <div className="flex items-center gap-2 text-gray-600">
          <Users className="w-5 h-5" />
          <span className="text-sm">
            {currentEnrollments.toLocaleString()} students enrolled
          </span>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {/* Enrollment Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">
              Enrollment
            </span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {currentEnrollments} / {maxStudents}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${getProgressColor()}`}
              style={{ width: `${Math.min(enrollmentPercentage, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{enrollmentPercentage}% filled</span>
            {spotsRemaining !== null && spotsRemaining > 0 && (
              <span>{spotsRemaining} spots left</span>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Render urgency badge
  const renderUrgencyBadge = () => {
    switch (urgencyLevel) {
      case 'full':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Course Full
          </Badge>
        )
      case 'critical':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200 animate-pulse">
            <Flame className="w-3 h-3 mr-1" />
            Almost Full - {spotsRemaining} spots left!
          </Badge>
        )
      case 'high':
        return (
          <Badge className="bg-orange-100 text-orange-700 border-orange-200">
            <TrendingUp className="w-3 h-3 mr-1" />
            Filling Fast
          </Badge>
        )
      case 'medium':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Limited Spots
          </Badge>
        )
      default:
        return null
    }
  }

  // Render deadline countdown
  const renderDeadline = () => {
    if (!registrationDeadline || !timeRemaining) return null

    const isUrgent = timeRemaining.includes('hour') || timeRemaining.includes('minute')

    return (
      <div className={`flex items-center gap-2 p-2 rounded-lg ${
        isUrgent ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
      }`}>
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">{timeRemaining}</span>
      </div>
    )
  }

  // Render minimum students info
  const renderMinimumInfo = () => {
    if (!minStudents) return null

    if (isMinimumMet) {
      return (
        <div className="flex items-center gap-2 text-green-600 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>Minimum enrollment met - Course confirmed</span>
        </div>
      )
    }

    const remaining = minStudents - currentEnrollments

    return (
      <div className="flex items-center gap-2 text-orange-600 text-sm">
        <AlertTriangle className="w-4 h-4" />
        <span>
          {remaining} more student{remaining !== 1 ? 's' : ''} needed to start
        </span>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Urgency Badge */}
      {renderUrgencyBadge()}

      {/* Enrollment Stats */}
      {renderEnrollmentStats()}

      {/* Deadline Countdown */}
      {renderDeadline()}

      {/* Minimum Students Info */}
      {renderMinimumInfo()}

      {/* Waitlist Option */}
      {isFull && enableWaitlist && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Bell className="w-5 h-5 text-purple-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-purple-900 mb-1">
                Join the Waitlist
              </h4>
              <p className="text-xs text-purple-700 mb-3">
                This course is currently full. Join the waitlist to be notified when a spot becomes available.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                <Bell className="w-4 h-4 mr-2" />
                Join Waitlist
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Social Proof */}
      {!isFull && currentEnrollments > 50 && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <TrendingUp className="w-4 h-4" />
          <span>
            {currentEnrollments} students already enrolled
          </span>
        </div>
      )}

      {/* Urgency Message */}
      {isAlmostFull && !isFull && (
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800 font-medium">
            ⚡ Only {spotsRemaining} spot{spotsRemaining !== 1 ? 's' : ''} remaining! 
            Enroll now to secure your place.
          </p>
        </div>
      )}
    </div>
  )
}
