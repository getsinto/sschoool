'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Assignment {
  id: string
  title: string
  dueDate: string
  status: string
  courseName: string
}

interface DueDateCalendarProps {
  assignments: Assignment[]
  onDateClick?: (date: Date, assignments: Assignment[]) => void
}

export default function DueDateCalendar({ assignments, onDateClick }: DueDateCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    return new Date(year, month, 1).getDay()
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const getAssignmentsForDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return assignments.filter(assignment => {
      const dueDate = new Date(assignment.dueDate)
      return (
        dueDate.getDate() === date.getDate() &&
        dueDate.getMonth() === date.getMonth() &&
        dueDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const getUrgencyColor = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    const daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilDue < 0) return 'bg-gray-400'
    if (daysUntilDue <= 2) return 'bg-red-500'
    if (daysUntilDue <= 7) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })

  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  const isToday = (day: number | null) => {
    if (!day) return false
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Assignment Calendar</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[150px] text-center">
              {monthName}
            </span>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Due Soon (≤2 days)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>This Week</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Upcoming</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span>Overdue</span>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {days.map((day, index) => {
            const dayAssignments = day ? getAssignmentsForDate(day) : []
            const hasAssignments = dayAssignments.length > 0

            return (
              <div
                key={index}
                className={`
                  min-h-[80px] p-2 border rounded-lg
                  ${day ? 'bg-white hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'}
                  ${isToday(day) ? 'border-blue-500 border-2' : 'border-gray-200'}
                `}
                onClick={() => {
                  if (day && hasAssignments && onDateClick) {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                    onDateClick(date, dayAssignments)
                  }
                }}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${isToday(day) ? 'text-blue-600' : ''}`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayAssignments.slice(0, 2).map(assignment => (
                        <div
                          key={assignment.id}
                          className="text-xs p-1 rounded truncate"
                          style={{ backgroundColor: `${getUrgencyColor(assignment.dueDate)}20` }}
                        >
                          <div className="flex items-center gap-1">
                            <div
                              className={`w-2 h-2 rounded-full ${getUrgencyColor(assignment.dueDate)}`}
                            ></div>
                            <span className="truncate">{assignment.title}</span>
                          </div>
                        </div>
                      ))}
                      {dayAssignments.length > 2 && (
                        <div className="text-xs text-gray-600 text-center">
                          +{dayAssignments.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Summary */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-600">
                {assignments.filter(a => {
                  const daysUntil = Math.ceil((new Date(a.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  return daysUntil >= 0 && daysUntil <= 2
                }).length}
              </div>
              <div className="text-xs text-gray-600">Due Soon</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {assignments.filter(a => {
                  const daysUntil = Math.ceil((new Date(a.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  return daysUntil > 2 && daysUntil <= 7
                }).length}
              </div>
              <div className="text-xs text-gray-600">This Week</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {assignments.filter(a => {
                  const daysUntil = Math.ceil((new Date(a.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  return daysUntil > 7
                }).length}
              </div>
              <div className="text-xs text-gray-600">Upcoming</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
