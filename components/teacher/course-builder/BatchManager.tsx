'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, Users, Clock, Plus, Edit, Trash2, Copy, 
  CheckCircle, XCircle, AlertCircle, PlayCircle 
} from 'lucide-react'
import { CourseBatch, BatchStatus } from '@/types/pricing'
import { format } from 'date-fns'

interface BatchManagerProps {
  courseId: string
  onCreateBatch: () => void
  onEditBatch: (batch: CourseBatch) => void
}

export function BatchManager({ courseId, onCreateBatch, onEditBatch }: BatchManagerProps) {
  const [batches, setBatches] = useState<CourseBatch[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchBatches()
  }, [courseId])

  const fetchBatches = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/teacher/courses/${courseId}/batches`)
      if (response.ok) {
        const data = await response.json()
        setBatches(data.batches || [])
      }
    } catch (error) {
      console.error('Error fetching batches:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (batchId: string) => {
    if (!confirm('Are you sure you want to delete this batch? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingId(batchId)
      const response = await fetch(`/api/teacher/courses/${courseId}/batches/${batchId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setBatches(batches.filter(b => b.id !== batchId))
      } else {
        alert('Failed to delete batch')
      }
    } catch (error) {
      console.error('Error deleting batch:', error)
      alert('Error deleting batch')
    } finally {
      setDeletingId(null)
    }
  }

  const handleClone = async (batch: CourseBatch) => {
    try {
      const response = await fetch(`/api/teacher/courses/${courseId}/batches/${batch.id}/clone`, {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setBatches([...batches, data.batch])
      } else {
        alert('Failed to clone batch')
      }
    } catch (error) {
      console.error('Error cloning batch:', error)
      alert('Error cloning batch')
    }
  }

  const getStatusBadge = (status: BatchStatus) => {
    const statusConfig = {
      upcoming: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Upcoming' },
      registration_open: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Registration Open' },
      registration_closed: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, label: 'Registration Closed' },
      in_progress: { color: 'bg-purple-100 text-purple-800', icon: PlayCircle, label: 'In Progress' },
      completed: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle, label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' }
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy')
    } catch {
      return dateString
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm')
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Course Batches</h3>
          <p className="text-sm text-gray-500">
            Manage scheduled batches for this course
          </p>
        </div>
        <Button onClick={onCreateBatch}>
          <Plus className="w-4 h-4 mr-2" />
          Create Batch
        </Button>
      </div>

      {batches.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No Batches Yet</h4>
              <p className="text-gray-500 mb-4">
                Create your first batch to start scheduling classes
              </p>
              <Button onClick={onCreateBatch}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Batch
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {batches.map((batch) => (
            <Card key={batch.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{batch.batch_name}</CardTitle>
                      {getStatusBadge(batch.status)}
                    </div>
                    {batch.batch_description && (
                      <CardDescription>{batch.batch_description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleClone(batch)}
                      title="Clone batch"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditBatch(batch)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(batch.id)}
                      disabled={deletingId === batch.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Duration */}
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-gray-500 mt-1" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">Duration</div>
                      <div className="text-sm text-gray-600">
                        {formatDate(batch.start_date)} - {formatDate(batch.end_date)}
                      </div>
                    </div>
                  </div>

                  {/* Registration Window */}
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-gray-500 mt-1" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">Registration</div>
                      <div className="text-sm text-gray-600">
                        {formatDateTime(batch.registration_opens)}
                      </div>
                      <div className="text-xs text-gray-500">
                        to {formatDateTime(batch.registration_closes)}
                      </div>
                    </div>
                  </div>

                  {/* Enrollment */}
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-gray-500 mt-1" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">Enrollment</div>
                      <div className="text-sm text-gray-600">
                        {batch.current_enrollments} / {batch.max_students || '∞'} students
                      </div>
                      {batch.spots_remaining !== undefined && batch.max_students && (
                        <div className="text-xs text-gray-500">
                          {batch.spots_remaining} spots remaining
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Schedule */}
                  {batch.schedule_days && batch.schedule_days.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 text-gray-500 mt-1" />
                      <div>
                        <div className="text-sm font-medium text-gray-700">Schedule</div>
                        <div className="text-sm text-gray-600">
                          {batch.schedule_days.map(day => 
                            day.charAt(0).toUpperCase() + day.slice(1, 3)
                          ).join(', ')}
                        </div>
                        {batch.schedule_time && (
                          <div className="text-xs text-gray-500">
                            at {batch.schedule_time}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {batch.max_students && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Enrollment Progress</span>
                      <span>
                        {Math.round((batch.current_enrollments / batch.max_students) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          batch.current_enrollments >= batch.max_students
                            ? 'bg-red-500'
                            : batch.current_enrollments >= batch.max_students * 0.8
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min((batch.current_enrollments / batch.max_students) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Batch Price Override */}
                {batch.batch_price && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <span className="font-medium">Batch Price:</span> ${batch.batch_price.toFixed(2)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
