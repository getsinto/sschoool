'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, X, FileText, Image, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { toast } from 'react-hot-toast'

interface IDDocument {
  id: string
  type: 'front' | 'back'
  file: File
  preview: string
}

const ID_CARD_TYPES = [
  'National ID Card',
  'Passport',
  'Driver\'s License',
  'Student ID',
  'Birth Certificate',
  'Other Government ID'
]

export default function IDVerification() {
  const { profile, updateProfile } = useUser()
  const [idCardType, setIdCardType] = useState(profile?.id_card_type || '')
  const [documents, setDocuments] = useState<IDDocument[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const frontInputRef = useRef<HTMLInputElement>(null)
  const backInputRef = useRef<HTMLInputElement>(null)

  const getVerificationStatus = () => {
    if (!profile?.id_card_url) {
      return { status: 'not_submitted', label: 'Not Submitted', color: 'secondary' }
    }
    
    if (profile.is_verified) {
      return { status: 'verified', label: 'Verified', color: 'default' }
    }
    
    return { status: 'pending', label: 'Pending Review', color: 'secondary' }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'front' | 'back') => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and PDF files are allowed')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const newDocument: IDDocument = {
        id: `${type}_${Date.now()}`,
        type,
        file,
        preview: e.target?.result as string
      }

      setDocuments(prev => {
        // Remove existing document of the same type
        const filtered = prev.filter(doc => doc.type !== type)
        return [...filtered, newDocument]
      })
    }
    reader.readAsDataURL(file)
  }

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id))
    
    // Clear file inputs
    const doc = documents.find(d => d.id === id)
    if (doc?.type === 'front' && frontInputRef.current) {
      frontInputRef.current.value = ''
    }
    if (doc?.type === 'back' && backInputRef.current) {
      backInputRef.current.value = ''
    }
  }

  const handleSubmit = async () => {
    if (!idCardType) {
      toast.error('Please select an ID card type')
      return
    }

    if (documents.length === 0) {
      toast.error('Please upload at least one document')
      return
    }

    setIsLoading(true)

    try {
      // Upload documents
      const uploadPromises = documents.map(async (doc) => {
        const formData = new FormData()
        formData.append('file', doc.file)
        formData.append('type', doc.type)
        formData.append('documentType', 'id_verification')

        const response = await fetch('/api/profile/upload-document', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(`Failed to upload ${doc.type} document`)
        }

        return response.json()
      })

      const uploadResults = await Promise.all(uploadPromises)
      
      // Update profile with document URLs
      const frontDoc = uploadResults.find(result => result.type === 'front')
      const backDoc = uploadResults.find(result => result.type === 'back')

      const { error } = await updateProfile({
        id_card_type: idCardType,
        id_card_url: frontDoc?.url || uploadResults[0]?.url,
        // Store back document URL in a separate field if needed
      })

      if (error) {
        throw new Error(error)
      }

      toast.success('ID verification documents submitted successfully!')
      setDocuments([])
      
      // Clear file inputs
      if (frontInputRef.current) frontInputRef.current.value = ''
      if (backInputRef.current) backInputRef.current.value = ''

    } catch (error: any) {
      toast.error(error.message || 'Failed to submit documents')
    } finally {
      setIsLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const verificationStatus = getVerificationStatus()

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">ID Verification</h1>
        <p className="text-gray-600">Upload your identification documents for account verification</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Verification Status</CardTitle>
              <CardDescription>Current status of your ID verification</CardDescription>
            </div>
            <Badge 
              variant={verificationStatus.color as any}
              className="flex items-center space-x-1"
            >
              {verificationStatus.status === 'verified' && <CheckCircle className="h-3 w-3" />}
              {verificationStatus.status === 'pending' && <Clock className="h-3 w-3" />}
              {verificationStatus.status === 'not_submitted' && <XCircle className="h-3 w-3" />}
              <span>{verificationStatus.label}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {verificationStatus.status === 'verified' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Verification Complete</p>
                  <p className="text-sm text-green-700">
                    Your identity has been verified successfully. You have full access to all platform features.
                  </p>
                </div>
              </div>
            </div>
          )}

          {verificationStatus.status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">Under Review</p>
                  <p className="text-sm text-yellow-700">
                    Your documents are being reviewed by our team. This usually takes 24-48 hours.
                    You'll receive an email notification once the review is complete.
                  </p>
                </div>
              </div>
            </div>
          )}

          {verificationStatus.status === 'not_submitted' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Verification Required</p>
                  <p className="text-sm text-blue-700">
                    Please upload your identification documents to verify your account and access all features.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
          <CardDescription>
            {verificationStatus.status === 'verified' 
              ? 'You can update your documents if needed'
              : 'Upload clear photos or scans of your identification documents'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ID Card Type Selection */}
          <div className="space-y-2">
            <Label>ID Card Type</Label>
            <Select value={idCardType} onValueChange={setIdCardType}>
              <SelectTrigger>
                <SelectValue placeholder="Select your ID card type" />
              </SelectTrigger>
              <SelectContent>
                {ID_CARD_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document Upload Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Front Document */}
            <div className="space-y-2">
              <Label>Front Side</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {documents.find(doc => doc.type === 'front') ? (
                  <div className="space-y-3">
                    {(() => {
                      const frontDoc = documents.find(doc => doc.type === 'front')!
                      return (
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            {frontDoc.file.type === 'application/pdf' ? (
                              <FileText className="h-8 w-8 text-red-500" />
                            ) : (
                              <div className="w-12 h-8 rounded overflow-hidden">
                                <img
                                  src={frontDoc.preview}
                                  alt="Front document"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium">{frontDoc.file.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(frontDoc.file.size)}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(frontDoc.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })()}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => frontInputRef.current?.click()}
                      className="w-full"
                    >
                      Replace Document
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => frontInputRef.current?.click()}
                      >
                        Upload Front Side
                      </Button>
                      <p className="mt-2 text-sm text-gray-500">
                        JPEG, PNG, or PDF (max 5MB)
                      </p>
                    </div>
                  </div>
                )}
                <input
                  ref={frontInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={(e) => handleFileUpload(e, 'front')}
                  className="hidden"
                />
              </div>
            </div>

            {/* Back Document */}
            <div className="space-y-2">
              <Label>Back Side (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {documents.find(doc => doc.type === 'back') ? (
                  <div className="space-y-3">
                    {(() => {
                      const backDoc = documents.find(doc => doc.type === 'back')!
                      return (
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            {backDoc.file.type === 'application/pdf' ? (
                              <FileText className="h-8 w-8 text-red-500" />
                            ) : (
                              <div className="w-12 h-8 rounded overflow-hidden">
                                <img
                                  src={backDoc.preview}
                                  alt="Back document"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium">{backDoc.file.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(backDoc.file.size)}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(backDoc.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })()}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => backInputRef.current?.click()}
                      className="w-full"
                    >
                      Replace Document
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => backInputRef.current?.click()}
                      >
                        Upload Back Side
                      </Button>
                      <p className="mt-2 text-sm text-gray-500">
                        JPEG, PNG, or PDF (max 5MB)
                      </p>
                    </div>
                  </div>
                )}
                <input
                  ref={backInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={(e) => handleFileUpload(e, 'back')}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Document Guidelines
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Ensure all text and details are clearly visible</li>
              <li>• Use good lighting and avoid shadows</li>
              <li>• Make sure the document is not expired</li>
              <li>• Avoid blurry or low-quality images</li>
              <li>• Include all four corners of the document</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !idCardType || documents.length === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                verificationStatus.status === 'verified' ? 'Update Documents' : 'Submit for Verification'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}