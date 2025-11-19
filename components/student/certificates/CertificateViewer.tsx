'use client'

import { Card } from '@/components/ui/card'
import { Award, CheckCircle } from 'lucide-react'

interface CertificateViewerProps {
  certificate: {
    studentName: string
    courseName: string
    completionDate: string
    instructorName: string
    instructorSignature?: string
    certificateNumber: string
    verificationCode: string
    institution: string
    seal?: string
  }
}

// Simple QR Code placeholder component
// Replace with actual QR code library in production (e.g., react-qr-code, qrcode.react)
function SimpleQRCode({ value, size = 64 }: { value: string; size?: number }) {
  return (
    <div 
      className="bg-gray-900 flex items-center justify-center text-white text-xs font-mono p-2 border-2 border-gray-700"
      style={{ width: size, height: size }}
      title={value}
    >
      <span className="text-center">QR</span>
    </div>
  )
}

export default function CertificateViewer({ certificate }: CertificateViewerProps) {
  const verificationUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify-certificate/${certificate.verificationCode}`

  return (
    <Card className="p-12 bg-gradient-to-br from-white to-primary/5 border-4 border-primary/20">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Award className="h-20 w-20 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">
              Certificate of Completion
            </h1>
            <p className="text-lg text-muted-foreground">
              This is to certify that
            </p>
          </div>
        </div>

        {/* Student Name */}
        <div className="text-center">
          <h2 className="text-5xl font-serif font-bold border-b-2 border-primary/30 pb-2 inline-block px-8">
            {certificate.studentName}
          </h2>
        </div>

        {/* Course Info */}
        <div className="text-center space-y-2">
          <p className="text-lg text-muted-foreground">
            has successfully completed the course
          </p>
          <h3 className="text-3xl font-bold text-primary">
            {certificate.courseName}
          </h3>
          <p className="text-muted-foreground">
            on {certificate.completionDate}
          </p>
        </div>

        {/* Footer Section */}
        <div className="grid grid-cols-3 gap-8 pt-8 border-t-2 border-primary/20">
          {/* Instructor Signature */}
          <div className="text-center space-y-2">
            {certificate.instructorSignature ? (
              <img
                src={certificate.instructorSignature}
                alt="Instructor Signature"
                className="h-16 mx-auto"
              />
            ) : (
              <div className="h-16 flex items-center justify-center">
                <div className="font-serif text-2xl italic">{certificate.instructorName}</div>
              </div>
            )}
            <div className="border-t-2 border-foreground/20 pt-2">
              <p className="font-semibold">{certificate.instructorName}</p>
              <p className="text-sm text-muted-foreground">Instructor</p>
            </div>
          </div>

          {/* Institution Seal */}
          <div className="text-center space-y-2">
            {certificate.seal ? (
              <img
                src={certificate.seal}
                alt="Institution Seal"
                className="h-16 mx-auto"
              />
            ) : (
              <div className="h-16 flex items-center justify-center">
                <CheckCircle className="h-16 w-16 text-primary" />
              </div>
            )}
            <div className="border-t-2 border-foreground/20 pt-2">
              <p className="font-semibold">{certificate.institution}</p>
              <p className="text-sm text-muted-foreground">Issuing Institution</p>
            </div>
          </div>

          {/* QR Code */}
          <div className="text-center space-y-2">
            <div className="h-16 flex items-center justify-center">
              <SimpleQRCode
                value={verificationUrl}
                size={64}
              />
            </div>
            <div className="border-t-2 border-foreground/20 pt-2">
              <p className="font-mono text-xs font-semibold">{certificate.certificateNumber}</p>
              <p className="text-sm text-muted-foreground">Scan to Verify</p>
            </div>
          </div>
        </div>

        {/* Verification URL */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Verify this certificate at:</p>
          <p className="font-mono">{verificationUrl}</p>
        </div>
      </div>
    </Card>
  )
}
