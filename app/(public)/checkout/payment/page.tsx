import StaticLayout from '@/components/layout/StaticLayout'
import { PaymentPageClient } from '@/components/checkout/PaymentPageClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function PaymentPage() {
  return (
    <StaticLayout>
      <PaymentPageClient />
    </StaticLayout>
  )
}
