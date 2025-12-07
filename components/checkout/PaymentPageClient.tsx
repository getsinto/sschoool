'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard } from 'lucide-react'

export function PaymentPageClient() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      // Initialize payment
      setTimeout(() => setLoading(false), 1000)
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading payment...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Payment processing for order: {orderId}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
