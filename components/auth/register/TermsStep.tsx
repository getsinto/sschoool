'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RegistrationData } from '@/app/(auth)/register/page'

interface TermsStepProps {
  data: RegistrationData
  updateData: (updates: Partial<RegistrationData>) => void
  onNext: () => void
  onPrev: () => void
}

export default function TermsStep({ data, updateData, onNext, onPrev }: TermsStepProps) {
  const [acceptTerms, setAcceptTerms] = useState(data.acceptTerms)
  const [acceptPrivacy, setAcceptPrivacy] = useState(data.acceptPrivacy)
  const [acceptGDPR, setAcceptGDPR] = useState(data.acceptGDPR)
  const [acceptCOPPA, setAcceptCOPPA] = useState(data.acceptCOPPA)
  const [marketingConsent, setMarketingConsent] = useState(data.marketingConsent)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Check if user is under 13 based on date of birth
  const isUnder13 = data.dateOfBirth ? 
    new Date().getFullYear() - new Date(data.dateOfBirth).getFullYear() < 13 : false

  const handleNext = () => {
    const newErrors: { [key: string]: string } = {}

    if (!acceptTerms) {
      newErrors.terms = 'You must accept the Terms and Conditions to continue'
    }

    if (!acceptPrivacy) {
      newErrors.privacy = 'You must accept the Privacy Policy to continue'
    }

    if (!acceptGDPR) {
      newErrors.gdpr = 'You must accept the GDPR compliance to continue'
    }

    if (isUnder13 && !acceptCOPPA) {
      newErrors.coppa = 'COPPA compliance is required for users under 13'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    updateData({
      acceptTerms,
      acceptPrivacy,
      acceptGDPR,
      acceptCOPPA,
      marketingConsent,
    })
    onNext()
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">Terms & Conditions</h2>
        <p className="text-gray-600">
          Please review and accept our terms to complete your registration
        </p>
      </div>

      {/* Terms and Conditions */}
      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={setAcceptTerms}
            />
            <div className="flex-1">
              <Label htmlFor="terms" className="text-sm font-medium">
                I accept the{' '}
                <a
                  href="/terms"
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  Terms and Conditions
                </a>{' '}
                *
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                By accepting, you agree to our platform rules, course policies, and user guidelines.
              </p>
            </div>
          </div>
          {errors.terms && (
            <p className="text-sm text-red-600 mt-2">{errors.terms}</p>
          )}
        </div>

        {/* Privacy Policy */}
        <div className="border rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="privacy"
              checked={acceptPrivacy}
              onCheckedChange={setAcceptPrivacy}
            />
            <div className="flex-1">
              <Label htmlFor="privacy" className="text-sm font-medium">
                I accept the{' '}
                <a
                  href="/privacy"
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  Privacy Policy
                </a>{' '}
                *
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                We collect and process your data as described in our privacy policy to provide our services.
              </p>
            </div>
          </div>
          {errors.privacy && (
            <p className="text-sm text-red-600 mt-2">{errors.privacy}</p>
          )}
        </div>

        {/* GDPR Compliance */}
        <div className="border rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="gdpr"
              checked={acceptGDPR}
              onCheckedChange={setAcceptGDPR}
            />
            <div className="flex-1">
              <Label htmlFor="gdpr" className="text-sm font-medium">
                I consent to GDPR data processing *
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                We process your personal data in accordance with GDPR regulations. You have the right to access, 
                modify, or delete your data at any time.
              </p>
            </div>
          </div>
          {errors.gdpr && (
            <p className="text-sm text-red-600 mt-2">{errors.gdpr}</p>
          )}
        </div>

        {/* COPPA Compliance (for users under 13) */}
        {isUnder13 && (
          <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="coppa"
                checked={acceptCOPPA}
                onCheckedChange={setAcceptCOPPA}
              />
              <div className="flex-1">
                <Label htmlFor="coppa" className="text-sm font-medium text-yellow-900">
                  Parental consent for COPPA compliance *
                </Label>
                <p className="text-xs text-yellow-700 mt-1">
                  As you are under 13, parental consent is required under COPPA regulations. 
                  A parent or guardian must verify this account before it can be activated.
                </p>
              </div>
            </div>
            {errors.coppa && (
              <p className="text-sm text-red-600 mt-2">{errors.coppa}</p>
            )}
          </div>
        )}

        {/* Marketing Consent (Optional) */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="marketing"
              checked={marketingConsent}
              onCheckedChange={setMarketingConsent}
            />
            <div className="flex-1">
              <Label htmlFor="marketing" className="text-sm font-medium">
                I would like to receive marketing communications (Optional)
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                Receive updates about new courses, special offers, and educational content. 
                You can unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Rights Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Your Data Rights</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• <strong>Access:</strong> Request a copy of your personal data</li>
          <li>• <strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
          <li>• <strong>Erasure:</strong> Request deletion of your personal data</li>
          <li>• <strong>Portability:</strong> Transfer your data to another service</li>
          <li>• <strong>Objection:</strong> Object to processing of your data</li>
          <li>• <strong>Restriction:</strong> Limit how we process your data</li>
        </ul>
        <p className="text-xs text-blue-600 mt-2">
          Contact us at{' '}
          <a href="mailto:privacy@stharoonschool.com" className="underline">
            privacy@stharoonschool.com
          </a>{' '}
          to exercise your rights.
        </p>
      </div>

      {/* Age Verification Notice */}
      {isUnder13 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-orange-900 mb-2">
            Parental Verification Required
          </h4>
          <p className="text-sm text-orange-700">
            Since you are under 13 years old, a parent or guardian will need to verify and approve 
            your account before you can access our services. We will send verification instructions 
            to the provided contact information.
          </p>
        </div>
      )}

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