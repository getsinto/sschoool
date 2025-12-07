'use client'

import StaticLayout from '@/components/layout/StaticLayout'
import { CheckoutSuccessClient } from '@/components/checkout/CheckoutSuccessClient'

export default function PaymentSuccessPage() {
  return (
    <StaticLayout>
      <CheckoutSuccessClient />
    </StaticLayout>
  )
}
