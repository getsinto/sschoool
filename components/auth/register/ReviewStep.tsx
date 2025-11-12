'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit, Check, Loader2, User, Mail, Phone, MapPin, FileText, Shield } from 'lucide-react'
import { RegistrationData } from '@/app/(auth)/register/page'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

interface ReviewStepProps {
  data: RegistrationData
  onPrev: () => void
  onEdit: (step: number) => void
  setIsLoading: (loading: boolean) => void
}

export default function ReviewStep({ data, onPrev, onEdit, setIsLoading }: ReviewStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setIsLoading(true)

    try {
      // Prepare user metadata
      const metadata = {
        full_name: data.firstName,
        last_name: data.lastName,
        role: data.userType === 'spoken_english' ? 'student' : data.userType,
        mobile: data.mobile,
        whatsapp: data.whatsapp,
        date_of_birth: data.dateOfBirth,
        gender: data.gender,
        country: data.country,
        state: data.state,
        city: data.city,
        address: data.address,
        postal_code: data.postalCode,
        id_card_type: data.idCardType,
        // Role-specific data
        ...(data.userType === 'student' || data.userType === 'spoken_english' ? {
          student_type: data.userType === 'spoken_english' ? 'spoken_english' : 'online_school',
          previous_school: data.previousSchool,
          grade_level: data.gradeLevel,
          academic_year: data.academicYear,
          english_level: data.englishLevel,
          purpose: data.purpose,
          learning_schedule: data.learningSchedule,
        } : {}),
        ...(data.userType === 'teacher' ? {
          qualifications: data.qualifications,
          field_of_study: data.fieldOfStudy,
          experience_years: data.experienceYears,
          subjects: data.subjects,
          bio: data.bio,
        } : {}),
        ...(data.userType === 'parent' ? {
          relationship: data.relationship,
          occupation: data.occupation,
        } : {}),
      }

      // Sign up user
      const { data: authData, error } = await signUp(data.email, data.password, metadata)

      if (error) {
        throw error
      }

      // If successful, upload files and create profile
      if (authData?.user) {
        // Here you would typically upload the files to Supabase Storage
        // and then call your registration API to create the full profile
        
        // For now, we'll just redirect to a success page
        localStorage.removeItem('registrationDraft')
        router.push('/auth/verify-email?email=' + encodeURIComponent(data.email))
      }
    } catch (error: any) {
      console.error('Registration error:', error)
      // Error is handled by the useAuth hook
    } finally {
      setIsSubmitting(false)
      setIsLoading(false)
    }
  }

  const formatUserType = (type: string) => {
    switch (type) {
      case 'student':
        return 'Student'
      case 'teacher':
        return 'Teacher'
      case 'parent':
        return 'Parent'
      case 'spoken_english':
        return 'Spoken English Student'
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Review Your Information</h2>
        <p className="text-gray-600">
          Please review all information before submitting your registration
        </p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(2)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">User Type</p>
              <Badge variant="secondary">{formatUserType(data.userType)}</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-medium">{data.firstName} {data.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{data.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Mobile</p>
              <p className="font-medium">{data.mobile}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date of Birth</p>
              <p className="font-medium">{new Date(data.dateOfBirth).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gender</p>
              <p className="font-medium">{data.gender}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Address</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(3)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="font-medium">{data.address}</p>
          <p className="text-gray-600">
            {data.city}, {data.state} {data.postalCode}
          </p>
          <p className="text-gray-600">{data.country}</p>
        </CardContent>
      </Card>

      {/* Category-specific Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">
              {data.userType === 'teacher' ? 'Teaching Information' : 
               data.userType === 'parent' ? 'Parent Information' : 
               'Academic Information'}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(4)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {(data.userType === 'student' || data.userType === 'spoken_english') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Grade Level</p>
                <p className="font-medium">{data.gradeLevel}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">English Level</p>
                <p className="font-medium">{data.englishLevel}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Learning Purpose</p>
                <p className="font-medium">{data.purpose}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Preferred Schedule</p>
                <p className="font-medium">{data.learningSchedule}</p>
              </div>
            </div>
          )}

          {data.userType === 'teacher' && (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Qualifications</p>
                <p className="font-medium">{data.qualifications}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Field of Study</p>
                  <p className="font-medium">{data.fieldOfStudy}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="font-medium">{data.experienceYears} years</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Subjects</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {data.subjects?.map((subject) => (
                    <Badge key={subject} variant="outline">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {data.userType === 'parent' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Relationship</p>
                <p className="font-medium">{data.relationship}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Occupation</p>
                <p className="font-medium">{data.occupation}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Documents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Verification Documents</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(5)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">ID Card Type</p>
            <p className="font-medium">{data.idCardType}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">ID Document</p>
              <div className="flex items-center space-x-2 mt-1">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Uploaded</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Profile Picture</p>
              <div className="flex items-center space-x-2 mt-1">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Uploaded</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms Acceptance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legal Agreements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center space-x-2">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm">Terms and Conditions accepted</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm">Privacy Policy accepted</span>
          </div>
          <div className="flex items-center space-x-2">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm">GDPR compliance accepted</span>
          </div>
          {data.acceptCOPPA && (
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-sm">COPPA compliance accepted</span>
            </div>
          )}
          {data.marketingConsent && (
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Marketing communications opted in</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Next Steps Information */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-green-900 mb-2">What happens next?</h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>1. You'll receive an email verification link</li>
          <li>2. Your documents will be reviewed within 24-48 hours</li>
          {data.userType === 'teacher' && (
            <li>3. Admin approval is required before accessing teaching features</li>
          )}
          <li>{data.userType === 'teacher' ? '4' : '3'}. You'll receive a welcome email with next steps</li>
          <li>{data.userType === 'teacher' ? '5' : '4'}. Start exploring courses and features!</li>
        </ul>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onPrev}>
          Previous
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-8"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </div>
    </div>
  )
}