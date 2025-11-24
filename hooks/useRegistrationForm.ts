'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  RegistrationData, 
  UserType, 
  RegistrationStep, 
  ValidationErrors,
  StepValidation
} from '@/types/registration'
import { validateStep } from '@/lib/registration/validation'

const STORAGE_KEY = 'registration_draft'

const initialData: RegistrationData = {
  userType: 'student',
  currentStep: 1,
  personalInfo: {},
  addressInfo: {},
  categorySpecific: {},
  idVerification: {},
  consents: {
    emailNotifications: true,
    smsNotifications: false,
    whatsappNotifications: false
  }
}

export function useRegistrationForm() {
  const [data, setData] = useState<RegistrationData>(initialData)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isDraftSaved, setIsDraftSaved] = useState(false)

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY)
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft)
        setData(parsedDraft)
      } catch (error) {
        console.error('Failed to parse saved draft:', error)
      }
    }
  }, [])

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveDraft()
    }, 30000)

    return () => clearInterval(interval)
  }, [data])

  const saveDraft = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      setIsDraftSaved(true)
      setTimeout(() => setIsDraftSaved(false), 2000)
    } catch (error) {
      console.error('Failed to save draft:', error)
    }
  }, [data])

  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const updateUserType = useCallback((userType: UserType) => {
    setData(prev => ({
      ...prev,
      userType,
      categorySpecific: {} // Reset category-specific data when user type changes
    }))
  }, [])

  const updatePersonalInfo = useCallback((personalInfo: Partial<typeof data.personalInfo>) => {
    setData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...personalInfo }
    }))
  }, [])

  const updateAddressInfo = useCallback((addressInfo: Partial<typeof data.addressInfo>) => {
    setData(prev => ({
      ...prev,
      addressInfo: { ...prev.addressInfo, ...addressInfo }
    }))
  }, [])

  const updateCategorySpecific = useCallback((categorySpecific: Partial<typeof data.categorySpecific>) => {
    setData(prev => ({
      ...prev,
      categorySpecific: { ...prev.categorySpecific, ...categorySpecific }
    }))
  }, [])

  const updateIdVerification = useCallback((idVerification: Partial<typeof data.idVerification>) => {
    setData(prev => ({
      ...prev,
      idVerification: { ...prev.idVerification, ...idVerification }
    }))
  }, [])

  const updateConsents = useCallback((consents: Partial<typeof data.consents>) => {
    setData(prev => ({
      ...prev,
      consents: { ...prev.consents, ...consents }
    }))
  }, [])

  const validateCurrentStep = useCallback((): StepValidation => {
    const validation = validateStep(data.currentStep, data)
    setErrors(validation.errors)
    return validation
  }, [data])

  const goToStep = useCallback((step: RegistrationStep) => {
    // Only allow going to completed steps or the next step
    if (step <= data.currentStep + 1) {
      setData(prev => ({ ...prev, currentStep: step }))
      saveDraft()
    }
  }, [data.currentStep, saveDraft])

  const nextStep = useCallback(() => {
    const validation = validateCurrentStep()
    if (validation.isValid && data.currentStep < 7) {
      setData(prev => ({ ...prev, currentStep: (prev.currentStep + 1) as RegistrationStep }))
      saveDraft()
      return true
    }
    return false
  }, [data.currentStep, validateCurrentStep, saveDraft])

  const prevStep = useCallback(() => {
    if (data.currentStep > 1) {
      setData(prev => ({ ...prev, currentStep: (prev.currentStep - 1) as RegistrationStep }))
      saveDraft()
    }
  }, [data.currentStep, saveDraft])

  const submitRegistration = useCallback(async () => {
    setIsLoading(true)
    try {
      // Final validation
      const allStepsValid = [1, 2, 3, 4, 5, 6, 7].every(step => {
        const validation = validateStep(step as RegistrationStep, data)
        return validation.isValid
      })

      if (!allStepsValid) {
        throw new Error('Please complete all required fields')
      }

      // Submit to API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Registration failed')
      }

      const result = await response.json()
      
      // Clear draft on successful submission
      clearDraft()
      
      return result
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [data, clearDraft])

  const checkEmailAvailability = useCallback(async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`)
      const result = await response.json()
      return result.available
    } catch (error) {
      console.error('Email check error:', error)
      return false
    }
  }, [])

  const uploadFile = useCallback(async (file: File, type: 'id_front' | 'id_back' | 'profile_photo' | 'selfie_with_id' | 'resume'): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    // Map type to fileType expected by API
    const fileType = type === 'profile_photo' ? 'photo' : 'document'
    formData.append('fileType', fileType)
    formData.append('userId', data.personalInfo.email || 'temp')

    const response = await fetch('/api/auth/upload-file', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('File upload failed')
    }

    const result = await response.json()
    return result.url
  }, [data.personalInfo.email])

  const getStepTitle = useCallback((step: RegistrationStep): string => {
    const titles = {
      1: 'Choose Your Role',
      2: 'Personal Information', 
      3: 'Address Details',
      4: data.userType === 'student' ? 'Student Information' :
         data.userType === 'teacher' ? 'Teaching Background' :
         data.userType === 'parent' ? 'Parent Information' :
         'Learning Preferences',
      5: 'Identity Verification',
      6: 'Terms & Consent',
      7: 'Review & Submit'
    }
    return titles[step]
  }, [data.userType])

  const getCompletedSteps = useCallback((): number[] => {
    const completed: number[] = []
    for (let step = 1; step <= data.currentStep; step++) {
      const validation = validateStep(step as RegistrationStep, data)
      if (validation.isValid) {
        completed.push(step)
      }
    }
    return completed
  }, [data])

  const isStepAccessible = useCallback((step: RegistrationStep): boolean => {
    return step <= data.currentStep + 1
  }, [data.currentStep])

  const getProgress = useCallback((): number => {
    return Math.round((data.currentStep / 7) * 100)
  }, [data.currentStep])

  return {
    // Data
    data,
    errors,
    isLoading,
    isDraftSaved,
    
    // Actions
    updateUserType,
    updatePersonalInfo,
    updateAddressInfo,
    updateCategorySpecific,
    updateIdVerification,
    updateConsents,
    
    // Navigation
    goToStep,
    nextStep,
    prevStep,
    
    // Validation
    validateCurrentStep,
    
    // Utilities
    saveDraft,
    clearDraft,
    submitRegistration,
    checkEmailAvailability,
    uploadFile,
    
    // Computed
    getStepTitle,
    getCompletedSteps,
    isStepAccessible,
    getProgress
  }
}