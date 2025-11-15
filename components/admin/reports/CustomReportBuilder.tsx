'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'

interface CustomReportBuilderProps {
  onSave: (config: any) => void
  onGenerate: (config: any) => void
}

export default function CustomReportBuilder({ onSave, onGenerate }: CustomReportBuilderProps) {
  const [metrics, setMetrics] = useState<string[]>([])
  const [dimensions, setDimensions] = useState<string[]>([])

  const addMetric = () => {
    setMetrics([...metrics, ''])
  }

  const addDimension = () => {
    setDimensions([...dimensions, ''])
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Metrics</h3>
            <Button size="sm" variant="outline" onClick={addMetric}>
              <Plus className="w-4 h-4 mr-1" />
              Add Metric
            </Button>
          </div>
          <div className="space-y-2">
            {metrics.map((metric, index) => (
              <div key={index} className="flex items-center space-x-2">
                <select className="flex-1 border rounded-md px-3 py-2 text-sm">
                  <option>Select metric...</option>
                  <option>Count</option>
                  <option>Sum</option>
                  <option>Average</option>
                  <option>Min</option>
                  <option>Max</option>
                </select>
                <Button size="sm" variant="ghost" onClick={() => setMetrics(metrics.filter((_, i) => i !== index))}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Dimensions</h3>
            <Button size="sm" variant="outline" onClick={addDimension}>
              <Plus className="w-4 h-4 mr-1" />
              Add Dimension
            </Button>
          </div>
          <div className="space-y-2">
            {dimensions.map((dimension, index) => (
              <div key={index} className="flex items-center space-x-2">
                <select className="flex-1 border rounded-md px-3 py-2 text-sm">
                  <option>Select dimension...</option>
                  <option>Date</option>
                  <option>Course</option>
                  <option>Student</option>
                  <option>Teacher</option>
                  <option>Category</option>
                </select>
                <Button size="sm" variant="ghost" onClick={() => setDimensions(dimensions.filter((_, i) => i !== index))}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onSave({ metrics, dimensions })}>
            Save Report
          </Button>
          <Button onClick={() => onGenerate({ metrics, dimensions })}>
            Generate
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
