'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AttendanceCalendarProps {
  month: Date
  attendanceData: { date: string; status: 'present' | 'absent' | 'partial' }[]
}

export default function AttendanceCalendar({ month, attendanceData }: AttendanceCalendarProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-500'
      case 'absent': return 'bg-red-500'
      case 'partial': return 'bg-yellow-500'
      default: return 'bg-gray-200'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Attendance Calendar</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-semibold p-2">
              {day}
            </div>
          ))}
          {Array.from({ length: 35 }, (_, i) => (
            <div
              key={i}
              className={`aspect-square flex items-center justify-center rounded-lg border ${
                i % 7 === 0 ? 'bg-gray-50' : ''
              }`}
            >
              <span className="text-sm">{i + 1}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-sm">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-sm">Partial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm">Absent</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
