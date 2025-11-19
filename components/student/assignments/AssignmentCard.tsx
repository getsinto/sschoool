'use client'

import { Calendar, Clock, FileText, Award } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface AssignmentCardProps {
  assignment: {
    id: string
    title: string
    courseName: string
    dueDate: string
    maxPoints: number
    status: 'not_started' | 'draft' | 'submitted' | 'graded' | 'late'
    grade?: number
    submittedAt?: string
  }
}

export default function AssignmentCard({ assignment }: AssignmentCardProps) {
  const getDaysUntilDue = () => {
    const now = new Date()
    const due = new Date(assignment.dueDate)
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const getUrgencyColor = () => {
    const days = getDaysUntilDue()
    if (days < 0) return 'text-gray-500'
    if (days < 3) return 'text-red-600'
    if (days <= 7) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getStatusBadge = () => {
    const statusConfig = {
      not_started: { label: 'Not Started', color: 'bg-gray-100 text-gray-800' },
      draft: { label: 'Draft Saved', color: 'bg-blue-100 text-blue-800' },
      submitted: { label: 'Submitted', color: 'bg-green-100 text-green-800' },
      graded: { label: 'Graded', color: 'bg-purple-100 text-purple-800' },
      late: { label: 'Late', color: 'bg-red-100 text-red-800' }
    }
    const config = statusConfig[assignment.status]
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getActionButton = () => {
    switch (assignment.status) {
      case 'not_started':
        return (
          <Link href={`/dashboard/student/assignments/${assignment.id}`}>
            <Button>Start</Button>
          </Link>
        )
      case 'draft':
        return (
          <Link href={`/dashboard/student/assignments/${assignment.id}`}>
            <Button>Continue</Button>
          </Link>
        )
      case 'submitted':
        return (
          <Link href={`/dashboard/student/assignments/${assignment.id}`}>
            <Button variant="outline">View Submission</Button>
          </Link>
        )
      case 'graded':
        return (
          <Link href={`/dashboard/student/assignments/${assignment.id}`}>
            <Button variant="outline">View Feedback</Button>
          </Link>
        )
      default:
        return null
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{assignment.title}</h3>
            <p className="text-sm text-gray-600">{assignment.courseName}</p>
          </div>
          {getStatusBadge()}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className={`w-4 h-4 ${getUrgencyColor()}`} />
            <span className={getUrgencyColor()}>
              Due {new Date(assignment.dueDate).toLocaleDateString()}
              {getDaysUntilDue() >= 0 && ` (${getDaysUntilDue()} days)`}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Award className="w-4 h-4" />
            <span>{assignment.maxPoints} points</span>
          </div>

          {assignment.grade !== undefined && (
            <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
              <FileText className="w-4 h-4" />
              <span>Grade: {assignment.grade}/{assignment.maxPoints}</span>
            </div>
          )}
        </div>

        {getActionButton()}
      </CardContent>
    </Card>
  )
}
