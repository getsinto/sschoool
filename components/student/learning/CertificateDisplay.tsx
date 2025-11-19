'use client'

import { Award, Download, Share2, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface CertificateDisplayProps {
  certificate: {
    id: string
    courseName: string
    studentName: string
    completionDate: string
    certificateUrl: string
    credentialId: string
  }
}

export default function CertificateDisplay({ certificate }: CertificateDisplayProps) {
  const downloadCertificate = () => {
    window.open(certificate.certificateUrl, '_blank')
  }

  const shareCertificate = async () => {
    const shareData = {
      title: `Certificate of Completion - ${certificate.courseName}`,
      text: `I've completed ${certificate.courseName}!`,
      url: certificate.certificateUrl
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(certificate.certificateUrl)
      alert('Certificate link copied to clipboard!')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Congratulations Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
          <Award className="w-8 h-8 text-yellow-600" />
        </div>
        <h1 className="text-3xl font-bold">Congratulations!</h1>
        <p className="text-gray-600">
          You've successfully completed the course
        </p>
      </div>

      {/* Certificate Preview */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-12 border-8 border-double border-blue-900">
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-wider text-gray-600">
                  Certificate of Completion
                </p>
                <h2 className="text-4xl font-serif font-bold text-gray-900">
                  {certificate.courseName}
                </h2>
              </div>

              <div className="space-y-2">
                <p className="text-gray-600">This certifies that</p>
                <p className="text-3xl font-bold text-blue-900">
                  {certificate.studentName}
                </p>
                <p className="text-gray-600">
                  has successfully completed the course requirements
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>
                  Completed on {new Date(certificate.completionDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              <div className="pt-6 border-t border-gray-300">
                <p className="text-xs text-gray-500">
                  Credential ID: {certificate.credentialId}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={downloadCertificate} size="lg">
          <Download className="w-4 h-4 mr-2" />
          Download Certificate
        </Button>
        <Button onClick={shareCertificate} variant="outline" size="lg">
          <Share2 className="w-4 h-4 mr-2" />
          Share Certificate
        </Button>
      </div>

      {/* Additional Info */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3">About Your Certificate</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• Your certificate is permanently stored and can be accessed anytime</li>
            <li>• Share your achievement on LinkedIn and other professional networks</li>
            <li>• The credential ID can be used to verify your certificate authenticity</li>
            <li>• Download a high-resolution PDF for printing or portfolio use</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
