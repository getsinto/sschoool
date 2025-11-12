'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface RazorpayCheckoutProps {
  orderId: string
  amount: number
  currency: string
  courseName: string
  onSuccess: (response: any) => void
  onFailure: (error: any) => void
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function RazorpayCheckout({
  orderId,
  amount,
  currency,
  courseName,
  onSuccess,
  onFailure,
}: RazorpayCheckoutProps) {
  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handlePayment = () => {
    if (!window.Razorpay) {
      onFailure({ message: 'Razorpay SDK not loaded' })
      return
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: amount * 100, // Convert to paise
      currency: currency,
      name: 'St Haroon School',
      description: courseName,
      order_id: orderId,
      handler: function (response: any) {
        // Verify payment signature on backend
        verifyPayment(response)
      },
      prefill: {
        name: '',
        email: '',
        contact: '',
      },
      theme: {
        color: '#3B82F6',
      },
      modal: {
        ondismiss: function () {
          onFailure({ message: 'Payment cancelled by user' })
        },
      },
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
  }

  const verifyPayment = async (response: any) => {
    try {
      const verifyResponse = await fetch('/api/payments/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        }),
      })

      const data = await verifyResponse.json()

      if (data.success) {
        onSuccess(response)
      } else {
        onFailure({ message: 'Payment verification failed' })
      }
    } catch (error) {
      onFailure(error)
    }
  }

  return (
    <Button onClick={handlePayment} className="w-full">
      Pay with Razorpay
    </Button>
  )
}
