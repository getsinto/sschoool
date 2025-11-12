'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Video } from 'lucide-react'

export default function LiveClassesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Classes</h1>
          <p className="text-gray-600">Manage live classes and sessions</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Schedule Class
        </Button>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Live Classes</h3>
          <p className="text-gray-600">Live class management coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}