'use client'

import { useState, useEffect } from 'react'
import { PersonalInfo, ValidationErrors } from '@/types/registration'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react'
import { getPasswordStrength, calculateAge } from '@/lib/registration/validation'

interface PersonalInfoFormProps {
  data: Partial<PersonalInfo>
  errors: ValidationErrors
  onChange: (data: Partial<PersonalInfo>) => void
  onNext: () => void
  onBack: () => void
  checkEmailAvailability: (email: string) => Promise<boolean>
}

export function PersonalInfoForm({ 
  data, 
  errors, 
  onChange, 
  onNext, 
  onBack,
  checkEmailAvailability 
}: PersonalInfoFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null)
  const [emailChecking, setEmailChecking] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak')

  // Check email availability with debounce
  useEffect(() => {
    if (data.email && data.email.includes('@')) {
      setEmailChecking(true)
      const timer = setTimeout(async () => {
        try {
          const available = await checkEmailAvailability(data.email!)
          setEmailAvailable(available)
        } catch (error) {
          setEmailAvailable(null)
        } finally {
          setEmailChecking(false)
        }
      }, 500)

      return () => clearTimeout(timer)
    }
    return undefined
  }, [data.email, checkEmailAvailability])

  // Update password strength
  useEffect(() => {
    if (data.password) {
      setPasswordStrength(getPasswordStrength(data.password))
    }
  }, [data.password])

  // Calculate age and show COPPA warning
  const age = data.dateOfBirth ? calculateAge(data.dateOfBirth) : null
  const showCoppaWarning = age !== null && age < 13

  const handleSameAsMobile = (checked: boolean) => {
    onChange({
      ...data,
      sameAsMobile: checked,
      whatsappNumber: checked ? data.mobileNumber : ''
    })
  }

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'strong': return 'bg-green-500'
    }
  }

  const getPasswordStrengthWidth = () => {
    switch (passwordStrength) {
      case 'weak': return '33%'
      case 'medium': return '66%'
      case 'strong': return '100%'
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <p className="text-sm text-gray-600">
            Please provide your personal details to create your account
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={data.firstName || ''}
                onChange={(e) => onChange({ ...data, firstName: e.target.value })}
                placeholder="Enter your first name"
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={data.lastName || ''}
                onChange={(e) => onChange({ ...data, lastName: e.target.value })}
                placeholder="Enter your last name"
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={data.email || ''}
                onChange={(e) => onChange({ ...data, email: e.target.value })}
                placeholder="your.email@example.com"
                className={errors.email ? 'border-red-500' : emailAvailable === false ? 'border-red-500' : emailAvailable === true ? 'border-green-500' : ''}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {emailChecking && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                )}
                {!emailChecking && emailAvailable === true && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
                {!emailChecking && emailAvailable === false && (
                  <X className="h-4 w-4 text-red-600" />
                )}
              </div>
            </div>
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email}</p>
            )}
            {emailAvailable === false && (
              <p className="text-sm text-red-600 mt-1">This email is already registered</p>
            )}
            {emailAvailable === true && (
              <p className="text-sm text-green-600 mt-1">Email is available</p>
            )}
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={data.password || ''}
                  onChange={(e) => onChange({ ...data, password: e.target.value })}
                  placeholder="Create a strong password"
                  className={errors.password ? 'border-red-500' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {data.password && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Password Strength</span>
                    <span className="capitalize">{passwordStrength}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                      style={{ width: getPasswordStrengthWidth() }}
                    />
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">{errors.password}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={data.confirmPassword || ''}
                  onChange={(e) => onChange({ ...data, confirmPassword: e.target.value })}
                  placeholder="Re-enter your password"
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Phone Numbers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mobileNumber">Mobile Number *</Label>
              <Input
                id="mobileNumber"
                type="tel"
                value={data.mobileNumber || ''}
                onChange={(e) => onChange({ ...data, mobileNumber: e.target.value })}
                placeholder="Enter mobile number"
                className={errors.mobileNumber ? 'border-red-500' : ''}
              />
              {errors.mobileNumber && (
                <p className="text-sm text-red-600 mt-1">{errors.mobileNumber}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
              <Input
                id="whatsappNumber"
                type="tel"
                value={data.whatsappNumber || ''}
                onChange={(e) => onChange({ ...data, whatsappNumber: e.target.value })}
                placeholder="Enter WhatsApp number"
                disabled={data.sameAsMobile}
                className={data.sameAsMobile ? 'bg-gray-100' : ''}
              />
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id="sameAsMobile"
                  checked={data.sameAsMobile || false}
                  onCheckedChange={handleSameAsMobile}
                />
                <Label htmlFor="sameAsMobile" className="text-sm">
                  Same as mobile number
                </Label>
              </div>
            </div>
          </div>

          {/* Date of Birth and Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={data.dateOfBirth || ''}
                onChange={(e) => onChange({ ...data, dateOfBirth: e.target.value })}
                className={errors.dateOfBirth ? 'border-red-500' : ''}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-red-600 mt-1">{errors.dateOfBirth}</p>
              )}
              {showCoppaWarning && (
                <div className="flex items-center space-x-2 mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    Parental consent will be required for users under 13
                  </p>
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="gender">Gender *</Label>
              <Select 
                value={data.gender || ''} 
                onValueChange={(value) => onChange({ ...data, gender: value as PersonalInfo['gender'] })}
              >
                <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-red-600 mt-1">{errors.gender}</p>
              )}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={onNext}>
              Continue to Address
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}