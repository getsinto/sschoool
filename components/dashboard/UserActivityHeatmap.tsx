'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Generate mock heatmap data for the last 12 weeks
const generateHeatmapData = () => {
  const data = []
  const today = new Date()
  
  for (let week = 11; week >= 0; week--) {
    const weekData = []
    for (let day = 0; day < 7; day++) {
      const date = new Date(today)
      date.setDate(date.getDate() - (week * 7) + day - today.getDay())
      
      // Generate random activity level (0-4)
      const activity = Math.floor(Math.random() * 5)
      
      weekData.push({
        date: date.toISOString().split('T')[0],
        day: date.getDate(),
        activity,
        tooltip: `${date.toLocaleDateString()}: ${activity * 25}% activity`
      })
    }
    data.push(weekData)
  }
  
  return data
}

const getActivityColor = (level: number) => {
  const colors = [
    'bg-gray-100', // 0 - No activity
    'bg-green-200', // 1 - Low activity
    'bg-green-300', // 2 - Medium activity
    'bg-green-500', // 3 - High activity
    'bg-green-700'  // 4 - Very high activity
  ]
  return colors[level] || colors[0]
}

export default function UserActivityHeatmap() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const heatmapData = generateHeatmapData()
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>User Activity Heatmap</span>
          <Badge variant="outline">Last 12 weeks</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Less</span>
            <div className="flex items-center space-x-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`w-3 h-3 rounded-sm ${getActivityColor(level)}`}
                />
              ))}
            </div>
            <span className="text-gray-600">More</span>
          </div>

          {/* Heatmap Grid */}
          <div className="space-y-1">
            {/* Day labels */}
            <div className="grid grid-cols-8 gap-1 text-xs text-gray-500">
              <div></div>
              {days.map((day) => (
                <div key={day} className="text-center">
                  {day}
                </div>
              ))}
            </div>

            {/* Heatmap rows */}
            {heatmapData.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-8 gap-1">
                {/* Week number */}
                <div className="text-xs text-gray-500 flex items-center">
                  W{12 - weekIndex}
                </div>
                
                {/* Days in week */}
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`w-6 h-6 rounded-sm cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-blue-300 ${getActivityColor(day.activity)}`}
                    title={day.tooltip}
                    onClick={() => setSelectedDate(day.date || null)}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Selected date info */}
          {selectedDate && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">
                Selected: {new Date(selectedDate).toLocaleDateString()}
              </p>
              <p className="text-xs text-blue-700">
                Click on any day to see detailed activity
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}