'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LucideIcon } from 'lucide-react'

interface ReportCardProps {
  title: string
  description: string
  icon: LucideIcon
  onGenerate: () => void
  lastGenerated?: string
}

export default function ReportCard({ title, description, icon: Icon, onGenerate, lastGenerated }: ReportCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600 mb-3">{description}</p>
            {lastGenerated && (
              <p className="text-xs text-gray-500 mb-3">Last generated: {lastGenerated}</p>
            )}
            <Button size="sm" onClick={onGenerate}>
              Generate Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
