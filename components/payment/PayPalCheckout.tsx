'use client'

import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js'

interface PayPalCheckoutProps {
  amount: string
  currency: string
  courseId: string
  userId: string
  onSuccess: (details: any) => void
  onError: (error: any) => void
}

export default function PayPalCheckout({
  amount,
  currency,
  courseId,
  userId,
  onSuccess,
  onError,
}: PayPalCheckoutProps) {
  const createOrder = async () => {
    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          userId,
          paymentMethod: 'paypal',
          amount: parseFloat(amount),
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error)
      }

      return data.orderId
    } catch (error) {
      console.error('PayPal order creation failed:', error)
      onError(error)
      throw error
    }
  }

  const onApprove = async (data: any) => {
    try {
      const response = await fetch('/api/payments/paypal/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: data.orderID,
        }),
      })

      const details = await response.json()

      if (details.success) {
        onSuccess(details)
      } else {
        onError(new Error('Payment capture failed'))
      }
    } catch (error) {
      console.error('PayPal capture failed:', error)
      onError(error)
    }
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
        currency: currency,
      }}
    >
      <PayPalButtons
        createOrder={createOrder}
        onApprove={onApprove}
        onError={onError}
        style={{
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'pay',
        }}
      />
    </PayPalScriptProvider>
  )
}
