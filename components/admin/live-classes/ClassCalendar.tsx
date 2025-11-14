'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Video, Users } from 'lucide-react'

interface LiveClass {
  id: string
  title: string
  courseName: string
  teacherName: string
  date: string
  time: string
  duration: number
  platform: 'zoom' | 'meet'
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled'
  attendanceCount: number
}

interface ClassCalendarProps {
  classes: LiveClass[]
  onClassClick: (classId: string) => void
  onDateChange?: (date: Date) => void
}

export default function ClassCalendar({ classes, onClassClick, onDateChange }: ClassCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek, year, month }
  }

  const getClassesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return classes.filter(cls => cls.date === dateStr)
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
    onDateChange?.(newDate)
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    onDateChange?.(today)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'ongoing': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPlatformColor = (platform: string) => {
    return platform === 'zoom' ? 'text-blue-600' : 'text-green-600'
  }

  const renderMonthView = () => {
    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate)
    const days = []
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="min-h-24 p-2 bg-gray-50" />)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateStr = date.toISOString().split('T')[0]
      const dayClasses = getClassesForDate(date)
      const isToday = dateStr === todayStr

      days.push(
        <div
          key={day}
          className={`min-h-24 p-2 border border-gray-200 ${isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'} hover:bg-gray-50 transition-colors`}
        >
          <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayClasses.slice(0, 3).map(cls => (
              <div
                key={cls.id}
                onClick={() => onClassClick(cls.id)}
                className="text-xs p-1 rounded cursor-pointer hover:shadow-sm transition-shadow bg-white border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{cls.time}</span>
                  <Video className={`w-3 h-3 ${getPlatformColor(cls.platform)}`} />
                </div>
                <div className="truncate text-gray-600">{cls.title}</div>
              </div>
            ))}
            {dayClasses.length > 3 && (
              <div className="text-xs text-gray-500 text-center">
                +{dayClasses.length - 3} more
              </div>
            )}
          </div>
        </div>
      )
    }

    return days
  }

  const renderWeekView = () => {
    // Simplified week view - would need more logic for full implementation
    return (
      <div className="text-center py-8 text-gray-500">
        Week view coming soon
      </div>
    )
  }

  const renderDayView = () => {
    const dayClasses = getClassesForDate(currentDate)
    
    return (
      <div className="space-y-3">
        {dayClasses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No classes scheduled for this day
          </div>
        ) : (
          dayClasses.map(cls => (
            <Card key={cls.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onClassClick(cls.id)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getStatusColor(cls.status)}>
                        {cls.status}
                      </Badge>
                      <Badge variant="outline">
                        <Video className={`w-3 h-3 mr-1 ${getPlatformColor(cls.platform)}`} />
                        {cls.platform}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{cls.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{cls.courseName}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{cls.time}</span>
                      <span>•</span>
                      <span>{cls.duration} min</span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {cls.attendanceCount}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5" />
            <span>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="flex items-center border rounded-lg">
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
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <div className="flex items-center space-x-1">
              <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {view === 'month' && (
          <>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-0 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 p-2">
                  {day}
                </div>
              ))}
            </div>
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-0 border-t border-l border-gray-200">
              {renderMonthView()}
            </div>
          </>
        )}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
      </CardContent>
    </Card>
  )
}
