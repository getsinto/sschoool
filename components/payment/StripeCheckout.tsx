'use client'

import { useState, useEffect } from 'react'
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripeCheckoutProps {
  amount: number
  currency: string
  courseId: string
  userId: string
  onSuccess: (paymentIntent: any) => void
  onError: (error: any) => void
}

// Payment Form Component
function CheckoutForm({ onSuccess, onError }: { onSuccess: (paymentIntent: any) => void; onError: (error: any) => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      })

      if (error) {
        setErrorMessage(error.message || 'Payment failed')
        onError(error)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent)
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'An unexpected error occurred')
      onError(error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Pay Now'
        )}
      </Button>
    </form>
  )
}

// Main Stripe Checkout Component
export default function StripeCheckout({
  amount,
  currency,
  courseId,
  userId,
  onSuccess,
  onError,
}: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Create payment intent on mount
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/payments/intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            currency,
            courseId,
            userId,
            paymentMethod: 'stripe',
          }),
        })

        const data = await response.json()

        if (data.success && data.clientSecret) {
          setClientSecret(data.clientSecret)
        } else {
          setError(data.error || 'Failed to initialize payment')
          onError(new Error(data.error))
        }
      } catch (err: any) {
        setError(err.message || 'Failed to initialize payment')
        onError(err)
      } finally {
        setLoading(false)
      }
    }

    createPaymentIntent()
  }, [amount, currency, courseId, userId, onError])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !clientSecret) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error || 'Failed to load payment form'}</AlertDescription>
      </Alert>
    )
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#3B82F6',
      },
    },
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm onSuccess={onSuccess} onError={onError} />
    </Elements>
  )
}
