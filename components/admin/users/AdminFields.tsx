'use client'

import { RoleSpecificData } from './CreateUserModal'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

interface AdminFieldsProps {
  data: RoleSpecificData
  onChange: (data: RoleSpecificData) => void
}

const ADMIN_PERMISSIONS = [
  { id: 'manage_users', label: 'Manage Users', description: 'Create, edit, and delete users' },
  { id: 'manage_courses', label: 'Manage Courses', description: 'Approve and manage courses' },
  { id: 'manage_payments', label: 'Manage Payments', description: 'View and process payments' },
  { id: 'manage_content', label: 'Manage Content', description: 'Manage website content' },
  { id: 'view_reports', label: 'View Reports', description: 'Access analytics and reports' },
  { id: 'manage_settings', label: 'Manage Settings', description: 'Configure system settings' },
  { id: 'manage_support', label: 'Manage Support', description: 'Handle support tickets' },
  { id: 'full_access', label: 'Full Access', description: 'Complete system access (Super Admin)' },
]

export default function AdminFields({ data, onChange }: AdminFieldsProps) {
  const permissions = (data.subjects || []) as string[] // Reusing subjects field for permissions

  const togglePermission = (permissionId: string) => {
    const newPermissions = permissions.includes(permissionId)
      ? permissions.filter(p => p !== permissionId)
      : [...permissions, permissionId]
    
    onChange({ ...data, subjects: newPermissions })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Admin Permissions</Label>
        <p className="text-sm text-gray-600 mt-1">
          Select the permissions for this admin user
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ADMIN_PERMISSIONS.map((permission) => (
          <div
            key={permission.id}
            className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50"
          >
            <Checkbox
              id={permission.id}
              checked={permissions.includes(permission.id)}
              onCheckedChange={() => togglePermission(permission.id)}
            />
            <div className="flex-1">
              <Label htmlFor={permission.id} className="cursor-pointer font-medium">
                {permission.label}
              </Label>
              <p className="text-xs text-gray-600 mt-0.5">{permission.description}</p>
            </div>
          </div>
        ))}
      </div>

      {permissions.includes('full_access') && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Warning:</strong> Full Access grants complete control over the system. 
            Only assign this permission to trusted administrators.
          </p>
        </div>
      )}
    </div>
  )
}
