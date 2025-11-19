'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface PerformanceChartProps {
  title: string
  data: { label: string; value: number }[]
  type?: 'line' | 'bar'
}

export default function PerformanceChart({ title, data, type = 'bar' }: PerformanceChartProps) {
  const maxValue = Math.max(...data.map(d => d.value))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <TrendingUp className="w-5 h-5 text-green-600" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{item.label}</span>
                <span className="font-semibold">{item.value}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
