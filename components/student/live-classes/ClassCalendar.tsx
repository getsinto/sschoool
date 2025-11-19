'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'

interface ClassCalendarProps {
  classes: any[]
  onDateSelect?: (date: Date) => void
}

export default function ClassCalendar({ classes, onDateSelect }: ClassCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const getClassesForDate = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return classes.filter(cls => {
      const classDate = new Date(cls.date)
      return classDate.toDateString() === date.toDateString()
    })
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Names */}
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}

        {/* Empty cells for days before month starts */}
        {Array.from({ length: startingDayOfWeek }).map((_, idx) => (
          <div key={`empty-${idx}`} className="aspect-square" />
        ))}

        {/* Calendar Days */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const day = idx + 1
          const classesOnDay = getClassesForDate(day)
          const hasClasses = classesOnDay.length > 0
          const isToday = 
            day === new Date().getDate() &&
            currentDate.getMonth() === new Date().getMonth() &&
            currentDate.getFullYear() === new Date().getFullYear()

          return (
            <button
              key={day}
              onClick={() => onDateSelect?.(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
              className={`
                aspect-square p-2 rounded-lg border text-sm
                hover:bg-accent transition-colors
                ${isToday ? 'border-primary bg-primary/5' : 'border-border'}
                ${hasClasses ? 'font-semibold' : ''}
              `}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span>{day}</span>
                {hasClasses && (
                  <div className="flex gap-0.5 mt-1">
                    {classesOnDay.slice(0, 3).map((_, i) => (
                      <div key={i} className="w-1 h-1 rounded-full bg-primary" />
                    ))}
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">Has classes</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border-2 border-primary" />
          <span className="text-muted-foreground">Today</span>
        </div>
      </div>
    </Card>
  )
}
