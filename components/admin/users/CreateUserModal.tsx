'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import UserTypeSelector from './UserTypeSelector'
import PersonalInfoForm from './PersonalInfoForm'
import RoleSpecificForm from './RoleSpecificForm'
import AccountSettingsForm from './AccountSettingsForm'
import ReviewStep from './ReviewStep'
import PasswordDisplay from './PasswordDisplay'

export type UserType = 'student' | 'teacher' | 'parent' | 'admin'

export interface PersonalInfo {
  email: string
  fullName: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  mobile?: string
  whatsapp?: string
  country?: string
  state?: string
  city?: string
  address?: string
  postalCode?: string
}

export interface RoleSpecificData {
  // Student fields
  studentType?: 'online_school' | 'spoken_english'
  gradeLevel?: string
  previousSchool?: string
  academicYear?: string
  englishLevel?: string
  purpose?: string
  learningSchedule?: string
  
  // Teacher fields
  qualifications?: string
  fieldOfStudy?: string
  experienceYears?: number
  subjects?: string[]
  bio?: string
  preApproved?: boolean
  
  // Parent fields
  relationship?: string
  occupation?: string
  linkedStudents?: string[]
}

export interface AccountSettings {
  accountStatus: 'active' | 'inactive' | 'suspended'
  bypassVerification: boolean
  sendWelcomeEmail: boolean
  requirePasswordChange: boolean
}

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const STEPS = [
  { id: 1, name: 'User Type', description: 'Select user type' },
  { id: 2, name: 'Personal Info', description: 'Basic information' },
  { id: 3, name: 'Role Details', description: 'Role-specific fields' },
  { id: 4, name: 'Account Settings', description: 'Configure account' },
  { id: 5, name: 'Review', description: 'Review and confirm' },
]

export default function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [userType, setUserType] = useState<UserType | null>(null)
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    email: '',
    fullName: '',
  })
  const [roleSpecificData, setRoleSpecificData] = useState<RoleSpecificData>({})
  const [accountSettings, setAccountSettings] = useState<AccountSettings>({
    accountStatus: 'active',
    bypassVerification: false,
    sendWelcomeEmail: true,
    requirePasswordChange: true,
  })
  const [createdUser, setCreatedUser] = useState<any>(null)
  const [temporaryPassword, setTemporaryPassword] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>('')

  const progress = (currentStep / STEPS.length) * 100

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
      setError('')
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError('')
    }
  }

  const handleClose = () => {
    // Reset all state
    setCurrentStep(1)
    setUserType(null)
    setPersonalInfo({ email: '', fullName: '' })
    setRoleSpecificData({})
    setAccountSettings({
      accountStatus: 'active',
      bypassVerification: false,
      sendWelcomeEmail: true,
      requirePasswordChange: true,
    })
    setCreatedUser(null)
    setTemporaryPassword('')
    setError('')
    onClose()
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType,
          personalInfo,
          roleSpecificData,
          accountSettings,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user')
      }

      setCreatedUser(data.user)
      setTemporaryPassword(data.temporaryPassword)
      setCurrentStep(6) // Move to password display step
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateAnother = () => {
    setCurrentStep(1)
    setUserType(null)
    setPersonalInfo({ email: '', fullName: '' })
    setRoleSpecificData({})
    setAccountSettings({
      accountStatus: 'active',
      bypassVerification: false,
      sendWelcomeEmail: true,
      requirePasswordChange: true,
    })
    setCreatedUser(null)
    setTemporaryPassword('')
    setError('')
  }

  const handleFinish = () => {
    handleClose()
    onSuccess?.()
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return userType !== null
      case 2:
        return personalInfo.email && personalInfo.fullName
      case 3:
        // Role-specific validation
        if (userType === 'student') {
          return roleSpecificData.studentType !== undefined
        }
        return true
      case 4:
        return true
      case 5:
        return true
      default:
        return false
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {currentStep === 6 ? 'User Created Successfully' : 'Create New User'}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {currentStep <= 5 && (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Step {currentStep} of {STEPS.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex flex-col items-center ${
                      index < STEPS.length - 1 ? 'flex-1' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep === step.id
                          ? 'bg-blue-600 text-white'
                          : currentStep > step.id
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {step.id}
                    </div>
                    <span className="text-xs mt-1 text-center hidden sm:block">
                      {step.name}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 ${
                        currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="py-6">
          {currentStep === 1 && (
            <UserTypeSelector
              selectedType={userType}
              onSelect={setUserType}
            />
          )}

          {currentStep === 2 && (
            <PersonalInfoForm
              data={personalInfo}
              onChange={setPersonalInfo}
            />
          )}

          {currentStep === 3 && userType && (
            <RoleSpecificForm
              userType={userType}
              data={roleSpecificData}
              onChange={setRoleSpecificData}
            />
          )}

          {currentStep === 4 && (
            <AccountSettingsForm
              data={accountSettings}
              onChange={setAccountSettings}
            />
          )}

          {currentStep === 5 && (
            <ReviewStep
              userType={userType!}
              personalInfo={personalInfo}
              roleSpecificData={roleSpecificData}
              accountSettings={accountSettings}
              onEdit={(step) => setCurrentStep(step)}
            />
          )}

          {currentStep === 6 && (
            <PasswordDisplay
              user={createdUser}
              password={temporaryPassword}
              onCreateAnother={handleCreateAnother}
              onFinish={handleFinish}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        {currentStep <= 5 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < 5 ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
              >
                {isSubmitting ? 'Creating User...' : 'Create User'}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
