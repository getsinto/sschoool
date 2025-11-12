'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Save, Loader2, User, Mail, Phone, MessageCircle, Check, X, Eye } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { toast } from 'react-hot-toast'

const parentProfileSchema = z.object({
  relationship: z.string().min(1, 'Please specify your relationship'),
  occupation: z.string().min(1, 'Please enter your occupation'),
})

type ParentProfileForm = z.infer<typeof parentProfileSchema>

const RELATIONSHIPS = [
  'Mother', 'Father', 'Guardian', 'Grandmother', 'Grandfather', 'Aunt', 'Uncle', 'Other'
]

interface LinkedStudent {
  id: string
  name: string
  email: string
  gradeLevel: string
  profilePic?: string
  enrollmentStatus: 'active' | 'inactive'
  lastActive: string
  coursesCount: number
  averageProgress: number
}

interface LinkRequest {
  id: string
  studentName: string
  studentEmail: string
  requestedAt: string
  status: 'pending' | 'approved' | 'rejected'
}

interface CommunicationPreferences {
  emailNotifications: boolean
  smsNotifications: boolean
  progressReports: boolean
  assignmentAlerts: boolean
  behaviorReports: boolean
  eventNotifications: boolean
}

export default function ParentProfile() {
  const { profile, parentProfile, updateParentProfile } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [studentEmail, setStudentEmail] = useState('')
  const [isLinkingStudent, setIsLinkingStudent] = useState(false)
  
  // Mock data for linked students - in real app, fetch from API
  const [linkedStudents] = useState<LinkedStudent[]>([
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice.johnson@email.com',
      gradeLevel: 'Grade 10',
      profilePic: '',
      enrollmentStatus: 'active',
      lastActive: '2024-01-15T10:30:00Z',
      coursesCount: 5,
      averageProgress: 78
    },
    {
      id: '2',
      name: 'Bob Johnson',
      email: 'bob.johnson@email.com',
      gradeLevel: 'Grade 8',
      profilePic: '',
      enrollmentStatus: 'active',
      lastActive: '2024-01-14T15:45:00Z',
      coursesCount: 4,
      averageProgress: 85
    }
  ])

  // Mock data for link requests
  const [linkRequests] = useState<LinkRequest[]>([
    {
      id: '1',
      studentName: 'Charlie Johnson',
      studentEmail: 'charlie.johnson@email.com',
      requestedAt: '2024-01-10T09:00:00Z',
      status: 'pending'
    }
  ])

  const [communicationPrefs, setCommunicationPrefs] = useState<CommunicationPreferences>({
    emailNotifications: true,
    smsNotifications: false,
    progressReports: true,
    assignmentAlerts: true,
    behaviorReports: true,
    eventNotifications: false,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<ParentProfileForm>({
    resolver: zodResolver(parentProfileSchema),
    defaultValues: {
      relationship: parentProfile?.relationship || '',
      occupation: parentProfile?.occupation || '',
    },
  })

  const onSubmit = async (data: ParentProfileForm) => {
    setIsLoading(true)

    try {
      const { error } = await updateParentProfile({
        relationship: data.relationship,
        occupation: data.occupation,
      })

      if (error) {
        throw new Error(error)
      }

      toast.success('Parent profile updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update parent profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLinkStudent = async () => {
    if (!studentEmail.trim()) {
      toast.error('Please enter student email address')
      return
    }

    setIsLinkingStudent(true)

    try {
      const response = await fetch('/api/profile/link-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentEmail: studentEmail.trim(),
        }),
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error)
      }

      toast.success('Student link request sent successfully!')
      setStudentEmail('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send student link request')
    } finally {
      setIsLinkingStudent(false)
    }
  }

  const handleUnlinkStudent = async (studentId: string) => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/profile/unlink-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
        }),
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error)
      }

      toast.success('Student account unlinked successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to unlink student account')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCommunicationPrefChange = (key: keyof CommunicationPreferences, value: boolean) => {
    setCommunicationPrefs(prev => ({ ...prev, [key]: value }))
  }

  const saveCommunicationPreferences = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/profile/communication-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(communicationPrefs),
      })

      if (!response.ok) {
        throw new Error('Failed to save communication preferences')
      }

      toast.success('Communication preferences saved successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to save preferences')
    } finally {
      setIsLoading(false)
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-600'
    if (progress >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Parent Profile</h1>
        <p className="text-gray-600">Manage your information and monitor your children's progress</p>
      </div>

      <div className="space-y-6">
        {/* Linked Students Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Linked Students</CardTitle>
            <CardDescription>
              Students linked to your parent account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {linkedStudents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {linkedStudents.map((student) => (
                  <div key={student.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={student.profilePic} alt={student.name} />
                          <AvatarFallback>
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{student.name}</h4>
                          <p className="text-sm text-gray-500">{student.gradeLevel}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={student.enrollmentStatus === 'active' ? 'default' : 'secondary'}
                      >
                        {student.enrollmentStatus}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Courses Enrolled:</span>
                        <span className="font-medium">{student.coursesCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average Progress:</span>
                        <span className={`font-medium ${getProgressColor(student.averageProgress)}`}>
                          {student.averageProgress}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Active:</span>
                        <span className="font-medium">
                          {new Date(student.lastActive).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        View Progress
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Message
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleUnlinkStudent(student.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No Students Linked</h3>
                <p className="text-gray-500">Link student accounts to monitor their progress</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Link New Student */}
        <Card>
          <CardHeader>
            <CardTitle>Link Student Account</CardTitle>
            <CardDescription>
              Send a link request to a student account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter student's email address"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                type="email"
              />
              <Button
                onClick={handleLinkStudent}
                disabled={isLinkingStudent}
              >
                {isLinkingStudent ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Request'
                )}
              </Button>
            </div>

            {/* Pending Requests */}
            {linkRequests.length > 0 && (
              <div className="space-y-2">
                <Label>Pending Requests</Label>
                {linkRequests.map((request) => (
                  <div key={request.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-yellow-900">{request.studentName}</p>
                        <p className="text-sm text-yellow-700">{request.studentEmail}</p>
                        <p className="text-xs text-yellow-600">
                          Requested on {new Date(request.requestedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {request.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Parent Information */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Parent Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Relationship to Student *</Label>
                  <Select onValueChange={(value) => setValue('relationship', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIPS.map((relationship) => (
                        <SelectItem key={relationship} value={relationship}>
                          {relationship}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.relationship && (
                    <p className="text-sm text-red-600">{errors.relationship.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation *</Label>
                  <Input
                    id="occupation"
                    placeholder="Enter your occupation"
                    {...register('occupation')}
                  />
                  {errors.occupation && (
                    <p className="text-sm text-red-600">{errors.occupation.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Communication Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Communication Preferences</CardTitle>
            <CardDescription>
              Choose how you want to receive updates about your children
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive general notifications via email</p>
                </div>
                <Switch
                  checked={communicationPrefs.emailNotifications}
                  onCheckedChange={(checked) => handleCommunicationPrefChange('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Receive urgent notifications via SMS</p>
                </div>
                <Switch
                  checked={communicationPrefs.smsNotifications}
                  onCheckedChange={(checked) => handleCommunicationPrefChange('smsNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Progress Reports</Label>
                  <p className="text-sm text-gray-500">Weekly progress reports for each child</p>
                </div>
                <Switch
                  checked={communicationPrefs.progressReports}
                  onCheckedChange={(checked) => handleCommunicationPrefChange('progressReports', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Assignment Alerts</Label>
                  <p className="text-sm text-gray-500">Notifications about upcoming assignments and deadlines</p>
                </div>
                <Switch
                  checked={communicationPrefs.assignmentAlerts}
                  onCheckedChange={(checked) => handleCommunicationPrefChange('assignmentAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Behavior Reports</Label>
                  <p className="text-sm text-gray-500">Notifications about behavior and attendance</p>
                </div>
                <Switch
                  checked={communicationPrefs.behaviorReports}
                  onCheckedChange={(checked) => handleCommunicationPrefChange('behaviorReports', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Event Notifications</Label>
                  <p className="text-sm text-gray-500">School events, parent meetings, and announcements</p>
                </div>
                <Switch
                  checked={communicationPrefs.eventNotifications}
                  onCheckedChange={(checked) => handleCommunicationPrefChange('eventNotifications', checked)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={saveCommunicationPreferences} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}