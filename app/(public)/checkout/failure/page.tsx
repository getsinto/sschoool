'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function PaymentFailurePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const errorMessage = searchParams.get('error') || 'Payment failed. Please try again.'

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <XCircle className="w-16 h-16 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Payment Failed</CardTitle>
            <p className="text-gray-600">We couldn't process your payment</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>

            <div className="space-y-3">
              <Button onClick={() => router.back()} variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={() => router.push('/checkout')} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>

            <div className="text-sm text-gray-600 space-y-2">
              <p className="font-semibold">Common reasons for payment failure:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Insufficient funds</li>
                <li>Incorrect card details</li>
                <li>Card expired</li>
                <li>Payment declined by bank</li>
              </ul>
              <p className="mt-4">
                If the problem persists, please contact your bank or try a different payment method.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
