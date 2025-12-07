import { StaticLayout } from '@/components/layout/StaticLayout'
import { CheckoutClient } from '@/components/checkout/CheckoutClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function CheckoutPage({ params }: { params: { courseId: string } }) {
  return (
    <StaticLayout>
      <CheckoutClient courseId={params.courseId} />
    </StaticLayout>
  )
}
