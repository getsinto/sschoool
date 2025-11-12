'use client'

import { useState } from 'react'
import { RegistrationData, UserType } from '@/types/registration'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Edit, Check, Clock, Mail, Shield, FileText, User, MapPin, GraduationCap, Users, MessageCircle, UserCheck } from 'lucide-react'

interface ReviewSubmitProps {
  data: RegistrationData
  onEdit: (step: number) => void
  onSubmit: () => Promise<void>
  onBack: () => void
  isLoading: boolean
}

export function ReviewSubmit({ data, onEdit, onSubmit, onBack, isLoading }: ReviewSubmitProps) {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)

  const getUserTypeIcon = (userType: UserType) => {
    switch (userType) {
      case 'student': return <GraduationCap className="h-5 w-5" />
      case 'teacher': return <UserCheck className="h-5 w-5" />
      case 'parent': return <Users className="h-5 w-5" />
      case 'spoken_english': return <MessageCircle className="h-5 w-5" />
    }
  }

  const getUserTypeTitle = (userType: UserType) => {
    switch (userType) {
      case 'student': return 'Student (Online School)'
      case 'teacher': return 'Teacher'
      case 'parent': return 'Parent/Guardian'
      case 'spoken_english': return 'Spoken English Student'
    }
  }

  const getEstimatedApprovalTime = (userType: UserType) => {
    switch (userType) {
      case 'teacher': return '24-48 hours (Manual review required)'
      case 'student':
      case 'parent':
      case 'spoken_english':
      default: return '2-4 hours (Automated verification)'
    }
  }

  const formatAddress = () => {
    const { address, city, state, country, postalCode } = data.addressInfo
    const parts = [address, city, state, country, postalCode].filter(Boolean)
    return parts.join(', ')
  }

  const handleSubmit = async () => {
    setConfirmModalOpen(false)
    await onSubmit()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5" />
            Review & Submit Registration
          </CardTitle>
          <p className="text-sm text-gray-600">
            Please review all your information carefully before submitting your registration
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Important Notice */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">What happens next?</h4>
                <p className="text-sm text-blue-800 mt-1">
                  After submission, you'll receive an email confirmation. Your account will be reviewed and activated within{' '}
                  <strong>{getEstimatedApprovalTime(data.userType)}</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Registration Summary */}
          <Accordion type="multiple" defaultValue={["personal", "address", "category", "verification", "consents"]} className="w-full">
            {/* User Type & Personal Information */}
            <AccordionItem value="personal">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                  <Badge variant="secondary" className="ml-auto mr-2">
                    {getUserTypeTitle(data.userType)}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-sm">{data.personalInfo.firstName} {data.personalInfo.lastName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-sm">{data.personalInfo.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Mobile Number</label>
                    <p className="text-sm">{data.personalInfo.mobileNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                    <p className="text-sm">{data.personalInfo.dateOfBirth}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Gender</label>
                    <p className="text-sm capitalize">{data.personalInfo.gender?.replace('_', ' ')}</p>
                  </div>
                  {data.personalInfo.whatsappNumber && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">WhatsApp</label>
                      <p className="text-sm">{data.personalInfo.whatsappNumber}</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="outline" size="sm" onClick={() => onEdit(2)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Address Information */}
            <AccordionItem value="address">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5" />
                  <span>Address Information</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <label className="text-sm font-medium text-gray-600">Full Address</label>
                  <p className="text-sm mt-1">{formatAddress()}</p>
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="outline" size="sm" onClick={() => onEdit(3)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Category-Specific Information */}
            <AccordionItem value="category">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  {getUserTypeIcon(data.userType)}
                  <span>{data.userType === 'student' ? 'Student Information' :
                         data.userType === 'teacher' ? 'Teaching Background' :
                         data.userType === 'parent' ? 'Parent Information' :
                         'Learning Preferences'}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="p-4 bg-gray-50 rounded-lg">
                  {data.userType === 'student' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Previous School</label>
                        <p className="text-sm">{(data.categorySpecific as any).previousSchool}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Grade Level</label>
                        <p className="text-sm">{(data.categorySpecific as any).gradeLevel}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Academic Year</label>
                        <p className="text-sm">{(data.categorySpecific as any).academicYear}</p>
                      </div>
                      {(data.categorySpecific as any).parentEmail && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Parent Email</label>
                          <p className="text-sm">{(data.categorySpecific as any).parentEmail}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {data.userType === 'teacher' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Qualification</label>
                          <p className="text-sm">{(data.categorySpecific as any).qualification}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Field of Study</label>
                          <p className="text-sm">{(data.categorySpecific as any).fieldOfStudy}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Teaching Experience</label>
                          <p className="text-sm">{(data.categorySpecific as any).teachingExperience} years</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Online Teaching Experience</label>
                          <p className="text-sm">{(data.categorySpecific as any).onlineTeachingExperience} years</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Subjects to Teach</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(data.categorySpecific as any).subjectsToTeach?.map((subject: string) => (
                            <Badge key={subject} variant="secondary" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Bio</label>
                        <p className="text-sm">{(data.categorySpecific as any).bio}</p>
                      </div>
                    </div>
                  )}

                  {data.userType === 'parent' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Relationship</label>
                        <p className="text-sm capitalize">{(data.categorySpecific as any).relationship?.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Number of Children</label>
                        <p className="text-sm">{(data.categorySpecific as any).numberOfChildren}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Emergency Contact</label>
                        <p className="text-sm">{(data.categorySpecific as any).emergencyContact}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Preferred Contact Method</label>
                        <p className="text-sm capitalize">{(data.categorySpecific as any).preferredContactMethod}</p>
                      </div>
                    </div>
                  )}

                  {data.userType === 'spoken_english' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">English Level</label>
                          <p className="text-sm capitalize">{(data.categorySpecific as any).englishLevel}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Age Group</label>
                          <p className="text-sm">{(data.categorySpecific as any).ageGroup}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Native Language</label>
                          <p className="text-sm">{(data.categorySpecific as any).nativeLanguage}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Lesson Duration</label>
                          <p className="text-sm">{(data.categorySpecific as any).preferredLessonDuration} minutes</p>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Learning Purposes</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(data.categorySpecific as any).purposeOfLearning?.map((purpose: string) => (
                            <Badge key={purpose} variant="secondary" className="text-xs">
                              {purpose}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="outline" size="sm" onClick={() => onEdit(4)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* ID Verification */}
            <AccordionItem value="verification">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5" />
                  <span>Identity Verification</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">ID Type</label>
                      <p className="text-sm">{data.idVerification.idType}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">ID Number</label>
                      <p className="text-sm">
                        {data.idVerification.idNumber?.replace(/./g, (char, index) => 
                          index < 3 || index > (data.idVerification.idNumber?.length || 0) - 4 ? char : '*'
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-600">Uploaded Documents</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {data.idVerification.idFrontUrl && (
                        <Badge variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          ID Front
                        </Badge>
                      )}
                      {data.idVerification.idBackUrl && (
                        <Badge variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          ID Back
                        </Badge>
                      )}
                      {data.idVerification.profilePhotoUrl && (
                        <Badge variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          Profile Photo
                        </Badge>
                      )}
                      {data.idVerification.selfieWithIdUrl && (
                        <Badge variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          Selfie with ID
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="outline" size="sm" onClick={() => onEdit(5)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Consents */}
            <AccordionItem value="consents">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5" />
                  <span>Consents & Preferences</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Terms & Conditions Accepted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Privacy Policy Accepted</span>
                    </div>
                    {data.consents.gdprConsent && (
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm">GDPR Consent Given</span>
                      </div>
                    )}
                    {data.consents.coppaConsent && (
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Parental Consent Given</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Communication Preferences</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {data.consents.emailNotifications && (
                        <Badge variant="secondary" className="text-xs">Email</Badge>
                      )}
                      {data.consents.smsNotifications && (
                        <Badge variant="secondary" className="text-xs">SMS</Badge>
                      )}
                      {data.consents.whatsappNotifications && (
                        <Badge variant="secondary" className="text-xs">WhatsApp</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="outline" size="sm" onClick={() => onEdit(6)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Final Confirmation */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="text-sm font-medium text-green-900 mb-2">Ready to Submit?</h4>
            <p className="text-sm text-green-800">
              By submitting this registration, you confirm that all information provided is accurate and complete. 
              You'll receive an email confirmation shortly after submission.
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            
            <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="px-8">
                  Submit Registration
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Confirm Registration Submission
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Are you sure you want to submit your registration? Please ensure all information is correct as some details cannot be changed after submission.
                  </p>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm text-blue-800">
                      <strong>What happens next:</strong>
                    </p>
                    <ul className="text-sm text-blue-800 mt-1 space-y-1">
                      <li>• You'll receive an email confirmation immediately</li>
                      <li>• Your account will be reviewed within {getEstimatedApprovalTime(data.userType)}</li>
                      <li>• You'll be notified via email once your account is approved</li>
                      <li>• You can then log in and start using the platform</li>
                    </ul>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setConfirmModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        'Confirm & Submit'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}