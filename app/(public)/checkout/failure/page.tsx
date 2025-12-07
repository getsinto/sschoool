import { StaticLayout } from '@/components/layout/StaticLayout'
import { CheckoutFailureClient } from '@/components/checkout/CheckoutFailureClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function PaymentFailurePage() {
  return (
    <StaticLayout>
      <CheckoutFailureClient />
    </StaticLayout>
  )
}
