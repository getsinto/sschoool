'use client'

import { Check } from 'lucide-react'
import { RegistrationStep, UserType } from '@/types/registration'

interface StepIndicatorProps {
  currentStep: RegistrationStep
  completedSteps: number[]
  userType: UserType
  onStepClick: (step: RegistrationStep) => void
  isStepAccessible: (step: RegistrationStep) => boolean
}

const getStepTitle = (step: RegistrationStep, userType: UserType): string => {
  const titles = {
    1: 'Choose Role',
    2: 'Personal Info',
    3: 'Address',
    4: userType === 'student' ? 'Student Info' :
       userType === 'teacher' ? 'Teaching Info' :
       userType === 'parent' ? 'Parent Info' :
       'Learning Prefs',
    5: 'ID Verification',
    6: 'Terms & Consent',
    7: 'Review & Submit'
  }
  return titles[step]
}

export function StepIndicator({ 
  currentStep, 
  completedSteps, 
  userType, 
  onStepClick, 
  isStepAccessible 
}: StepIndicatorProps) {
  const steps = [1, 2, 3, 4, 5, 6, 7] as const

  return (
    <div className="w-full mb-8">
      {/* Progress Bar */}
      <div className="relative mb-4">
        <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200">
          <div 
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 6) * 100}%` }}
          />
        </div>
        
        {/* Step Circles */}
        <div className="relative flex justify-between">
          {steps.map((step) => {
            const isCompleted = completedSteps.includes(step)
            const isCurrent = step === currentStep
            const isAccessible = isStepAccessible(step)
            
            return (
              <button
                key={step}
                onClick={() => isAccessible ? onStepClick(step) : null}
                disabled={!isAccessible}
                className={`
                  relative flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                  transition-all duration-200 z-10
                  ${isCompleted 
                    ? 'bg-green-600 text-white' 
                    : isCurrent 
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                      : isAccessible
                        ? 'bg-white text-gray-600 border-2 border-gray-300 hover:border-blue-300'
                        : 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed'
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step
                )}
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Step Labels */}
      <div className="flex justify-between">
        {steps.map((step) => (
          <div key={step} className="flex flex-col items-center">
            <span className={`
              text-xs font-medium text-center max-w-16
              ${step === currentStep 
                ? 'text-blue-600' 
                : completedSteps.includes(step)
                  ? 'text-green-600'
                  : 'text-gray-500'
              }
            `}>
              {getStepTitle(step, userType)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}