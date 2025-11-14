'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  User, 
  Shield, 
  Settings, 
  Users, 
  BookOpen, 
  CreditCard,
  MessageSquare,
  BarChart3,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
// Using browser alert for now - replace with your preferred toast library
const toast = {
  success: (message: string) => alert(message),
  error: (message: string) => alert(`Error: ${message}`)
}

interface Permission {
  id: string
  name: string
  description: string
  icon: any
  category: string
}

const PERMISSIONS: Permission[] = [
  // User Management
  { id: 'users.view', name: 'View Users', description: 'View user profiles and information', icon: Users, category: 'User Management' },
  { id: 'users.create', name: 'Create Users', description: 'Create new user accounts', icon: Users, category: 'User Management' },
  { id: 'users.edit', name: 'Edit Users', description: 'Edit user profiles and information', icon: Users, category: 'User Management' },
  { id: 'users.delete', name: 'Delete Users', description: 'Delete user accounts', icon: Users, category: 'User Management' },
  { id: 'users.suspend', name: 'Suspend Users', description: 'Suspend/activate user accounts', icon: Users, category: 'User Management' },
  { id: 'users.verify', name: 'Verify Users', description: 'Approve/reject user verifications', icon: Shield, category: 'User Management' },
  
  // Course Management
  { id: 'courses.view', name: 'View Courses', description: 'View all courses and content', icon: BookOpen, category: 'Course Management' },
  { id: 'courses.create', name: 'Create Courses', description: 'Create new courses', icon: BookOpen, category: 'Course Management' },
  { id: 'courses.edit', name: 'Edit Courses', description: 'Edit course content and settings', icon: BookOpen, category: 'Course Management' },
  { id: 'courses.delete', name: 'Delete Courses', description: 'Delete courses', icon: BookOpen, category: 'Course Management' },
  { id: 'courses.publish', name: 'Publish Courses', description: 'Publish/unpublish courses', icon: BookOpen, category: 'Course Management' },
  
  // Payment Management
  { id: 'payments.view', name: 'View Payments', description: 'View payment transactions and history', icon: CreditCard, category: 'Payment Management' },
  { id: 'payments.refund', name: 'Process Refunds', description: 'Process payment refunds', icon: CreditCard, category: 'Payment Management' },
  { id: 'payments.coupons', name: 'Manage Coupons', description: 'Create and manage discount coupons', icon: CreditCard, category: 'Payment Management' },
  
  // Communication
  { id: 'communication.announcements', name: 'Send Announcements', description: 'Send platform-wide announcements', icon: MessageSquare, category: 'Communication' },
  { id: 'communication.emails', name: 'Send Emails', description: 'Send emails to users', icon: MessageSquare, category: 'Communication' },
  { id: 'communication.support', name: 'Manage Support', description: 'Handle support tickets', icon: MessageSquare, category: 'Communication' },
  
  // Reports & Analytics
  { id: 'reports.view', name: 'View Reports', description: 'Access reports and analytics', icon: BarChart3, category: 'Reports & Analytics' },
  { id: 'reports.export', name: 'Export Reports', description: 'Export reports and data', icon: FileText, category: 'Reports & Analytics' },
  
  // System Settings
  { id: 'settings.platform', name: 'Platform Settings', description: 'Manage platform-wide settings', icon: Settings, category: 'System Settings' },
  { id: 'settings.integrations', name: 'Manage Integrations', description: 'Configure third-party integrations', icon: Settings, category: 'System Settings' },
]

const PERMISSION_LEVELS = {
  'super_admin': {
    name: 'Super Admin',
    description: 'Full access to all platform features and settings',
    permissions: PERMISSIONS.map(p => p.id),
    color: 'bg-red-100 text-red-800'
  },
  'admin': {
    name: 'Admin',
    description: 'Access to most features except critical system settings',
    permissions: PERMISSIONS.filter(p => !p.id.startsWith('settings.')).map(p => p.id),
    color: 'bg-blue-100 text-blue-800'
  },
  'moderator': {
    name: 'Moderator',
    description: 'Limited access focused on content and user moderation',
    permissions: [
      'users.view', 'users.suspend', 'users.verify',
      'courses.view', 'courses.edit',
      'communication.support',
      'reports.view'
    ],
    color: 'bg-green-100 text-green-800'
  },
  'custom': {
    name: 'Custom',
    description: 'Custom permission set',
    permissions: [],
    color: 'bg-purple-100 text-purple-800'
  }
}

export default function CreateAdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    permissionLevel: '',
    customPermissions: [] as string[],
    notes: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handlePermissionLevelChange = (level: string) => {
    setFormData(prev => ({
      ...prev,
      permissionLevel: level,
      customPermissions: level === 'custom' ? prev.customPermissions : PERMISSION_LEVELS[level as keyof typeof PERMISSION_LEVELS]?.permissions || []
    }))
  }

  const handleCustomPermissionChange = (permissionId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      customPermissions: checked 
        ? [...prev.customPermissions, permissionId]
        : prev.customPermissions.filter(id => id !== permissionId)
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.permissionLevel) {
      newErrors.permissionLevel = 'Permission level is required'
    }

    if (formData.permissionLevel === 'custom' && formData.customPermissions.length === 0) {
      newErrors.customPermissions = 'At least one permission must be selected for custom level'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: 'admin',
          permissionLevel: formData.permissionLevel,
          permissions: formData.customPermissions,
          notes: formData.notes,
          isAdmin: true
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create admin account')
      }

      const result = await response.json()
      toast.success('Admin account created successfully!')
      router.push(`/dashboard/admin/users/${result.id}`)
    } catch (error) {
      console.error('Error creating admin:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create admin account')
    } finally {
      setLoading(false)
    }
  }

  const groupedPermissions = PERMISSIONS.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = []
    }
    acc[permission.category]!.push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  const selectedLevel = formData.permissionLevel ? PERMISSION_LEVELS[formData.permissionLevel as keyof typeof PERMISSION_LEVELS] : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Admin Account</h1>
            <p className="text-gray-600 mt-1">Create a new administrator with specific permissions</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      className={errors.password ? 'border-red-500' : ''}
                    />
                    {errors.password && (
                      <p className="text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className={errors.confirmPassword ? 'border-red-500' : ''}
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any additional notes about this admin account..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Permissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Permissions & Access Level</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Permission Level Selection */}
                <div className="space-y-2">
                  <Label>Permission Level *</Label>
                  <Select value={formData.permissionLevel} onValueChange={handlePermissionLevelChange}>
                    <SelectTrigger className={errors.permissionLevel ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select permission level" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PERMISSION_LEVELS).map(([key, level]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center space-x-2">
                            <Badge className={level.color}>{level.name}</Badge>
                            <span>{level.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.permissionLevel && (
                    <p className="text-sm text-red-600">{errors.permissionLevel}</p>
                  )}
                </div>

                {/* Selected Level Info */}
                {selectedLevel && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{selectedLevel.name}:</strong> {selectedLevel.description}
                      {formData.permissionLevel !== 'custom' && (
                        <span className="block mt-1 text-sm text-gray-600">
                          This level includes {selectedLevel.permissions.length} permissions.
                        </span>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Custom Permissions */}
                {formData.permissionLevel === 'custom' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Custom Permissions</Label>
                      <Badge variant="outline">
                        {formData.customPermissions.length} selected
                      </Badge>
                    </div>
                    
                    {errors.customPermissions && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.customPermissions}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-6">
                      {Object.entries(groupedPermissions).map(([category, permissions]) => {
                        const IconComponent = permissions[0]?.icon
                        return (
                        <div key={category} className="space-y-3">
                          <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                            {IconComponent && <IconComponent className="w-4 h-4" />}
                            <span>{category}</span>
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
                            {permissions.map((permission) => (
                              <div key={permission.id} className="flex items-start space-x-3">
                                <Checkbox
                                  id={permission.id}
                                  checked={formData.customPermissions.includes(permission.id)}
                                  onCheckedChange={(checked) => 
                                    handleCustomPermissionChange(permission.id, checked as boolean)
                                  }
                                />
                                <div className="space-y-1">
                                  <Label 
                                    htmlFor={permission.id} 
                                    className="text-sm font-medium cursor-pointer"
                                  >
                                    {permission.name}
                                  </Label>
                                  <p className="text-xs text-gray-600">
                                    {permission.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          {category !== Object.keys(groupedPermissions)[Object.keys(groupedPermissions).length - 1] && (
                            <Separator className="mt-4" />
                          )}
                        </div>
                      )})}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Account Type</Label>
                  <Badge className="bg-blue-100 text-blue-800">Administrator</Badge>
                </div>

                {formData.firstName && formData.lastName && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Full Name</Label>
                    <p className="text-sm">{formData.firstName} {formData.lastName}</p>
                  </div>
                )}

                {formData.email && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Email</Label>
                    <p className="text-sm">{formData.email}</p>
                  </div>
                )}

                {selectedLevel && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Permission Level</Label>
                    <Badge className={selectedLevel.color}>{selectedLevel.name}</Badge>
                  </div>
                )}

                {formData.customPermissions.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Permissions</Label>
                    <p className="text-sm text-gray-600">
                      {formData.customPermissions.length} permission{formData.customPermissions.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                )}

                <Separator />

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    The new admin will receive an email with their login credentials and will be required to change their password on first login.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Admin Account'}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
