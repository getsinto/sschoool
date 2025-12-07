import StaticLayout from '@/components/layout/StaticLayout'
import { VerifyCertificateClient } from '@/components/public/VerifyCertificateClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function VerifyCertificatePage({ params }: { params: { code: string } }) {
  return (
    <StaticLayout>
      <VerifyCertificateClient code={params.code} />
    </StaticLayout>
  )
}
