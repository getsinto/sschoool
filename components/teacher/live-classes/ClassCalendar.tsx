'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Grid3x3 } from 'lucide-react'

interface ClassEvent {
  id: string
  title: string
  course: string
  dateTime: string
  duration: number
  platform: string
  status: 'upcoming' | 'ongoing' | 'completed'
  color?: string
}

interface ClassCalendarProps {
  classes: ClassEvent[]
  onClassClick?: (classId: string) => void
  onDateClick?: (date: Date) => void
}

export function ClassCalendar({ classes, onClassClick, onDateClick }: ClassCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      })
    }

    // Next month days
    const remainingDays = 42 - days.length // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      })
    }

    return days
  }

  const getClassesForDate = (date: Date) => {
    return classes.filter(cls => {
      const classDate = new Date(cls.dateTime)
      return classDate.toDateString() === date.toDateString()
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500'
      case 'ongoing': return 'bg-green-500'
      case 'completed': return 'bg-gray-400'
      default: return 'bg-gray-400'
    }
  }

  const monthDays = getMonthDays(currentDate)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Class Calendar</CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex gap-1 border rounded-lg p-1">
              <Button
                variant={view === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('month')}
              >
                Month
              </Button>
              <Button
                variant={view === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('week')}
              >
                Week
              </Button>
              <Button
                variant={view === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('day')}
              >
                Day
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="text-lg font-semibold min-w-[200px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>

        {/* Month View */}
        {view === 'month' && (
          <div>
            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {monthDays.map((day, index) => {
                const dayClasses = getClassesForDate(day.date)
                const isCurrentDay = isToday(day.date)

                return (
                  <div
                    key={index}
                    className={`
                      min-h-[100px] p-2 border rounded-lg cursor-pointer transition-colors
                      ${day.isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'}
                      ${isCurrentDay ? 'border-blue-500 border-2' : 'border-gray-200'}
                    `}
                    onClick={() => onDateClick?.(day.date)}
                  >
                    <div className={`
                      text-sm font-medium mb-1
                      ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                      ${isCurrentDay ? 'text-blue-600' : ''}
                    `}>
                      {day.date.getDate()}
                    </div>

                    {/* Class Events */}
                    <div className="space-y-1">
                      {dayClasses.slice(0, 3).map((cls) => (
                        <div
                          key={cls.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            onClassClick?.(cls.id)
                          }}
                          className={`
                            text-xs p-1 rounded truncate cursor-pointer
                            ${getStatusColor(cls.status)} text-white
                            hover:opacity-80
                          `}
                          title={cls.title}
                        >
                          {new Date(cls.dateTime).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} {cls.title}
                        </div>
                      ))}
                      {dayClasses.length > 3 && (
                        <div className="text-xs text-gray-500 pl-1">
                          +{dayClasses.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Week View */}
        {view === 'week' && (
          <div className="text-center py-12 text-gray-500">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Week view coming soon</p>
          </div>
        )}

        {/* Day View */}
        {view === 'day' && (
          <div className="text-center py-12 text-gray-500">
            <List className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Day view coming soon</p>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-6 pt-6 border-t">
          <span className="text-sm text-gray-600">Status:</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-blue-500"></div>
            <span className="text-sm text-gray-600">Upcoming</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className="text-sm text-gray-600">Ongoing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-400"></div>
            <span className="text-sm text-gray-600">Completed</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
