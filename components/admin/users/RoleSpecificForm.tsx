'use client'

import { UserType, RoleSpecificData } from './CreateUserModal'
import StudentFields from './StudentFields'
import TeacherFields from './TeacherFields'
import ParentFields from './ParentFields'
import AdminFields from './AdminFields'

interface RoleSpecificFormProps {
  userType: UserType
  data: RoleSpecificData
  onChange: (data: RoleSpecificData) => void
}

export default function RoleSpecificForm({ userType, data, onChange }: RoleSpecificFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
          {userType.charAt(0).toUpperCase() + userType.slice(1)} Details
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Enter {userType}-specific information
        </p>
      </div>

      {userType === 'student' && <StudentFields data={data} onChange={onChange} />}
      {userType === 'teacher' && <TeacherFields data={data} onChange={onChange} />}
      {userType === 'parent' && <ParentFields data={data} onChange={onChange} />}
      {userType === 'admin' && <AdminFields data={data} onChange={onChange} />}
    </div>
  )
}
