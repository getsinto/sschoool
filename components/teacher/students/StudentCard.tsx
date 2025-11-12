'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { MessageSquare, Mail, Eye, Clock } from 'lucide-react'
import Link from 'next/link'

interface StudentCardProps {
  student: {
    id: string
    name: string
    email: string
    avatar?: string
    enrolledCourses: number
    overallProgress: number
    averageGrade: number
    lastActive: string
    status: 'active' | 'inactive' | 'at-risk'
    attendanceRate?: number
  }
  onMessage?: (studentId: string) => void
  onEmail?: (studentId: string) => void
}

export default function StudentCard({ student, onMessage, onEmail }: StudentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'at-risk': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <Avatar className="w-12 h-12">
          <AvatarImage src={student.avatar} />
          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{student.name}</h3>
            <Badge className={getStatusColor(student.status)}>
              {student.status}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
            <span className="truncate">{student.email}</span>
            <span>{student.enrolledCourses} courses</span>
            <span>Avg: {student.averageGrade}%</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(student.lastActive).toLocaleDateString()}
            </span>
          </div>
          
          <div className="mb-3">
            <div className="flex items-center gap-2 text-sm mb-1">
              <span className="text-gray-600">Progress:</span>
              <span className="font-medium">{student.overallProgress}%</span>
            </div>
            <Progress value={student.overallProgress} className="h-2" />
          </div>

          {student.attendanceRate !== undefined && (
            <div className="text-sm text-gray-600">
              Attendance: {student.attendanceRate}%
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Link href={`/dashboard/teacher/students/${student.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onMessage?.(student.id)}
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEmail?.(student.id)}
          >
            <Mail className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
