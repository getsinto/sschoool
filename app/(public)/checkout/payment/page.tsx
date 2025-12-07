'use client'

import StaticLayout from '@/components/layout/StaticLayout'
import { PaymentPageClient } from '@/components/checkout/PaymentPageClient'

export default function PaymentPage() {
  return (
    <StaticLayout>
      <PaymentPageClient />
    </StaticLayout>
  )
}
