'use client'

import { Card, CardContent } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">View analytics and reports</p>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Reports Dashboard</h3>
          <p className="text-gray-600">Reports interface coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}