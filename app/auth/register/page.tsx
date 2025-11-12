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
import SharedLayout from '@/components/layout/SharedLayout'

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
    <SharedLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden pt-20">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/20 rounded-full blur-xl animate-pulse" />
          <div className="absolute top-40 right-32 w-24 h-24 bg-purple-200/20 rounded-full blur-lg animate-bounce" />
          <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-indigo-200/15 rounded-full blur-2xl" />
          <div className="absolute bottom-20 right-20 w-28 h-28 bg-pink-200/20 rounded-full blur-xl animate-pulse" />
        </div>

        <div className="relative z-10 min-h-screen py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Enhanced Header */}
              <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl mb-6 shadow-xl">
              <span className="text-white font-bold text-3xl">SH</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Join St Haroon
              <span className="block text-3xl sm:text-4xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Online School
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Start your educational journey with world-class online learning
            </p>
            <div className="mt-6 inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg">
              <div className="text-sm font-medium text-gray-700">
                Progress: {getProgress()}% Complete
              </div>
              <div className="ml-3 w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
                  style={{ width: `${getProgress()}%` }}
                />
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
      </div>
    </SharedLayout>
  )
}