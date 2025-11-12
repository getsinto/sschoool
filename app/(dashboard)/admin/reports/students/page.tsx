'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Users } from 'lucide-react'

export default function StudentReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Reports</h1>
        <p className="text-gray-600">View student analytics and performance reports</p>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Student Reports</h3>
          <p className="text-gray-600">Student reporting interface coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}