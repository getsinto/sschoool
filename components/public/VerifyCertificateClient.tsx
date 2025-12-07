'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Shield, Calendar, User, BookOpen } from 'lucide-react'

interface VerifyCertificateClientProps {
  code: string
}

export function VerifyCertificateClient({ code }: VerifyCertificateClientProps) {
  const [verification, setVerification] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    verifyCertificate()
  }, [code])

  const verifyCertificate = async () => {
    try {
      const response = await fetch(`/api/student/certificates/verify?code=${code}`)
      const data = await response.json()
      setVerification(data)
    } catch (error) {
      console.error('Error verifying certificate:', error)
      setVerification({ success: false })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-2">Certificate Verification</h1>
          <p className="text-muted-foreground">
            Verify the authenticity of this certificate
          </p>
        </div>

        <Card className="p-8">
          {verification?.success ? (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                <h2 className="text-2xl font-bold mb-2">Valid Certificate</h2>
                <Badge variant="default" className="bg-green-500">
                  Verified
                </Badge>
              </div>

              <div className="border-t pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Student Name</p>
                    <p className="font-semibold text-lg">{verification.data.studentName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Course Name</p>
                    <p className="font-semibold text-lg">{verification.data.courseName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Issue Date</p>
                    <p className="font-semibold">{verification.data.issueDate}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Issuing Institution</p>
                    <p className="font-semibold">{verification.data.institution}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Certificate Number</p>
                    <p className="font-mono font-semibold">{verification.data.certificateNumber}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <strong>Anti-Fraud Verification:</strong> This certificate has been verified against our secure database. 
                    The certificate number, student name, and course details match our records.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <XCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
                <h2 className="text-2xl font-bold mb-2">Invalid Certificate</h2>
                <Badge variant="destructive">
                  Not Verified
                </Badge>
              </div>

              <div className="border-t pt-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    <strong>Verification Failed:</strong> This certificate could not be verified. 
                    The verification code may be invalid, expired, or the certificate may have been revoked.
                  </p>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>If you believe this is an error, please contact support with the verification code:</p>
                <p className="font-mono font-semibold mt-2">{code}</p>
              </div>
            </div>
          )}
        </Card>

        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Certificate verification powered by secure blockchain technology</p>
        </div>
      </div>
    </div>
  )
}
