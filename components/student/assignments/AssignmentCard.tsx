'use client'

import { Calendar, Clock, FileText, Award, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface Assignment {
  id: string
  title: string
  courseId: string
  courseName: string
  dueDate: string
  maxPoints: number
  status: 'not_started' | 'draft_saved' | 'submitted' | 'graded' | 'late'
  grade: number | null
  submittedAt: string | null
  feedback?: string
  description: string
}

interface AssignmentCardProps {
  assignment: Assignment
}

export default function AssignmentCard({ assignment }: AssignmentCardProps) {
  const getDaysUntilDue = () => {
    const now = new Date()
    const due = new Date(assignment.dueDate)
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getUrgencyColor = () => {
    if (assignment.status === 'graded' || assignment.status === 'late') return 'gray'
    if (assignment.status === 'submitted') return 'blue'
    
    const days = getDaysUntilDue()
    if (days < 0) return 'red'
    if (days <= 3) return 'red'
    if (days <= 7) return 'yellow'
    return 'green'
  }

  const getStatusBadge = () => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      not_started: { label: 'Not Started', variant: 'outline' },
      draft_saved: { label: 'Draft Saved', variant: 'secondary' },
      submitted: { label: 'Submitted', variant: 'default' },
      graded: { label: 'Graded', variant: 'default' },
      late: { label: 'Late', variant: 'destructive' }
    }
    
    const status = variants[assignment.status]
    return <Badge variant={status.variant}>{status.label}</Badge>
  }

  const getActionButton = () => {
    if (assignment.status === 'graded' || assignment.status === 'late') {
      return (
        <Link href={`/dashboard/student/assignments/${assignment.id}`}>
          <Button variant="outline" size="sm">
            View Feedback
          </Button>
        </Link>
      )
    }
    
    if (assignment.status === 'submitted') {
      return (
        <Link href={`/dashboard/student/assignments/${assignment.id}`}>
          <Button variant="outline" size="sm">
            View Submission
          </Button>
        </Link>
      )
    }
    
    if (assignment.status === 'draft_saved') {
      return (
        <Link href={`/dashboard/student/assignment/${assignment.courseId}/${assignment.id}`}>
          <Button size="sm">
            Continue
          </Button>
        </Link>
      )
    }
    
    return (
      <Link href={`/dashboard/student/assignment/${assignment.courseId}/${assignment.id}`}>
        <Button size="sm">
          Start
        </Button>
      </Link>
    )
  }

  const urgencyColor = getUrgencyColor()
  const daysUntilDue = getDaysUntilDue()

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold">{assignment.title}</h3>
              {getStatusBadge()}
              {assignment.grade !== null && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {assignment.grade}/{assignment.maxPoints}
                </Badge>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-3">{assignment.courseName}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
              {/* Due Date */}
              <div className={`flex items-center gap-1 ${
                urgencyColor === 'red' ? 'text-red-600 font-semibold' :
                urgencyColor === 'yellow' ? 'text-yellow-600 font-semibold' :
                urgencyColor === 'green' ? 'text-green-600' :
                urgencyColor === 'blue' ? 'text-blue-600' :
                'text-gray-600'
              }`}>
                <Calendar className="w-4 h-4" />
                <span>
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  {assignment.status !== 'graded' && assignment.status !== 'late' && assignment.status !== 'submitted' && (
                    <span className="ml-1">
                      ({daysUntilDue < 0 ? 'Overdue' : daysUntilDue === 0 ? 'Today' : daysUntilDue === 1 ? 'Tomorrow' : `${daysUntilDue} days`})
                    </span>
                  )}
                </span>
              </div>

              {/* Max Points */}
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4" />
                <span>{assignment.maxPoints} points</span>
              </div>

              {/* Submitted Date */}
              {assignment.submittedAt && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Submitted: {new Date(assignment.submittedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-700 mb-3">{assignment.description}</p>

            {/* Feedback */}
            {assignment.feedback && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Teacher Feedback:</span> {assignment.feedback}
                </p>
              </div>
            )}

            {/* Urgency Warning */}
            {urgencyColor === 'red' && assignment.status !== 'graded' && assignment.status !== 'late' && assignment.status !== 'submitted' && (
              <div className="flex items-center gap-2 text-red-600 text-sm mb-3">
                <AlertCircle className="w-4 h-4" />
                <span className="font-semibold">
                  {daysUntilDue < 0 ? 'This assignment is overdue!' : 'Due soon!'}
                </span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="ml-4">
            {getActionButton()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
