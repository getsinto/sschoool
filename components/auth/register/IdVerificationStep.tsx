'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, X, FileText, Image } from 'lucide-react'
import { RegistrationData } from '@/app/(auth)/register/page'

interface IdVerificationStepProps {
  data: RegistrationData
  updateData: (updates: Partial<RegistrationData>) => void
  onNext: () => void
  onPrev: () => void
}

const ID_CARD_TYPES = [
  'National ID Card',
  'Passport',
  'Driver\'s License',
  'Student ID',
  'Birth Certificate',
  'Other Government ID'
]

export default function IdVerificationStep({ data, updateData, onNext, onPrev }: IdVerificationStepProps) {
  const [idCardFile, setIdCardFile] = useState<File | null>(data.idCardFile || null)
  const [profilePicFile, setProfilePicFile] = useState<File | null>(data.profilePicFile || null)
  const [idCardType, setIdCardType] = useState(data.idCardType || '')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const idCardInputRef = useRef<HTMLInputElement>(null)
  const profilePicInputRef = useRef<HTMLInputElement>(null)

  const handleIdCardUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, idCard: 'File size must be less than 5MB' }))
        return
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, idCard: 'Only JPEG, PNG, and PDF files are allowed' }))
        return
      }

      setIdCardFile(file)
      setErrors(prev => ({ ...prev, idCard: '' }))
    }
  }

  const handleProfilePicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, profilePic: 'File size must be less than 2MB' }))
        return
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, profilePic: 'Only JPEG and PNG files are allowed' }))
        return
      }

      setProfilePicFile(file)
      setErrors(prev => ({ ...prev, profilePic: '' }))
    }
  }

  const removeIdCard = () => {
    setIdCardFile(null)
    if (idCardInputRef.current) {
      idCardInputRef.current.value = ''
    }
  }

  const removeProfilePic = () => {
    setProfilePicFile(null)
    if (profilePicInputRef.current) {
      profilePicInputRef.current.value = ''
    }
  }

  const handleNext = () => {
    const newErrors: { [key: string]: string } = {}

    if (!idCardType) {
      newErrors.idCardType = 'Please select an ID card type'
    }

    if (!idCardFile) {
      newErrors.idCard = 'Please upload your ID card'
    }

    if (!profilePicFile) {
      newErrors.profilePic = 'Please upload your profile picture'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    updateData({
      idCardType,
      idCardFile,
      profilePicFile,
    })
    onNext()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Identity Verification</h2>
        <p className="text-gray-600">
          Upload your identification documents for account verification
        </p>
      </div>

      {/* ID Card Type Selection */}
      <div className="space-y-2">
        <Label>ID Card Type *</Label>
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
        {errors.idCardType && (
          <p className="text-sm text-red-600">{errors.idCardType}</p>
        )}
      </div>

      {/* ID Card Upload */}
      <div className="space-y-2">
        <Label>ID Card Document *</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          {idCardFile ? (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                {idCardFile.type === 'application/pdf' ? (
                  <FileText className="h-8 w-8 text-red-500" />
                ) : (
                  <Image className="h-8 w-8 text-blue-500" />
                )}
                <div>
                  <p className="text-sm font-medium">{idCardFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(idCardFile.size)}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeIdCard}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => idCardInputRef.current?.click()}
                >
                  Choose File
                </Button>
                <p className="mt-2 text-sm text-gray-500">
                  Upload a clear photo of your ID card (JPEG, PNG, or PDF, max 5MB)
                </p>
              </div>
            </div>
          )}
          <input
            ref={idCardInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg,application/pdf"
            onChange={handleIdCardUpload}
            className="hidden"
          />
        </div>
        {errors.idCard && (
          <p className="text-sm text-red-600">{errors.idCard}</p>
        )}
      </div>

      {/* Profile Picture Upload */}
      <div className="space-y-2">
        <Label>Profile Picture *</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
          {profilePicFile ? (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                  <img
                    src={URL.createObjectURL(profilePicFile)}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">{profilePicFile.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(profilePicFile.size)}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeProfilePic}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                <Image className="h-6 w-6 text-gray-400" />
              </div>
              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => profilePicInputRef.current?.click()}
                >
                  Choose Photo
                </Button>
                <p className="mt-2 text-sm text-gray-500">
                  Upload a clear photo of yourself (JPEG or PNG, max 2MB)
                </p>
              </div>
            </div>
          )}
          <input
            ref={profilePicInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleProfilePicUpload}
            className="hidden"
          />
        </div>
        {errors.profilePic && (
          <p className="text-sm text-red-600">{errors.profilePic}</p>
        )}
      </div>

      {/* Information Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600 mt-0.5">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Verification Process
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Your documents will be reviewed within 24-48 hours</li>
              <li>• All information is kept secure and confidential</li>
              <li>• You'll receive an email notification once verified</li>
              <li>• {data.userType === 'teacher' ? 'Teachers require admin approval before accessing the platform' : 'Students can access courses immediately after email verification'}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onPrev}>
          Previous
        </Button>
        <Button type="button" onClick={handleNext}>
          Continue
        </Button>
      </div>
    </div>
  )
}