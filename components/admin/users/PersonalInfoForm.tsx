'use client'

import { useState, useEffect } from 'react'
import { PersonalInfo } from './CreateUserModal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

interface PersonalInfoFormProps {
  data: PersonalInfo
  onChange: (data: PersonalInfo) => void
}

export default function PersonalInfoForm({ data, onChange }: PersonalInfoFormProps) {
  const [emailValidation, setEmailValidation] = useState<{
    checking: boolean
    available: boolean | null
    message: string
  }>({ checking: false, available: null, message: '' })

  const [emailDebounce, setEmailDebounce] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Cleanup debounce on unmount
    return () => {
      if (emailDebounce) clearTimeout(emailDebounce)
    }
  }, [emailDebounce])

  const handleEmailChange = (email: string) => {
    onChange({ ...data, email })

    // Clear previous debounce
    if (emailDebounce) clearTimeout(emailDebounce)

    // Reset validation state
    setEmailValidation({ checking: false, available: null, message: '' })

    // Only validate if email looks valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return
    }

    // Set checking state
    setEmailValidation({ checking: true, available: null, message: 'Checking availability...' })

    // Debounce the API call
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch('/api/admin/users/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })

        const result = await response.json()

        if (response.ok) {
          setEmailValidation({
            checking: false,
            available: result.available,
            message: result.message,
          })
        } else {
          setEmailValidation({
            checking: false,
            available: null,
            message: 'Failed to check email',
          })
        }
      } catch (error) {
        setEmailValidation({
          checking: false,
          available: null,
          message: 'Error checking email',
        })
      }
    }, 500)

    setEmailDebounce(timeout)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
        <p className="text-sm text-gray-600 mt-1">
          Enter the user's basic personal information
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <div className="md:col-span-2">
          <Label htmlFor="email">
            Email Address <span className="text-red-500">*</span>
          </Label>
          <div className="relative mt-1">
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="user@example.com"
              required
            />
            {emailValidation.checking && (
              <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-gray-400" />
            )}
            {!emailValidation.checking && emailValidation.available === true && (
              <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-600" />
            )}
            {!emailValidation.checking && emailValidation.available === false && (
              <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-600" />
            )}
          </div>
          {emailValidation.message && (
            <p
              className={`text-sm mt-1 ${
                emailValidation.available === true
                  ? 'text-green-600'
                  : emailValidation.available === false
                  ? 'text-red-600'
                  : 'text-gray-600'
              }`}
            >
              {emailValidation.message}
            </p>
          )}
        </div>

        {/* Full Name */}
        <div className="md:col-span-2">
          <Label htmlFor="fullName">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            value={data.fullName}
            onChange={(e) => onChange({ ...data, fullName: e.target.value })}
            placeholder="John Doe"
            required
            className="mt-1"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={data.dateOfBirth || ''}
            onChange={(e) => onChange({ ...data, dateOfBirth: e.target.value })}
            className="mt-1"
          />
        </div>

        {/* Gender */}
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={data.gender || ''}
            onValueChange={(value) =>
              onChange({ ...data, gender: value as PersonalInfo['gender'] })
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mobile */}
        <div>
          <Label htmlFor="mobile">Mobile Number</Label>
          <Input
            id="mobile"
            type="tel"
            value={data.mobile || ''}
            onChange={(e) => onChange({ ...data, mobile: e.target.value })}
            placeholder="+1234567890"
            className="mt-1"
          />
        </div>

        {/* WhatsApp */}
        <div>
          <Label htmlFor="whatsapp">WhatsApp Number</Label>
          <Input
            id="whatsapp"
            type="tel"
            value={data.whatsapp || ''}
            onChange={(e) => onChange({ ...data, whatsapp: e.target.value })}
            placeholder="+1234567890"
            className="mt-1"
          />
        </div>

        {/* Country */}
        <div>
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={data.country || ''}
            onChange={(e) => onChange({ ...data, country: e.target.value })}
            placeholder="United States"
            className="mt-1"
          />
        </div>

        {/* State */}
        <div>
          <Label htmlFor="state">State/Province</Label>
          <Input
            id="state"
            value={data.state || ''}
            onChange={(e) => onChange({ ...data, state: e.target.value })}
            placeholder="California"
            className="mt-1"
          />
        </div>

        {/* City */}
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={data.city || ''}
            onChange={(e) => onChange({ ...data, city: e.target.value })}
            placeholder="Los Angeles"
            className="mt-1"
          />
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={data.address || ''}
            onChange={(e) => onChange({ ...data, address: e.target.value })}
            placeholder="123 Main Street"
            className="mt-1"
          />
        </div>

        {/* Postal Code */}
        <div>
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input
            id="postalCode"
            value={data.postalCode || ''}
            onChange={(e) => onChange({ ...data, postalCode: e.target.value })}
            placeholder="90001"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  )
}
