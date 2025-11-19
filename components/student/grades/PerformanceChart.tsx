'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface PerformanceChartProps {
  data: Array<{
    label: string
    average?: number
    gpa?: number
    [key: string]: any
  }>
  type?: 'line' | 'bar'
  title?: string
  dataKeys?: string[]
}

export default function PerformanceChart({ 
  data, 
  type = 'line', 
  title = 'Performance Over Time',
  dataKeys = ['average']
}: PerformanceChartProps) {
  const colors = {
    average: '#3b82f6',
    gpa: '#10b981',
    score: '#8b5cf6'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {type === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              {dataKeys.map(key => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[key as keyof typeof colors] || '#3b82f6'}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Legend />
              {dataKeys.map(key => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={colors[key as keyof typeof colors] || '#3b82f6'}
                />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
