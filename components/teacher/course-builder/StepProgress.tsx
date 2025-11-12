'use client'

import { Check } from 'lucide-react'

interface Step {
  id: number
  name: string
  description: string
}

interface StepProgressProps {
  steps: Step[]
  currentStep: number
}

export function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep
          const isCurrent = step.id === currentStep
          const isUpcoming = step.id > currentStep

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                    transition-all duration-200
                    ${isCompleted ? 'bg-green-600 text-white' : ''}
                    ${isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100' : ''}
                    ${isUpcoming ? 'bg-gray-200 text-gray-600' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className={`
                      text-sm font-medium
                      ${isCurrent ? 'text-blue-600' : 'text-gray-600'}
                    `}
                  >
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 hidden md:block">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-1 mx-4 transition-all duration-200
                    ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}
                  `}
                  style={{ marginTop: '-2.5rem' }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
