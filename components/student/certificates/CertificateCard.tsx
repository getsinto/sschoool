'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Eye, Share2, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CertificateCardProps {
  certificate: {
    id: string
    courseName: string
    issueDate: string
    certificateNumber: string
    verificationCode: string
    thumbnail?: string
    status: 'earned' | 'in-progress'
    completionPercentage?: number
  }
}

export default function CertificateCard({ certificate }: CertificateCardProps) {
  const router = useRouter()

  const handleView = () => {
    router.push(`/student/certificates/${certificate.id}`)
  }

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const response = await fetch(`/api/student/certificates/${certificate.id}/download`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificate-${certificate.certificateNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading certificate:', error)
    }
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Open share dialog or copy link
    const url = `${window.location.origin}/verify-certificate/${certificate.verificationCode}`
    navigator.clipboard.writeText(url)
    alert('Verification link copied to clipboard!')
  }

  if (certificate.status === 'in-progress') {
    return (
      <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={handleView}>
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">{certificate.courseName}</h3>
              <Badge variant="secondary">In Progress</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Completion</span>
              <span className="font-medium">{certificate.completionPercentage}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${certificate.completionPercentage}%` }}
              />
            </div>
          </div>

          <Button className="w-full" variant="outline">
            Continue Learning
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group" onClick={handleView}>
      {/* Certificate Thumbnail */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
        {certificate.thumbnail ? (
          <img
            src={certificate.thumbnail}
            alt={certificate.courseName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center p-6">
            <CheckCircle className="h-16 w-16 mx-auto mb-3 text-primary" />
            <p className="font-semibold text-lg">{certificate.courseName}</p>
            <p className="text-sm text-muted-foreground mt-1">Certificate of Completion</p>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </div>

      {/* Certificate Info */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg mb-1">{certificate.courseName}</h3>
          <p className="text-sm text-muted-foreground">Issued on {certificate.issueDate}</p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Certificate #</span>
          <span className="font-mono font-medium">{certificate.certificateNumber}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={handleView}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
