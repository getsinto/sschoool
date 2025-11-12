'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface ProgressChartProps {
  data: {
    date: string
    progress: number
  }[]
  title?: string
}

export default function ProgressChart({ data, title = 'Progress Over Time' }: ProgressChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">
                  {new Date(item.date).toLocaleDateString()}
                </span>
                <span className="font-semibold">{item.progress}%</span>
              </div>
              <Progress value={item.progress} />
            </div>
          ))}
        </div>
        
        {data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No progress data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
