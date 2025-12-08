'use client'

import { UserType, PersonalInfo, RoleSpecificData, AccountSettings } from './CreateUserModal'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Edit2 } from 'lucide-react'

interface ReviewStepProps {
  userType: UserType
  personalInfo: PersonalInfo
  roleSpecificData: RoleSpecificData
  accountSettings: AccountSettings
  onEdit: (step: number) => void
}

export default function ReviewStep({
  userType,
  personalInfo,
  roleSpecificData,
  accountSettings,
  onEdit,
}: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Review and Confirm</h3>
        <p className="text-sm text-gray-600 mt-1">
          Please review all information before creating the user
        </p>
      </div>

      {/* User Type */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900">User Type</h4>
          <Button variant="ghost" size="sm" onClick={() => onEdit(1)}>
            <Edit2 className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
        <p className="text-sm text-gray-700 capitalize">{userType}</p>
      </Card>

      {/* Personal Information */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900">Personal Information</h4>
          <Button variant="ghost" size="sm" onClick={() => onEdit(2)}>
            <Edit2 className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-600">Email</dt>
            <dd className="text-gray-900 font-medium">{personalInfo.email}</dd>
          </div>
          <div>
            <dt className="text-gray-600">Full Name</dt>
            <dd className="text-gray-900 font-medium">{personalInfo.fullName}</dd>
          </div>
          {personalInfo.dateOfBirth && (
            <div>
              <dt className="text-gray-600">Date of Birth</dt>
              <dd className="text-gray-900">{personalInfo.dateOfBirth}</dd>
            </div>
          )}
          {personalInfo.gender && (
            <div>
              <dt className="text-gray-600">Gender</dt>
              <dd className="text-gray-900 capitalize">{personalInfo.gender.replace('_', ' ')}</dd>
            </div>
          )}
          {personalInfo.mobile && (
            <div>
              <dt className="text-gray-600">Mobile</dt>
              <dd className="text-gray-900">{personalInfo.mobile}</dd>
            </div>
          )}
          {personalInfo.whatsapp && (
            <div>
              <dt className="text-gray-600">WhatsApp</dt>
              <dd className="text-gray-900">{personalInfo.whatsapp}</dd>
            </div>
          )}
          {personalInfo.country && (
            <div>
              <dt className="text-gray-600">Country</dt>
              <dd className="text-gray-900">{personalInfo.country}</dd>
            </div>
          )}
          {personalInfo.state && (
            <div>
              <dt className="text-gray-600">State</dt>
              <dd className="text-gray-900">{personalInfo.state}</dd>
            </div>
          )}
          {personalInfo.city && (
            <div>
              <dt className="text-gray-600">City</dt>
              <dd className="text-gray-900">{personalInfo.city}</dd>
            </div>
          )}
        </dl>
      </Card>

      {/* Role-Specific Details */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900 capitalize">{userType} Details</h4>
          <Button variant="ghost" size="sm" onClick={() => onEdit(3)}>
            <Edit2 className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {userType === 'student' && (
            <>
              {roleSpecificData.studentType && (
                <div>
                  <dt className="text-gray-600">Student Type</dt>
                  <dd className="text-gray-900 capitalize">{roleSpecificData.studentType.replace('_', ' ')}</dd>
                </div>
              )}
              {roleSpecificData.gradeLevel && (
                <div>
                  <dt className="text-gray-600">Grade Level</dt>
                  <dd className="text-gray-900">{roleSpecificData.gradeLevel}</dd>
                </div>
              )}
              {roleSpecificData.previousSchool && (
                <div className="md:col-span-2">
                  <dt className="text-gray-600">Previous School</dt>
                  <dd className="text-gray-900">{roleSpecificData.previousSchool}</dd>
                </div>
              )}
            </>
          )}

          {userType === 'teacher' && (
            <>
              {roleSpecificData.qualifications && (
                <div className="md:col-span-2">
                  <dt className="text-gray-600">Qualifications</dt>
                  <dd className="text-gray-900">{roleSpecificData.qualifications}</dd>
                </div>
              )}
              {roleSpecificData.experienceYears !== undefined && (
                <div>
                  <dt className="text-gray-600">Experience</dt>
                  <dd className="text-gray-900">{roleSpecificData.experienceYears} years</dd>
                </div>
              )}
              {roleSpecificData.subjects && roleSpecificData.subjects.length > 0 && (
                <div className="md:col-span-2">
                  <dt className="text-gray-600">Subjects</dt>
                  <dd className="text-gray-900">{roleSpecificData.subjects.join(', ')}</dd>
                </div>
              )}
              {roleSpecificData.preApproved && (
                <div className="md:col-span-2">
                  <dt className="text-gray-600">Status</dt>
                  <dd className="text-green-600 font-medium">Pre-approved</dd>
                </div>
              )}
            </>
          )}

          {userType === 'parent' && (
            <>
              {roleSpecificData.relationship && (
                <div>
                  <dt className="text-gray-600">Relationship</dt>
                  <dd className="text-gray-900">{roleSpecificData.relationship}</dd>
                </div>
              )}
              {roleSpecificData.occupation && (
                <div>
                  <dt className="text-gray-600">Occupation</dt>
                  <dd className="text-gray-900">{roleSpecificData.occupation}</dd>
                </div>
              )}
            </>
          )}

          {userType === 'admin' && roleSpecificData.subjects && roleSpecificData.subjects.length > 0 && (
            <div className="md:col-span-2">
              <dt className="text-gray-600">Permissions</dt>
              <dd className="text-gray-900">
                {roleSpecificData.subjects.map(p => p.replace('_', ' ')).join(', ')}
              </dd>
            </div>
          )}
        </dl>
      </Card>

      {/* Account Settings */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-900">Account Settings</h4>
          <Button variant="ghost" size="sm" onClick={() => onEdit(4)}>
            <Edit2 className="w-4 h-4 mr-1" />
            Edit
          </Button>
        </div>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-600">Account Status</dt>
            <dd className="text-gray-900 capitalize">{accountSettings.accountStatus}</dd>
          </div>
          <div>
            <dt className="text-gray-600">Email Verification</dt>
            <dd className="text-gray-900">
              {accountSettings.bypassVerification ? 'Bypassed' : 'Required'}
            </dd>
          </div>
          <div>
            <dt className="text-gray-600">Welcome Email</dt>
            <dd className="text-gray-900">
              {accountSettings.sendWelcomeEmail ? 'Will be sent' : 'Will not be sent'}
            </dd>
          </div>
          <div>
            <dt className="text-gray-600">Password Change</dt>
            <dd className="text-gray-900">
              {accountSettings.requirePasswordChange ? 'Required on first login' : 'Not required'}
            </dd>
          </div>
        </dl>
      </Card>

      {/* Confirmation Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Please confirm:</strong> Once you click "Create User", a new account will be created 
          with a temporary password. Make sure all information is correct before proceeding.
        </p>
      </div>
    </div>
  )
}
