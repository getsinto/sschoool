'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Video } from 'lucide-react'
import Link from 'next/link'

export default function LiveClassDetailPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/live-classes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Classes
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Class Details</h1>
          <p className="text-gray-600">View and manage live class</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Class Details</h3>
          <p className="text-gray-600">Live class details coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}