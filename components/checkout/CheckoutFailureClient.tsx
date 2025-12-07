'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle } from 'lucide-react'

export function CheckoutFailureClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-6 w-6" />
              Payment Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Unfortunately, your payment could not be processed.</p>
            {error && <p className="text-sm text-gray-600">Error: {error}</p>}
            <div className="flex gap-2">
              <Button onClick={() => router.back()}>
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.push('/')}>
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
