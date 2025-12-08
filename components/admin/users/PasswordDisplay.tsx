'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle2, Copy, Mail, RefreshCw, Eye, EyeOff } from 'lucide-react'

interface PasswordDisplayProps {
  user: {
    id: string
    email: string
    fullName: string
    role: string
  }
  password: string
  onCreateAnother: () => void
  onFinish: () => void
}

export default function PasswordDisplay({
  user,
  password,
  onCreateAnother,
  onFinish,
}: PasswordDisplayProps) {
  const [copied, setCopied] = useState(false)
  const [showPassword, setShowPassword] = useState(true)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleSendEmail = async () => {
    setSendingEmail(true)
    try {
      const response = await fetch('/api/admin/users/send-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          userName: user.fullName,
          temporaryPassword: password,
          userRole: user.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email')
      }

      setEmailSent(true)
    } catch (error) {
      console.error('Failed to send email:', error)
      alert('Failed to send credentials email. Please try again or share the password manually.')
    } finally {
      setSendingEmail(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900">User Created Successfully!</h3>
        <p className="text-sm text-gray-600 mt-2">
          The user account has been created. Please share the temporary password securely.
        </p>
      </div>

      {/* User Details */}
      <Card className="p-4 bg-gray-50">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-600">Full Name</dt>
            <dd className="text-gray-900 font-medium">{user.fullName}</dd>
          </div>
          <div>
            <dt className="text-gray-600">Email</dt>
            <dd className="text-gray-900 font-medium">{user.email}</dd>
          </div>
          <div>
            <dt className="text-gray-600">Role</dt>
            <dd className="text-gray-900 font-medium capitalize">{user.role}</dd>
          </div>
          <div>
            <dt className="text-gray-600">User ID</dt>
            <dd className="text-gray-900 font-mono text-xs">{user.id}</dd>
          </div>
        </dl>
      </Card>

      {/* Temporary Password */}
      <Card className="p-6 border-2 border-blue-200 bg-blue-50">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Temporary Password</h4>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 font-mono text-lg">
                {showPassword ? password : '••••••••••••'}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                className={copied ? 'bg-green-50 border-green-500' : ''}
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={handleSendEmail}
              disabled={sendingEmail || emailSent}
              className="flex-1"
            >
              {sendingEmail ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : emailSent ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Email Sent
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Email Credentials to User
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Security Reminder */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h5 className="font-semibold text-yellow-900 mb-2">Security Reminder</h5>
        <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
          <li>This password is temporary and should be changed by the user</li>
          <li>Share this password through a secure channel</li>
          <li>Do not store this password in plain text</li>
          <li>The user will be required to change it on first login</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={onCreateAnother}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Create Another User
        </Button>
        <Button onClick={onFinish}>
          Finish
        </Button>
      </div>
    </div>
  )
}
