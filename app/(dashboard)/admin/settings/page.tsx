'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage system settings and configuration</p>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">System Settings</h3>
          <p className="text-gray-600">Settings interface coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}