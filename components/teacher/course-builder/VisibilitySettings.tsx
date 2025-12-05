'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Globe, Lock, Eye, EyeOff, Star, Users, MapPin } from 'lucide-react'
import { format } from 'date-fns'

interface VisibilitySettingsProps {
  courseId?: string
  initialData?: {
    status: string
    visibility: string
    scheduled_publish_at?: string
    allowed_roles?: string[]
    allowed_countries?: string[]
    excluded_countries?: string[]
    visible_from?: string
    visible_until?: string
    is_featured: boolean
    access_codes?: string[]
  }
  onChange?: (data: any) => void
}

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft', description: 'Work in progress, not visible to anyone', icon: '📝' },
  { value: 'pending_approval', label: 'Pending Approval', description: 'Submitted for admin review', icon: '⏳' },
  { value: 'approved', label: 'Approved', description: 'Ready to publish', icon: '✅' },
  { value: 'published', label: 'Published', description: 'Live and visible to students', icon: '🌐' },
  { value: 'scheduled', label: 'Scheduled', description: 'Will auto-publish at set time', icon: '⏰' },
  { value: 'hidden', label: 'Hidden/Unlisted', description: 'Published but not in catalog', icon: '🔒' },
  { value: 'archived', label: 'Archived', description: 'Course ended, no new enrollments', icon: '📦' },
  { value: 'deprecated', label: 'Deprecated', description: 'Replaced by newer version', icon: '⚠️' },
]

const VISIBILITY_OPTIONS = [
  { value: 'everyone', label: 'Everyone', description: 'Public, anyone can see', icon: Globe },
  { value: 'logged_in', label: 'Logged-in Users', description: 'Only registered users', icon: Users },
  { value: 'specific_roles', label: 'Specific Roles', description: 'Selected user roles only', icon: Lock },
  { value: 'specific_grades', label: 'Specific Grades', description: 'Selected grades only', icon: Users },
  { value: 'invite_only', label: 'Invite Only', description: 'Access code required', icon: Lock },
]

const ROLE_OPTIONS = ['student', 'teacher', 'parent']
const GRADE_OPTIONS = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12']

export default function VisibilitySettings({ courseId, initialData, onChange }: VisibilitySettingsProps) {
  const [status, setStatus] = useState(initialData?.status || 'draft')
  const [visibility, setVisibility] = useState(initialData?.visibility || 'everyone')
  const [scheduledDate, setScheduledDate] = useState(initialData?.scheduled_publish_at || '')
  const [allowedRoles, setAllowedRoles] = useState<string[]>(initialData?.allowed_roles || [])
  const [allowedCountries, setAllowedCountries] = useState<string[]>(initialData?.allowed_countries || [])
  const [excludedCountries, setExcludedCountries] = useState<string[]>(initialData?.excluded_countries || [])
  const [visibleFrom, setVisibleFrom] = useState(initialData?.visible_from || '')
  const [visibleUntil, setVisibleUntil] = useState(initialData?.visible_until || '')
  const [isFeatured, setIsFeatured] = useState(initialData?.is_featured || false)
  const [accessCodes, setAccessCodes] = useState<string[]>(initialData?.access_codes || [])
  const [newAccessCode, setNewAccessCode] = useState('')

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus)
    onChange?.({ status: newStatus })
  }

  const handleVisibilityChange = (newVisibility: string) => {
    setVisibility(newVisibility)
    onChange?.({ visibility: newVisibility })
  }

  const toggleRole = (role: string) => {
    const updated = allowedRoles.includes(role)
      ? allowedRoles.filter(r => r !== role)
      : [...allowedRoles, role]
    setAllowedRoles(updated)
    onChange?.({ allowed_roles: updated })
  }

  const addAccessCode = () => {
    if (newAccessCode && !accessCodes.includes(newAccessCode)) {
      const updated = [...accessCodes, newAccessCode]
      setAccessCodes(updated)
      setNewAccessCode('')
      onChange?.({ access_codes: updated })
    }
  }

  const removeAccessCode = (code: string) => {
    const updated = accessCodes.filter(c => c !== code)
    setAccessCodes(updated)
    onChange?.({ access_codes: updated })
  }

  const selectedStatus = STATUS_OPTIONS.find(opt => opt.value === status)
  const selectedVisibility = VISIBILITY_OPTIONS.find(opt => opt.value === visibility)

  return (
    <div className="space-y-6">
      {/* Status Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Course Status
          </CardTitle>
          <CardDescription>
            Control the publication status of your course
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Status</Label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span>{option.icon}</span>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStatus && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{selectedStatus.icon}</span>
                <div>
                  <h4 className="font-semibold text-blue-900">{selectedStatus.label}</h4>
                  <p className="text-sm text-blue-700">{selectedStatus.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Scheduled Publishing */}
          {status === 'scheduled' && (
            <div className="space-y-2 pt-4 border-t">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Schedule Publish Date & Time
              </Label>
              <Input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => {
                  setScheduledDate(e.target.value)
                  onChange?.({ scheduled_publish_at: e.target.value })
                }}
              />
              {scheduledDate && (
                <p className="text-sm text-gray-600">
                  Will auto-publish on {format(new Date(scheduledDate), 'PPpp')}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Visibility Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Visibility Rules
          </CardTitle>
          <CardDescription>
            Control who can see this course
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Who Can See This Course</Label>
            <Select value={visibility} onValueChange={handleVisibilityChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VISIBILITY_OPTIONS.map(option => {
                  const Icon = option.icon
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Role Selection */}
          {visibility === 'specific_roles' && (
            <div className="space-y-2 pt-4 border-t">
              <Label>Allowed Roles</Label>
              <div className="flex flex-wrap gap-2">
                {ROLE_OPTIONS.map(role => (
                  <Badge
                    key={role}
                    variant={allowedRoles.includes(role) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleRole(role)}
                  >
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Access Codes */}
          {visibility === 'invite_only' && (
            <div className="space-y-2 pt-4 border-t">
              <Label>Access Codes</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter access code"
                  value={newAccessCode}
                  onChange={(e) => setNewAccessCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addAccessCode()}
                />
                <Button onClick={addAccessCode}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {accessCodes.map(code => (
                  <Badge key={code} variant="secondary">
                    {code}
                    <button
                      onClick={() => removeAccessCode(code)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time-Based Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Time-Based Visibility
          </CardTitle>
          <CardDescription>
            Set when this course should be visible
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Visible From</Label>
              <Input
                type="date"
                value={visibleFrom}
                onChange={(e) => {
                  setVisibleFrom(e.target.value)
                  onChange?.({ visible_from: e.target.value })
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Visible Until</Label>
              <Input
                type="date"
                value={visibleUntil}
                onChange={(e) => {
                  setVisibleUntil(e.target.value)
                  onChange?.({ visible_until: e.target.value })
                }}
              />
            </div>
          </div>
          {(visibleFrom || visibleUntil) && (
            <p className="text-sm text-gray-600">
              {visibleFrom && `Available from ${format(new Date(visibleFrom), 'PP')}`}
              {visibleFrom && visibleUntil && ' to '}
              {visibleUntil && `${format(new Date(visibleUntil), 'PP')}`}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Featured Course */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Featured Course
          </CardTitle>
          <CardDescription>
            Mark this course as featured on the homepage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label>Feature this course</Label>
              <p className="text-sm text-gray-600">
                Featured courses appear prominently on the homepage
              </p>
            </div>
            <Switch
              checked={isFeatured}
              onCheckedChange={(checked) => {
                setIsFeatured(checked)
                onChange?.({ is_featured: checked })
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Geography Restrictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Geography Restrictions
          </CardTitle>
          <CardDescription>
            Control course availability by location (optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Allowed Countries (leave empty for worldwide)</Label>
            <Input
              placeholder="e.g., US, UK, CA (comma-separated)"
              value={allowedCountries.join(', ')}
              onChange={(e) => {
                const countries = e.target.value.split(',').map(c => c.trim()).filter(Boolean)
                setAllowedCountries(countries)
                onChange?.({ allowed_countries: countries })
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Excluded Countries</Label>
            <Input
              placeholder="e.g., CN, RU (comma-separated)"
              value={excludedCountries.join(', ')}
              onChange={(e) => {
                const countries = e.target.value.split(',').map(c => c.trim()).filter(Boolean)
                setExcludedCountries(countries)
                onChange?.({ excluded_countries: countries })
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
