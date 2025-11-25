'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Mail, Clock, ArrowRight, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export function RegisterSuccessWrapper() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState('')

  const userType = searchParams.get('userType') || 'student'
  const email = searchParams.get('email') || ''

  const getApprovalTime = (type: string) => {
    switch (type) {
      case 'teacher': return '24-48 hours'
      case 'student':
      case 'parent':
      case 'spoken_english':
      default: return '2-4 hours'
    }
  }

  const getStatusMessage = (type: string) => {
    switch (type) {
      case 'teacher':
        return {
          title: 'Application Under Review',
          description: 'Your teacher application has been submitted and is currently under manual review by our team.',
          timeline: 'You will receive an email notification within 24-48 hours once your application has been reviewed.'
        }
      case 'student':
        return {
          title: 'Registration Successful',
          description: 'Your student account has been created successfully.',
          timeline: 'Please check your email for verification instructions. Verification typically takes 2-4 hours.'
        }
      case 'parent':
        return {
          title: 'Registration Successful',
          description: 'Your parent account has been created successfully.',
          timeline: 'Please check your email for verification instructions. Verification typically takes 2-4 hours.'
        }
      case 'spoken_english':
        return {
          title: 'Registration Successful',
          description: 'Your spoken English student account has been created successfully.',
          timeline: 'Please check your email for verification instructions. Verification typically takes 2-4 hours.'
        }
      default:
        return {
          title: 'Registration Successful',
          description: 'Your account has been created successfully.',
          timeline: 'Please check your email for verification instructions.'
        }
    }
  }

  const handleResendEmail = async () => {
    setIsResending(true)
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setResendMessage('Verification email sent successfully!')
      } else {
        setResendMessage('Failed to resend email. Please try again.')
      }
    } catch (error) {
      setResendMessage('An error occurred. Please try again.')
    } finally {
      setIsResending(false)
      setTimeout(() => setResendMessage(''), 5000)
    }
  }

  const status = getStatusMessage(userType)

  useEffect(() => {
    localStorage.removeItem('registration_draft')
  }, [])

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {status.title}
            </h1>
            <p className="text-gray-600">
              {status.description}
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                What Happens Next?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Expected Timeline</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      {status.timeline}
                    </p>
                  </div>
                </div>
              </div>

              {userType !== 'teacher' && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Email Verification Required</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    We've sent a verification email to <strong>{email}</strong>. 
                    Please check your inbox and click the verification link to activate your account.
                  </p>
                  
                  {resendMessage && (
                    <div className={`p-3 rounded-lg mb-4 ${
                      resendMessage.includes('successfully') 
                        ? 'bg-green-50 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {resendMessage}
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResendEmail}
                    disabled={isResending}
                  >
                    {isResending ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Resend Verification Email
                      </>
                    )}
                  </Button>
                </div>
              )}

              {userType === 'teacher' && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Manual Review Process</h4>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <p>Our team will review your qualifications and teaching experience</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <p>We'll verify your uploaded documents and credentials</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <p>You'll receive an email notification with the review outcome</p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <p>If approved, you can immediately start creating and teaching courses</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-900 mb-2">While You Wait</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <span>Check your email (including spam folder) for our messages</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <span>Explore our course catalog and platform features</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                    <span>Join our community forums and connect with other learners</span>
                  </li>
                  {userType === 'teacher' && (
                    <li className="flex items-center space-x-2">
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                      <span>Prepare your course materials and teaching content</span>
                    </li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/">
                Return to Homepage
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/login">
                Try to Sign In
              </Link>
            </Button>
          </div>

          <div className="text-center mt-8 p-4 bg-gray-100 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Need Help?</h4>
            <p className="text-sm text-gray-600 mb-3">
              If you don't receive our email within the expected timeframe or have any questions about your registration:
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
              <span className="text-gray-600">Contact us at:</span>
              <a href="mailto:support@stharoon.com" className="text-blue-600 hover:underline">
                support@stharoon.com
              </a>
              <span className="text-gray-600">or</span>
              <a href="tel:+1234567890" className="text-blue-600 hover:underline">
                +1 (234) 567-890
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
