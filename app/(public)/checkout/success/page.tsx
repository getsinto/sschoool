import { Suspense } from 'react'
import { CheckoutSuccessContent } from '@/components/checkout/CheckoutSuccessContent'

function CheckoutSuccessFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<CheckoutSuccessFallback />}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
