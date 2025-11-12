'use client'

import { useState } from 'react'
import { IDVerification as IDVerificationType, ValidationErrors, ID_TYPES } from '@/types/registration'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, FileText, X, Camera, Shield } from 'lucide-react'

interface IDVerificationProps {
  data: Partial<IDVerificationType>
  errors: ValidationErrors
  onChange: (data: Partial<IDVerificationType>) => void
  onNext: () => void
  onBack: () => void
  uploadFile: (file: File, type: 'id_front' | 'id_back' | 'profile_photo' | 'selfie_with_id' | 'resume') => Promise<string>
}

export function IDVerification({ 
  data, 
  errors, 
  onChange, 
  onNext, 
  onBack,
  uploadFile 
}: IDVerificationProps) {
  const [uploading, setUploading] = useState<string | null>(null)

  const handleFileUpload = async (file: File, type: string) => {
    setUploading(type)
    try {
      const url = await uploadFile(file, type)
      onChange({ ...data, [`${type}Url`]: url })
    } catch (error) {
      console.error('File upload failed:', error)
    } finally {
      setUploading(null)
    }
  }

  const FileUploadArea = ({ 
    type, 
    title, 
    description, 
    required = false,
    accept = "image/*,.pdf"
  }: {
    type: string
    title: string
    description: string
    required?: boolean
    accept?: string
  }) => {
    const fileUrl = data[`${type}Url` as keyof IDVerificationType] as string
    const isUploading = uploading === type

    return (
      <div>
        <Label className="flex items-center gap-2">
          {title} {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="mt-2">
          {fileUrl ? (
            <div className="flex items-center justify-between p-3 border border-green-200 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-800">File uploaded successfully</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange({ ...data, [`${type}Url`]: '' })}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor={`${type}-upload`} className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    {title}
                  </span>
                  <span className="mt-1 block text-sm text-gray-500">
                    {description}
                  </span>
                </label>
                <input
                  id={`${type}-upload`}
                  type="file"
                  accept={accept}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, type)
                  }}
                  disabled={isUploading}
                />
                <div className="mt-2 flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                    onClick={() => document.getElementById(`${type}-upload`)?.click()}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                </div>
              </div>
              {isUploading && (
                <div className="mt-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Uploading...</p>
                </div>
              )}
            </div>
          )}
        </div>
        {errors[`${type}Url`] && (
          <p className="text-sm text-red-600 mt-1">{errors[`${type}Url`]}</p>
        )}
      </div>
    )
  }

  const getIdNumberPlaceholder = () => {
    switch (data.idType) {
      case 'Aadhaar Card (India)': return 'XXXX XXXX XXXX'
      case 'Passport (International)': return 'A1234567'
      case 'Driver\'s License': return 'DL123456789'
      case 'National ID Card': return 'ID123456789'
      case 'Student ID Card': return 'STU123456'
      default: return 'Enter ID number'
    }
  }

  const requiresBackSide = () => {
    return ['Aadhaar Card (India)', 'Driver\'s License', 'National ID Card'].includes(data.idType || '')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Identity Verification
          </CardTitle>
          <p className="text-sm text-gray-600">
            Please upload your identification documents for account verification. All documents are encrypted and securely stored.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Privacy Notice */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Your Privacy is Protected</h4>
                <p className="text-sm text-blue-800 mt-1">
                  Your ID documents are encrypted, securely stored, and only used for verification purposes. 
                  We comply with all data protection regulations.
                </p>
              </div>
            </div>
          </div>

          {/* ID Type Selection */}
          <div>
            <Label htmlFor="idType">ID Type *</Label>
            <Select 
              value={data.idType || ''} 
              onValueChange={(value) => onChange({ ...data, idType: value, idNumber: '' })}
            >
              <SelectTrigger className={errors.idType ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select ID type" />
              </SelectTrigger>
              <SelectContent>
                {ID_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.idType && (
              <p className="text-sm text-red-600 mt-1">{errors.idType}</p>
            )}
          </div>

          {/* ID Number */}
          {data.idType && (
            <div>
              <Label htmlFor="idNumber">ID Number *</Label>
              <Input
                id="idNumber"
                value={data.idNumber || ''}
                onChange={(e) => onChange({ ...data, idNumber: e.target.value })}
                placeholder={getIdNumberPlaceholder()}
                className={errors.idNumber ? 'border-red-500' : ''}
              />
              {errors.idNumber && (
                <p className="text-sm text-red-600 mt-1">{errors.idNumber}</p>
              )}
            </div>
          )}

          {/* File Uploads */}
          {data.idType && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUploadArea
                type="idFront"
                title="ID Card (Front)"
                description="JPG, PNG, or PDF • Max 5MB"
                required
                accept="image/*,.pdf"
              />

              {requiresBackSide() && (
                <FileUploadArea
                  type="idBack"
                  title="ID Card (Back)"
                  description="JPG, PNG, or PDF • Max 5MB"
                  required
                  accept="image/*,.pdf"
                />
              )}
            </div>
          )}

          {/* Additional Verification */}
          <div className="grid grid-cols-1 gap-6">
            <FileUploadArea
              type="selfieWithId"
              title="Selfie with ID (Optional)"
              description="Hold your ID next to your face • For faster verification • JPG or PNG • Max 2MB"
              accept="image/*"
            />
          </div>

          {/* Guidelines */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Photo Guidelines for Best Results:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Ensure all text on your ID is clearly visible and readable</li>
              <li>• Use good lighting and avoid shadows or glare</li>
              <li>• Take photos straight-on, not at an angle</li>
              <li>• Make sure the entire ID fits within the frame</li>
              <li>• For selfie with ID: Hold ID close to your face, both should be clearly visible</li>
            </ul>
          </div>

          {/* Verification Timeline */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-sm font-medium text-green-900 mb-2">Verification Timeline:</h4>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• <strong>Students & Parents:</strong> Usually verified within 2-4 hours</li>
              <li>• <strong>Teachers:</strong> Manual review required, 24-48 hours</li>
              <li>• <strong>Spoken English Students:</strong> Usually verified within 2-4 hours</li>
              <li>• You'll receive an email notification once verification is complete</li>
            </ul>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={onNext}>
              Continue to Terms & Consent
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}