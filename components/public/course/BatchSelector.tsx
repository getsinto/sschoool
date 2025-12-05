'use client'

import { useState } from 'react'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'
import type { CourseBatch, BatchStatus } from '@/types/pricing'

interface BatchSelectorProps {
  batches: CourseBatch[]
  selectedBatch: CourseBatch | null
  onSelectBatch: (batch: CourseBatch) => void
  className?: string
}

export default function BatchSelector({
  batches,
  selectedBatch,
  onSelectBatch,
  className = ''
}: BatchSelectorProps) {
  const [showDetails, setShowDetails] = useState(false)

  // Filter available batches (not completed or cancelled)
  const availableBatches = batches.filter(
    batch => batch.status !== 'completed' && batch.status !== 'cancelled'
  )

  if (availableBatches.length === 0) {
    return (
      <Card className={`p-4 bg-gray-50 ${className}`}>
        <div className="flex items-center gap-2 text-gray-600">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">No batches available at the moment</span>
        </div>
      </Card>
    )
  }

  // Get batch status badge
  const getStatusBadge = (status: BatchStatus) => {
    const statusConfig = {
      upcoming: {
        label: 'Upcoming',
        className: 'bg-blue-100 text-blue-700',
        icon: <Calendar className="w-3 h-3" />
      },
      registration_open: {
        label: 'Open for Registration',
        className: 'bg-green-100 text-green-700',
        icon: <CheckCircle className="w-3 h-3" />
      },
      registration_closed: {
        label: 'Registration Closed',
        className: 'bg-orange-100 text-orange-700',
        icon: <XCircle className="w-3 h-3" />
      },
      in_progress: {
        label: 'In Progress',
        className: 'bg-purple-100 text-purple-700',
        icon: <Clock className="w-3 h-3" />
      },
      completed: {
        label: 'Completed',
        className: 'bg-gray-100 text-gray-700',
        icon: <CheckCircle className="w-3 h-3" />
      },
      cancelled: {
        label: 'Cancelled',
        className: 'bg-red-100 text-red-700',
        icon: <XCircle className="w-3 h-3" />
      }
    }

    const config = statusConfig[status]
    return (
      <Badge className={config.className}>
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </Badge>
    )
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Format schedule days
  const formatScheduleDays = (days: string[]) => {
    if (!days || days.length === 0) return 'Schedule TBD'
    
    const dayAbbr: Record<string, string> = {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun'
    }
    
    return days.map(day => dayAbbr[day.toLowerCase()] || day).join(', ')
  }

  // Calculate spots remaining
  const getSpotsRemaining = (batch: CourseBatch) => {
    if (!batch.max_students) return null
    return batch.max_students - batch.current_enrollments
  }

  // Check if batch is full
  const isBatchFull = (batch: CourseBatch) => {
    if (!batch.max_students) return false
    return batch.current_enrollments >= batch.max_students
  }

  // Check if registration is open
  const isRegistrationOpen = (batch: CourseBatch) => {
    const now = new Date()
    const opensAt = new Date(batch.registration_opens)
    const closesAt = new Date(batch.registration_closes)
    return now >= opensAt && now <= closesAt && !isBatchFull(batch)
  }

  // Get enrollment percentage
  const getEnrollmentPercentage = (batch: CourseBatch) => {
    if (!batch.max_students) return 0
    return Math.round((batch.current_enrollments / batch.max_students) * 100)
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Batch
      </label>
      
      <Select
        value={selectedBatch?.id}
        onValueChange={(value) => {
          const batch = batches.find(b => b.id === value)
          if (batch) {
            onSelectBatch(batch)
            setShowDetails(true)
          }
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choose a batch..." />
        </SelectTrigger>
        <SelectContent>
          {availableBatches.map((batch) => {
            const spotsRemaining = getSpotsRemaining(batch)
            const isFull = isBatchFull(batch)
            const isOpen = isRegistrationOpen(batch)
            
            return (
              <SelectItem 
                key={batch.id} 
                value={batch.id}
                disabled={isFull || !isOpen}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">{batch.batch_name}</span>
                  {isFull && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Full
                    </Badge>
                  )}
                  {!isFull && spotsRemaining && spotsRemaining <= 10 && (
                    <Badge variant="secondary" className="ml-2 text-xs bg-orange-100 text-orange-700">
                      {spotsRemaining} spots left
                    </Badge>
                  )}
                </div>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      {/* Batch Details */}
      {selectedBatch && (
        <Card className="mt-4 p-4 bg-gray-50">
          <div className="space-y-3">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Status</span>
              {getStatusBadge(selectedBatch.status)}
            </div>

            {/* Dates */}
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600">Course Duration</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(selectedBatch.start_date)} - {formatDate(selectedBatch.end_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600">Registration Period</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(selectedBatch.registration_opens)} - {formatDate(selectedBatch.registration_closes)}
                  </p>
                </div>
              </div>
            </div>

            {/* Schedule */}
            {selectedBatch.schedule_days && selectedBatch.schedule_days.length > 0 && (
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600">Class Schedule</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatScheduleDays(selectedBatch.schedule_days)}
                    {selectedBatch.schedule_time && ` at ${selectedBatch.schedule_time}`}
                  </p>
                  {selectedBatch.timezone && (
                    <p className="text-xs text-gray-500">{selectedBatch.timezone}</p>
                  )}
                </div>
              </div>
            )}

            {/* Enrollment Info */}
            {selectedBatch.max_students && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-600">Enrollment</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedBatch.current_enrollments} / {selectedBatch.max_students}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      getEnrollmentPercentage(selectedBatch) >= 90
                        ? 'bg-red-500'
                        : getEnrollmentPercentage(selectedBatch) >= 70
                        ? 'bg-orange-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${getEnrollmentPercentage(selectedBatch)}%` }}
                  />
                </div>
                
                {getSpotsRemaining(selectedBatch) !== null && (
                  <p className="text-xs text-gray-600 mt-1">
                    {getSpotsRemaining(selectedBatch)} spots remaining
                  </p>
                )}
              </div>
            )}

            {/* Batch Number */}
            {selectedBatch.batch_number && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Batch #{selectedBatch.batch_number}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Warning if batch is almost full */}
      {selectedBatch && !isBatchFull(selectedBatch) && (
        <>
          {getSpotsRemaining(selectedBatch) !== null && 
           getSpotsRemaining(selectedBatch)! <= 5 && (
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-900">
                    Almost Full!
                  </p>
                  <p className="text-xs text-orange-700">
                    Only {getSpotsRemaining(selectedBatch)} spots left. Enroll now to secure your place.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Info if batch is full */}
      {selectedBatch && isBatchFull(selectedBatch) && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">
                Batch Full
              </p>
              <p className="text-xs text-red-700">
                This batch has reached maximum capacity. Please select another batch or join the waitlist.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
