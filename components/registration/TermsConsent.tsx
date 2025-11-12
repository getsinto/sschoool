'use client'

import { useState } from 'react'
import { Consents, ValidationErrors } from '@/types/registration'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Shield, FileText, Download, ExternalLink } from 'lucide-react'

interface TermsConsentProps {
  data: Partial<Consents>
  errors: ValidationErrors
  onChange: (data: Partial<Consents>) => void
  onNext: () => void
  onBack: () => void
  requiresGdpr: boolean
  requiresCoppa: boolean
}

export function TermsConsent({ 
  data, 
  errors, 
  onChange, 
  onNext, 
  onBack,
  requiresGdpr,
  requiresCoppa
}: TermsConsentProps) {
  const [termsModalOpen, setTermsModalOpen] = useState(false)
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false)

  const handleConsentChange = (key: keyof Consents, value: boolean) => {
    onChange({ ...data, [key]: value })
  }

  const TermsAndConditionsContent = () => (
    <ScrollArea className="h-96 w-full">
      <div className="p-4 space-y-4 text-sm">
        <h3 className="text-lg font-semibold">Terms and Conditions</h3>
        <p className="text-gray-600">Last updated: November 2024 • Version 1.0</p>
        
        <div className="space-y-4">
          <section>
            <h4 className="font-medium">1. Acceptance of Terms</h4>
            <p>By registering for and using our online education platform, you agree to be bound by these Terms and Conditions.</p>
          </section>
          
          <section>
            <h4 className="font-medium">2. User Accounts</h4>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
          </section>
          
          <section>
            <h4 className="font-medium">3. Educational Services</h4>
            <p>We provide online educational services including courses, live classes, and learning materials. Service availability may vary by region.</p>
          </section>
          
          <section>
            <h4 className="font-medium">4. Payment Terms</h4>
            <p>Course fees are due as specified during enrollment. Refunds are subject to our refund policy outlined in section 8.</p>
          </section>
          
          <section>
            <h4 className="font-medium">5. User Conduct</h4>
            <p>Users must maintain respectful behavior in all interactions. Harassment, inappropriate content, or disruptive behavior may result in account suspension.</p>
          </section>
          
          <section>
            <h4 className="font-medium">6. Intellectual Property</h4>
            <p>All course materials, content, and platform features are protected by intellectual property rights and may not be reproduced without permission.</p>
          </section>
          
          <section>
            <h4 className="font-medium">7. Privacy and Data Protection</h4>
            <p>Your privacy is important to us. Please review our Privacy Policy for details on how we collect, use, and protect your personal information.</p>
          </section>
          
          <section>
            <h4 className="font-medium">8. Refund Policy</h4>
            <p>Refunds may be requested within 7 days of course enrollment, subject to course completion status and platform policies.</p>
          </section>
          
          <section>
            <h4 className="font-medium">9. Limitation of Liability</h4>
            <p>Our liability is limited to the extent permitted by law. We are not responsible for indirect, incidental, or consequential damages.</p>
          </section>
          
          <section>
            <h4 className="font-medium">10. Modifications</h4>
            <p>We reserve the right to modify these terms at any time. Users will be notified of significant changes via email.</p>
          </section>
        </div>
      </div>
    </ScrollArea>
  )

  const PrivacyPolicyContent = () => (
    <ScrollArea className="h-96 w-full">
      <div className="p-4 space-y-4 text-sm">
        <h3 className="text-lg font-semibold">Privacy Policy</h3>
        <p className="text-gray-600">Last updated: November 2024 • Version 1.0</p>
        
        <div className="space-y-4">
          <section>
            <h4 className="font-medium">1. Information We Collect</h4>
            <p>We collect personal information you provide during registration, including name, email, address, and educational background.</p>
          </section>
          
          <section>
            <h4 className="font-medium">2. How We Use Your Information</h4>
            <p>Your information is used to provide educational services, process payments, communicate with you, and improve our platform.</p>
          </section>
          
          <section>
            <h4 className="font-medium">3. Information Sharing</h4>
            <p>We may share your information with teachers and administrators for educational purposes. We do not sell personal information to third parties.</p>
          </section>
          
          <section>
            <h4 className="font-medium">4. Data Security</h4>
            <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
          </section>
          
          <section>
            <h4 className="font-medium">5. Cookies and Tracking</h4>
            <p>We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content.</p>
          </section>
          
          <section>
            <h4 className="font-medium">6. Third-Party Services</h4>
            <p>Our platform integrates with third-party services for payments, video conferencing, and analytics. These services have their own privacy policies.</p>
          </section>
          
          <section>
            <h4 className="font-medium">7. Data Retention</h4>
            <p>We retain your personal information for as long as necessary to provide services and comply with legal obligations.</p>
          </section>
          
          <section>
            <h4 className="font-medium">8. Your Rights</h4>
            <p>You have the right to access, update, or delete your personal information. Contact us to exercise these rights.</p>
          </section>
          
          <section>
            <h4 className="font-medium">9. Children's Privacy (COPPA)</h4>
            <p>We comply with COPPA requirements for users under 13. Parental consent is required for children's accounts.</p>
          </section>
          
          <section>
            <h4 className="font-medium">10. International Transfers</h4>
            <p>Your information may be transferred to and processed in countries other than your own, with appropriate safeguards in place.</p>
          </section>
        </div>
      </div>
    </ScrollArea>
  )

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Terms & Consent
          </CardTitle>
          <p className="text-sm text-gray-600">
            Please review and accept our terms and privacy policy, and set your communication preferences
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Required Legal Agreements */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Required Agreements</h3>
            
            {/* Terms and Conditions */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="termsAccepted"
                checked={data.termsAccepted || false}
                onCheckedChange={(checked) => handleConsentChange('termsAccepted', checked as boolean)}
                className={errors.termsAccepted ? 'border-red-500' : ''}
              />
              <div className="flex-1">
                <Label htmlFor="termsAccepted" className="text-sm">
                  I have read and agree to the{' '}
                  <Dialog open={termsModalOpen} onOpenChange={setTermsModalOpen}>
                    <DialogTrigger asChild>
                      <button className="text-blue-600 hover:underline">
                        Terms and Conditions
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Terms and Conditions
                        </DialogTitle>
                      </DialogHeader>
                      <TermsAndConditionsContent />
                      <div className="flex justify-between pt-4">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                        <Button onClick={() => setTermsModalOpen(false)}>
                          Close
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  {' *'}
                </Label>
                {errors.termsAccepted && (
                  <p className="text-sm text-red-600 mt-1">{errors.termsAccepted}</p>
                )}
              </div>
            </div>

            {/* Privacy Policy */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="privacyAccepted"
                checked={data.privacyAccepted || false}
                onCheckedChange={(checked) => handleConsentChange('privacyAccepted', checked as boolean)}
                className={errors.privacyAccepted ? 'border-red-500' : ''}
              />
              <div className="flex-1">
                <Label htmlFor="privacyAccepted" className="text-sm">
                  I have read and agree to the{' '}
                  <Dialog open={privacyModalOpen} onOpenChange={setPrivacyModalOpen}>
                    <DialogTrigger asChild>
                      <button className="text-blue-600 hover:underline">
                        Privacy Policy
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          Privacy Policy
                        </DialogTitle>
                      </DialogHeader>
                      <PrivacyPolicyContent />
                      <div className="flex justify-between pt-4">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                        <Button onClick={() => setPrivacyModalOpen(false)}>
                          Close
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  {' *'}
                </Label>
                {errors.privacyAccepted && (
                  <p className="text-sm text-red-600 mt-1">{errors.privacyAccepted}</p>
                )}
              </div>
            </div>

            {/* GDPR Consent (EU users) */}
            {requiresGdpr && (
              <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded">
                <Checkbox
                  id="gdprConsent"
                  checked={data.gdprConsent || false}
                  onCheckedChange={(checked) => handleConsentChange('gdprConsent', checked as boolean)}
                  className={errors.gdprConsent ? 'border-red-500' : ''}
                />
                <div className="flex-1">
                  <Label htmlFor="gdprConsent" className="text-sm">
                    <strong>GDPR Consent (EU Residents):</strong> I consent to the processing of my personal data as described in the Privacy Policy *
                  </Label>
                  {errors.gdprConsent && (
                    <p className="text-sm text-red-600 mt-1">{errors.gdprConsent}</p>
                  )}
                </div>
              </div>
            )}

            {/* COPPA Consent (under 13) */}
            {requiresCoppa && (
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <Checkbox
                  id="coppaConsent"
                  checked={data.coppaConsent || false}
                  onCheckedChange={(checked) => handleConsentChange('coppaConsent', checked as boolean)}
                  className={errors.coppaConsent ? 'border-red-500' : ''}
                />
                <div className="flex-1">
                  <Label htmlFor="coppaConsent" className="text-sm">
                    <strong>Parental Consent (Under 13):</strong> I am a parent/guardian and provide consent for my child under 13 to use this platform *
                  </Label>
                  {errors.coppaConsent && (
                    <p className="text-sm text-red-600 mt-1">{errors.coppaConsent}</p>
                  )}
                  <p className="text-xs text-yellow-800 mt-1">
                    Additional parent email verification will be required after registration
                  </p>
                </div>
              </div>
            )}

            {/* Data Sharing Consent */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="dataSharing"
                checked={data.dataSharing || false}
                onCheckedChange={(checked) => handleConsentChange('dataSharing', checked as boolean)}
                className={errors.dataSharing ? 'border-red-500' : ''}
              />
              <div className="flex-1">
                <Label htmlFor="dataSharing" className="text-sm">
                  I understand my data may be shared with teachers and administrators for educational purposes *
                </Label>
                {errors.dataSharing && (
                  <p className="text-sm text-red-600 mt-1">{errors.dataSharing}</p>
                )}
              </div>
            </div>
          </div>

          {/* Communication Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Communication Preferences</h3>
            <p className="text-sm text-gray-600">
              Choose how you'd like to receive updates and notifications from us
            </p>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="emailNotifications"
                  checked={data.emailNotifications || false}
                  onCheckedChange={(checked) => handleConsentChange('emailNotifications', checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="emailNotifications" className="text-sm font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-xs text-gray-600">
                    Course updates, announcements, and promotional emails
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="smsNotifications"
                  checked={data.smsNotifications || false}
                  onCheckedChange={(checked) => handleConsentChange('smsNotifications', checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="smsNotifications" className="text-sm font-medium">
                    SMS Notifications
                  </Label>
                  <p className="text-xs text-gray-600">
                    Important updates and class reminders via text message
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="whatsappNotifications"
                  checked={data.whatsappNotifications || false}
                  onCheckedChange={(checked) => handleConsentChange('whatsappNotifications', checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="whatsappNotifications" className="text-sm font-medium">
                    WhatsApp Notifications
                  </Label>
                  <p className="text-xs text-gray-600">
                    Class reminders and updates via WhatsApp
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onChange({
                  ...data,
                  termsAccepted: true,
                  privacyAccepted: true,
                  dataSharing: true,
                  emailNotifications: true,
                  ...(requiresGdpr && { gdprConsent: true }),
                  ...(requiresCoppa && { coppaConsent: true })
                })
              }}
            >
              Accept All Required
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onChange({
                  ...data,
                  emailNotifications: true,
                  smsNotifications: true,
                  whatsappNotifications: true
                })
              }}
            >
              Enable All Notifications
            </Button>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={onNext}>
              Continue to Review
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}