'use client'

import StaticLayout from '@/components/layout/StaticLayout'
import { CheckoutFailureClient } from '@/components/checkout/CheckoutFailureClient'

export default function PaymentFailurePage() {
  return (
    <StaticLayout>
      <CheckoutFailureClient />
    </StaticLayout>
  )
}
