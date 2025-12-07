import { StaticLayout } from '@/components/layout/StaticLayout'
import { CheckoutSuccessClient } from '@/components/checkout/CheckoutSuccessClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function PaymentSuccessPage() {
  return (
    <StaticLayout>
      <CheckoutSuccessClient />
    </StaticLayout>
  )
}
