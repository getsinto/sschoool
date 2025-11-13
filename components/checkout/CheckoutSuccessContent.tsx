'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircle, Download, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent')
    if (paymentIntent) {
      verifyPayment(paymentIntent)
    }
  }, [searchParams])

  const verifyPayment = async (paymentIntentId: string) => {
    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId })
      })
      
      const data = await response.json()
      if (data.success) {
        setOrderDetails(data.order)
      }
    } catch (error) {
      console.error('Payment verification failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadInvoice = async () => {
    if (!orderDetails) return
    
    try {
      const response = await fetch(`/api/payments/invoice/${orderDetails.id}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${orderDetails.id}.pdf`
      a.click()
    } catch (error) {
      console.error('Invoice download failed:', error)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Verifying payment...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <p className="text-gray-600">Thank you for your purchase</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {orderDetails && (
              <div className="space-y-4">
                <div className="border-t border-b py-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID</span>
                    <span className="font-semibold">{orderDetails.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Course</span>
                    <span className="font-semibold">{orderDetails.courseName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid</span>
                    <span className="font-semibold">${orderDetails.amount}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button onClick={downloadInvoice} variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Invoice
                  </Button>
                  <Button onClick={() => router.push('/dashboard')} className="w-full">
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    You will receive a confirmation email shortly with your course access details.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
