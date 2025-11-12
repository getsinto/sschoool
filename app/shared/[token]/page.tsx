'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Share } from 'lucide-react'

export default function SharedFilePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <Share className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Shared File</h3>
          <p className="text-gray-600">File sharing interface coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}