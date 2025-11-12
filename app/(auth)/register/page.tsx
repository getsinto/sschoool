'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRegistrationForm } from '@/hooks/useRegistrationForm'
import { StepIndicator } from '@/components/registration/StepIndicator'
import { UserTypeSelector } from '@/components/registration/UserTypeSelector'
import { PersonalInfoForm } from '@/components/registration/PersonalInfoForm'
import { AddressForm } from '@/components/registration/AddressForm'
import { CategorySpecificForm } from '@/components/registration/CategorySpecificForm'
import { IDVerification } from '@/components/registration/IDVerification'
import { TermsConsent } from '@/components/registration/TermsConsent'
import { ReviewSubmit } from '@/components/registration/ReviewSubmit'
import { requiresGdprConsent, requiresCoppaConsent } from '@/lib/registration/validation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Save } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const {
    data,
    errors,
    isLoading,
    isDraftSaved,
    updateUserType,
    updatePersonalInfo,
    updateAddressInfo,
    updateCategorySpecific,
    updateIdVerification,
    updateConsents,
    goToStep,
    nextStep,
    prevStep,
    validateCurrentStep,
    submitRegistration,
    checkEmailAvailability,
    uploadFile,
    getStepTitle,
    getCompletedSteps,
    isStepAccessible,
    getProgress
  } = useRegistrationForm()

  const [showDraftBanner, setShowDraftBanner] = useState(false)

  // Check for existing draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('registration_draft')
    if (savedDraft && data.currentStep > 1) {
      setShowDraftBanner(true)
    }
  }, [data.currentStep])

  const handleNext = () => {
    const validation = validateCurrentStep()
    if (validation.isValid) {
      nextStep()
    }
  }

  const handleSubmit = async () => {
    try {
      await submitRegistration()
      router.push('/auth/register/success')
    } catch (error) {
      console.error('Registration failed:', error)
    }
  }

  const handleEditStep = (step: number) => {
    goToStep(step as any)
  }

  const requiresGdpr = data.addressInfo.country ? requiresGdprConsent(data.addressInfo.country) : false
  const requiresCoppa = data.personalInfo.dateOfBirth ? requiresCoppaConsent(data.personalInfo.dateOfBirth) : false

  const renderCurrentStep = () => {
    switch (data.currentStep) {
      case 1:
        return (
          <UserTypeSelector
            selectedType={data.userType}
            onSelect={updateUserType}
            onNext={handleNext}
          />
        )
      case 2:
        return (
          <PersonalInfoForm
            data={data.personalInfo}
            errors={errors}
            onChange={updatePersonalInfo}
            onNext={handleNext}
            onBack={prevStep}
            checkEmailAvailability={checkEmailAvailability}
          />
        )
      case 3:
        return (
          <AddressForm
            data={data.addressInfo}
            errors={errors}
            onChange={updateAddressInfo}
            onNext={handleNext}
            onBack={prevStep}
          />
        )
      case 4:
        return (
          <CategorySpecificForm
            userType={data.userType}
            data={data.categorySpecific}
            errors={errors}
            onChange={updateCategorySpecific}
            onNext={handleNext}
            onBack={prevStep}
            uploadFile={uploadFile}
          />
        )
      case 5:
        return (
          <IDVerification
            data={data.idVerification}
            errors={errors}
            onChange={updateIdVerification}
            onNext={handleNext}
            onBack={prevStep}
            uploadFile={uploadFile}
          />
        )
      case 6:
        return (
          <TermsConsent
            data={data.consents}
            errors={errors}
            onChange={updateConsents}
            onNext={handleNext}
            onBack={prevStep}
            requiresGdpr={requiresGdpr}
            requiresCoppa={requiresCoppa}
          />
        )
      case 7:
        return (
          <ReviewSubmit
            data={data}
            onEdit={handleEditStep}
            onSubmit={handleSubmit}
            onBack={prevStep}
            isLoading={isLoading}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Your Account
            </h1>
            <p className="text-gray-600">
              Join our online education platform and start your learning journey
            </p>
            <div className="mt-4">
              <div className="text-sm text-gray-500">
                Progress: {getProgress()}% Complete
              </div>
            </div>
          </div>

          {/* Draft Saved Banner */}
          {showDraftBanner && (
            <div className="mb-6">
              <Alert>
                <Save className="h-4 w-4" />
                <AlertDescription>
                  We found a saved draft of your registration. You can continue where you left off.
                  <button 
                    onClick={() => setShowDraftBanner(false)}
                    className="ml-2 text-blue-600 hover:underline"
                  >
                    Dismiss
                  </button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Draft Auto-Save Indicator */}
          {isDraftSaved && (
            <div className="mb-4">
              <div className="text-center">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  <Save className="h-3 w-3 mr-1" />
                  Draft saved automatically
                </span>
              </div>
            </div>
          )}

          {/* Step Indicator */}
          <StepIndicator
            currentStep={data.currentStep}
            completedSteps={getCompletedSteps()}
            userType={data.userType}
            onStepClick={goToStep}
            isStepAccessible={isStepAccessible}
          />

          {/* Error Display */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-6">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please correct the errors below before continuing.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Form Content */}
          <div className="mb-8">
            {renderCurrentStep()}
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-600 hover:underline">
                Sign in here
              </Link>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Your registration progress is automatically saved every 30 seconds
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}