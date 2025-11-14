'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { 
  X, 
  Share2, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  Download,
  Lock,
  Eye
} from 'lucide-react'

interface ShareLinkModalProps {
  isOpen: boolean
  onClose: () => void
  file: {
    id: string
    name: string
    type: string
  }
  onCreateShare: (options: ShareOptions) => Promise<ShareResult>
}

interface ShareOptions {
  expiryDays: number
  allowDownload: boolean
  password?: string
}

interface ShareResult {
  url: string
  token: string
  expiryDate: string
}

export default function ShareLinkModal({
  isOpen,
  onClose,
  file,
  onCreateShare
}: ShareLinkModalProps) {
  const [expiryDays, setExpiryDays] = useState('7')
  const [allowDownload, setAllowDownload] = useState(true)
  const [requirePassword, setRequirePassword] = useState(false)
  const [password, setPassword] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [shareResult, setShareResult] = useState<ShareResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleCreateShare = async () => {
    setError('')

    // Validation
    if (requirePassword && !password) {
      setError('Password is required when password protection is enabled')
      return
    }

    if (requirePassword && password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsCreating(true)

    try {
      const result = await onCreateShare({
        expiryDays: parseInt(expiryDays),
        allowDownload,
        password: requirePassword ? password : undefined
      })

      setShareResult(result)
    } catch (err: any) {
      setError(err.message || 'Failed to create share link')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCopyLink = async () => {
    if (!shareResult) return

    try {
      await navigator.clipboard.writeText(shareResult.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      setError('Failed to copy link to clipboard')
    }
  }

  const handleClose = () => {
    if (!isCreating) {
      setExpiryDays('7')
      setAllowDownload(true)
      setRequirePassword(false)
      setPassword('')
      setShareResult(null)
      setCopied(false)
      setError('')
      onClose()
    }
  }

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            <CardTitle>Share File</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose}
            disabled={isCreating}
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* File Info */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
            <p className="text-xs text-gray-500 capitalize">{file.type}</p>
          </div>

          {!shareResult ? (
            <>
              {/* Expiry Selection */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  Link Expiry
                </label>
                <Select value={expiryDays} onValueChange={setExpiryDays} disabled={isCreating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Day</SelectItem>
                    <SelectItem value="3">3 Days</SelectItem>
                    <SelectItem value="7">7 Days</SelectItem>
                    <SelectItem value="14">14 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="90">90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Allow Download Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Download className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Allow Download</p>
                    <p className="text-xs text-gray-500">Let recipients download the file</p>
                  </div>
                </div>
                <Switch
                  checked={allowDownload}
                  onCheckedChange={setAllowDownload}
                  disabled={isCreating}
                />
              </div>

              {/* Password Protection Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Password Protection</p>
                    <p className="text-xs text-gray-500">Require password to access</p>
                  </div>
                </div>
                <Switch
                  checked={requirePassword}
                  onCheckedChange={setRequirePassword}
                  disabled={isCreating}
                />
              </div>

              {/* Password Input */}
              {requirePassword && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter password (min 6 characters)"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError('')
                    }}
                    disabled={isCreating}
                    minLength={6}
                  />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isCreating}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateShare}
                  disabled={isCreating}
                  className="flex-1"
                >
                  {isCreating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Share Link'
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-700">Share link created successfully!</p>
                </div>

                {/* Share Link */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Share Link
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      value={shareResult.url}
                      readOnly
                      className="flex-1"
                    />
                    <Button onClick={handleCopyLink} variant="outline">
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Share Details */}
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Expires:
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatExpiryDate(shareResult.expiryDate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center">
                      <Download className="w-4 h-4 mr-2" />
                      Download:
                    </span>
                    <span className="font-medium text-gray-900">
                      {allowDownload ? 'Allowed' : 'Not Allowed'}
                    </span>
                  </div>
                  {requirePassword && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center">
                        <Lock className="w-4 h-4 mr-2" />
                        Password:
                      </span>
                      <span className="font-medium text-gray-900">Protected</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center">
                      <Eye className="w-4 h-4 mr-2" />
                      Views:
                    </span>
                    <span className="font-medium text-gray-900">0</span>
                  </div>
                </div>

                {/* Close Button */}
                <Button onClick={handleClose} className="w-full">
                  Done
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
