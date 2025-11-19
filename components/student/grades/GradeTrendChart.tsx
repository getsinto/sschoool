'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface GradeTrendChartProps {
  data: Array<{
    label: string
    value: number
    target?: number
  }>
  title?: string
  showTarget?: boolean
  showPrediction?: boolean
}

export default function GradeTrendChart({ 
  data, 
  title = 'Grade Trend',
  showTarget = false,
  showPrediction = false
}: GradeTrendChartProps) {
  // Calculate trend
  const calculateTrend = () => {
    if (data.length < 2) return { direction: 'stable', change: 0 }
    
    const first = data[0].value
    const last = data[data.length - 1].value
    const change = last - first
    
    let direction: 'up' | 'down' | 'stable'
    if (Math.abs(change) < 2) {
      direction = 'stable'
    } else if (change > 0) {
      direction = 'up'
    } else {
      direction = 'down'
    }
    
    return { direction, change: Math.abs(change) }
  }

  const trend = calculateTrend()

  // Add prediction if enabled
  const chartData = showPrediction && data.length >= 2 ? [
    ...data,
    {
      label: 'Predicted',
      value: data[data.length - 1].value + (trend.direction === 'up' ? 2 : trend.direction === 'down' ? -2 : 0),
      isPrediction: true
    }
  ] : data

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-blue-600">
            Grade: {payload[0].value.toFixed(1)}%
          </p>
          {showTarget && payload[0].payload.target && (
            <p className="text-sm text-gray-600">
              Target: {payload[0].payload.target}%
            </p>
          )}
          {payload[0].payload.isPrediction && (
            <p className="text-xs text-gray-500 italic">Predicted</p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center gap-2">
            {trend.direction === 'up' && (
              <>
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-600 font-medium">
                  +{trend.change.toFixed(1)}%
                </span>
              </>
            )}
            {trend.direction === 'down' && (
              <>
                <TrendingDown className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-600 font-medium">
                  -{trend.change.toFixed(1)}%
                </span>
              </>
            )}
            {trend.direction === 'stable' && (
              <>
                <Minus className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-600 font-medium">
                  Stable
                </span>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorGrade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Target line */}
            {showTarget && (
              <Line
                type="monotone"
                dataKey="target"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Target"
              />
            )}
            
            {/* Actual grades */}
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#colorGrade)"
              dot={{ r: 4, fill: '#3b82f6' }}
              activeDot={{ r: 6 }}
              name="Grade"
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-sm text-gray-600">Average</div>
            <div className="text-lg font-bold">
              {(data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Highest</div>
            <div className="text-lg font-bold text-green-600">
              {Math.max(...data.map(d => d.value)).toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Lowest</div>
            <div className="text-lg font-bold text-red-600">
              {Math.min(...data.map(d => d.value)).toFixed(1)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600">Trend</div>
            <div className={`text-lg font-bold ${
              trend.direction === 'up' ? 'text-green-600' :
              trend.direction === 'down' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
