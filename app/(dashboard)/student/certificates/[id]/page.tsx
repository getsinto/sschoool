'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import CertificateViewer from '@/components/student/certificates/CertificateViewer'
import { Download, Share2, Mail, Printer, Linkedin, Twitter, Facebook } from 'lucide-react'

export default function CertificateDetailPage() {
  const params = useParams()
  const [certificate, setCertificate] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCertificate()
  }, [params.id])

  const fetchCertificate = async () => {
    try {
      const response = await fetch(`/api/student/certificates/${params.id}`)
      const data = await response.json()
      if (data.success) {
        setCertificate(data.data)
      }
    } catch (error) {
      console.error('Error fetching certificate:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/student/certificates/${params.id}/download`)
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

  const handlePrint = () => {
    window.print()
  }

  const handleShare = (platform: string) => {
    const url = `${window.location.origin}/verify-certificate/${certificate.verificationCode}`
    const text = `I earned a certificate in ${certificate.courseName}!`

    switch (platform) {
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        break
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`Check out my certificate: ${url}`)}`
        break
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!certificate) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Certificate not found</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Certificate of Completion</h1>
          <p className="text-muted-foreground mt-1">{certificate.courseName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Certificate Viewer */}
        <div className="lg:col-span-2">
          <CertificateViewer certificate={certificate} />
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          {/* Actions Card */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Actions</h3>
            <div className="space-y-3">
              <Button className="w-full" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button className="w-full" variant="outline" onClick={handlePrint}>
                <Printer className="mr-2 h-4 w-4" />
                Print Certificate
              </Button>
            </div>
          </Card>

          {/* Share Card */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Share</h3>
            <div className="space-y-3">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => handleShare('linkedin')}
              >
                <Linkedin className="mr-2 h-4 w-4" />
                Share on LinkedIn
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => handleShare('twitter')}
              >
                <Twitter className="mr-2 h-4 w-4" />
                Share on Twitter
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => handleShare('facebook')}
              >
                <Facebook className="mr-2 h-4 w-4" />
                Share on Facebook
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => handleShare('email')}
              >
                <Mail className="mr-2 h-4 w-4" />
                Email Certificate
              </Button>
            </div>
          </Card>

          {/* Details Card */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Certificate Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Certificate Number</p>
                <p className="font-mono font-medium">{certificate.certificateNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Issue Date</p>
                <p className="font-medium">{certificate.issueDate}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Hours</p>
                <p className="font-medium">{certificate.totalHours} hours</p>
              </div>
              <div>
                <p className="text-muted-foreground">Verification URL</p>
                <a 
                  href={`/verify-certificate/${certificate.verificationCode}`}
                  target="_blank"
                  className="text-primary hover:underline break-all"
                >
                  {window.location.origin}/verify-certificate/{certificate.verificationCode}
                </a>
              </div>
            </div>
          </Card>

          {/* Skills Card */}
          {certificate.skills && certificate.skills.length > 0 && (
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Skills Learned</h3>
              <div className="flex flex-wrap gap-2">
                {certificate.skills.map((skill: string, idx: number) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
