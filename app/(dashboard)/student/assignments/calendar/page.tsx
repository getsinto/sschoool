'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DueDateCalendar from '@/components/student/assignments/DueDateCalendar'
import AssignmentCard from '@/components/student/assignments/AssignmentCard'

export default function AssignmentCalendarPage() {
  const router = useRouter()
  const [assignments, setAssignments] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedAssignments, setSelectedAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAssignments()
  }, [])

  const loadAssignments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/student/assignments')
      const data = await response.json()
      
      if (data.success) {
        setAssignments(data.data.assignments)
      }
    } catch (error) {
      console.error('Failed to load assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDateClick = (date: Date, dayAssignments: any[]) => {
    setSelectedDate(date)
    setSelectedAssignments(dayAssignments)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/student/assignments')}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Assignments
          </Button>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            <h1 className="text-xl font-bold">Assignment Calendar</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <DueDateCalendar 
              assignments={assignments} 
              onDateClick={handleDateClick}
            />
          </div>

          {/* Selected Date Details */}
          <div>
            {selectedDate && selectedAssignments.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedDate.toLocaleDateString('default', { 
                      weekday: 'long',
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      {selectedAssignments.length} assignment{selectedAssignments.length !== 1 ? 's' : ''} due
                    </p>
                    {selectedAssignments.map(assignment => (
                      <div 
                        key={assignment.id}
                        className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/student/assignments/${assignment.id}`)}
                      >
                        <h4 className="font-medium mb-1">{assignment.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{assignment.courseName}</p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded ${
                            assignment.status === 'graded' ? 'bg-green-100 text-green-800' :
                            assignment.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                            assignment.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {assignment.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-600">
                            {assignment.maxPoints} pts
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    Click on a date with assignments to view details
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Upcoming Assignments */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Next 7 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assignments
                    .filter(a => {
                      const daysUntil = Math.ceil((new Date(a.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                      return daysUntil >= 0 && daysUntil <= 7
                    })
                    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                    .slice(0, 5)
                    .map(assignment => {
                      const daysUntil = Math.ceil((new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                      return (
                        <div 
                          key={assignment.id}
                          className="flex items-center justify-between p-2 border rounded hover:bg-gray-50 cursor-pointer"
                          onClick={() => router.push(`/student/assignments/${assignment.id}`)}
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium truncate">{assignment.title}</p>
                            <p className="text-xs text-gray-600">{assignment.courseName}</p>
                          </div>
                          <div className={`text-xs font-medium px-2 py-1 rounded ${
                            daysUntil === 0 ? 'bg-red-100 text-red-800' :
                            daysUntil <= 2 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {daysUntil === 0 ? 'Today' : 
                             daysUntil === 1 ? 'Tomorrow' : 
                             `${daysUntil} days`}
                          </div>
                        </div>
                      )
                    })}
                  {assignments.filter(a => {
                    const daysUntil = Math.ceil((new Date(a.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    return daysUntil >= 0 && daysUntil <= 7
                  }).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No assignments due in the next 7 days
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
