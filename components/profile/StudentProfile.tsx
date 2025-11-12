'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Save, Loader2, User, Link as LinkIcon, Unlink } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { toast } from 'react-hot-toast'

const studentProfileSchema = z.object({
  previousSchool: z.string().optional(),
  gradeLevel: z.string().min(1, 'Please select your grade level'),
  academicYear: z.string().min(1, 'Please select academic year'),
  englishLevel: z.string().min(1, 'Please select your English level'),
  purpose: z.string().min(1, 'Please select your learning purpose'),
  learningSchedule: z.string().min(1, 'Please select your preferred schedule'),
})

type StudentProfileForm = z.infer<typeof studentProfileSchema>

const GRADE_LEVELS = [
  'Pre-K', 'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
]

const ENGLISH_LEVELS = [
  'Beginner', 'Elementary', 'Pre-Intermediate', 'Intermediate', 
  'Upper-Intermediate', 'Advanced', 'Proficient'
]

const LEARNING_PURPOSES = [
  'Academic Excellence', 'Exam Preparation', 'Skill Development', 
  'Career Advancement', 'Personal Interest', 'Language Improvement'
]

const SCHEDULES = [
  'Weekday Mornings', 'Weekday Afternoons', 'Weekday Evenings',
  'Weekend Mornings', 'Weekend Afternoons', 'Flexible/Any Time'
]

const ACADEMIC_YEARS = [
  '2024-25', '2025-26', '2026-27'
]

interface ParentLinkRequest {
  id: string
  parentName: string
  parentEmail: string
  status: 'pending' | 'approved' | 'rejected'
  requestedAt: string
}

export default function StudentProfile() {
  const { profile, studentProfile, updateStudentProfile } = useUser()
  const [isLoading, setIsLoading] = useState(false)
  const [parentEmail, setParentEmail] = useState('')
  const [isLinkingParent, setIsLinkingParent] = useState(false)
  
  // Mock data for parent link requests - in real app, fetch from API
  const [parentLinkRequests] = useState<ParentLinkRequest[]>([
    {
      id: '1',
      parentName: 'John Doe',
      parentEmail: 'john.doe@email.com',
      status: 'pending',
      requestedAt: '2024-01-15T10:30:00Z'
    }
  ])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<StudentProfileForm>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      previousSchool: studentProfile?.previous_school || '',
      gradeLevel: studentProfile?.grade_level || '',
      academicYear: studentProfile?.academic_year || '',
      englishLevel: studentProfile?.english_level || '',
      purpose: studentProfile?.purpose || '',
      learningSchedule: studentProfile?.learning_schedule || '',
    },
  })

  const onSubmit = async (data: StudentProfileForm) => {
    setIsLoading(true)

    try {
      const { error } = await updateStudentProfile({
        previous_school: data.previousSchool,
        grade_level: data.gradeLevel,
        academic_year: data.academicYear,
        english_level: data.englishLevel,
        purpose: data.purpose,
        learning_schedule: data.learningSchedule,
      })

      if (error) {
        throw new Error(error)
      }

      toast.success('Student profile updated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update student profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLinkParent = async () => {
    if (!parentEmail.trim()) {
      toast.error('Please enter parent email address')
      return
    }

    setIsLinkingParent(true)

    try {
      const response = await fetch('/api/profile/link-parent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parentEmail: parentEmail.trim(),
        }),
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error)
      }

      toast.success('Parent link request sent successfully!')
      setParentEmail('')
    } catch (error: any) {
      toast.error(error.message || 'Failed to send parent link request')
    } finally {
      setIsLinkingParent(false)
    }
  }

  const handleUnlinkParent = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/profile/unlink-parent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const { error } = await response.json()
        throw new Error(error)
      }

      toast.success('Parent account unlinked successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to unlink parent account')
    } finally {
      setIsLoading(false)
    }
  }

  const getStudentTypeLabel = () => {
    switch (studentProfile?.student_type) {
      case 'online_school':
        return 'Online School Student'
      case 'spoken_english':
        return 'Spoken English Student'
      default:
        return 'Student'
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Student Profile</h1>
            <p className="text-gray-600">Manage your academic information and learning preferences</p>
          </div>
          <Badge variant="secondary">
            {getStudentTypeLabel()}
          </Badge>
        </div>
      </div>

      <div className="space-y-6">
        {/* Parent Link Section */}
        <Card>
          <CardHeader>
            <CardTitle>Parent Account</CardTitle>
            <CardDescription>
              Link your account with a parent for monitoring and support
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {studentProfile?.parent_id ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Parent Account Linked</p>
                      <p className="text-sm text-green-700">
                        Your parent can monitor your progress and communicate with teachers
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUnlinkParent}
                    disabled={isLoading}
                  >
                    <Unlink className="mr-2 h-4 w-4" />
                    Unlink
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter parent's email address"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    type="email"
                  />
                  <Button
                    onClick={handleLinkParent}
                    disabled={isLinkingParent}
                  >
                    {isLinkingParent ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Send Request
                      </>
                    )}
                  </Button>
                </div>

                {/* Pending Requests */}
                {parentLinkRequests.length > 0 && (
                  <div className="space-y-2">
                    <Label>Pending Requests</Label>
                    {parentLinkRequests.map((request) => (
                      <div key={request.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-yellow-900">{request.parentName}</p>
                            <p className="text-sm text-yellow-700">{request.parentEmail}</p>
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Academic Information */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
              <CardDescription>
                Update your academic details and grade level
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="previousSchool">Previous School (Optional)</Label>
                <Input
                  id="previousSchool"
                  placeholder="Enter your previous school name"
                  {...register('previousSchool')}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Grade Level *</Label>
                  <Select onValueChange={(value) => setValue('gradeLevel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade level" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRADE_LEVELS.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.gradeLevel && (
                    <p className="text-sm text-red-600">{errors.gradeLevel.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Academic Year *</Label>
                  <Select onValueChange={(value) => setValue('academicYear', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACADEMIC_YEARS.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.academicYear && (
                    <p className="text-sm text-red-600">{errors.academicYear.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Preferences</CardTitle>
              <CardDescription>
                Help us customize your learning experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>English Level *</Label>
                <Select onValueChange={(value) => setValue('englishLevel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your English level" />
                  </SelectTrigger>
                  <SelectContent>
                    {ENGLISH_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.englishLevel && (
                  <p className="text-sm text-red-600">{errors.englishLevel.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Learning Purpose *</Label>
                <Select onValueChange={(value) => setValue('purpose', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Why do you want to learn?" />
                  </SelectTrigger>
                  <SelectContent>
                    {LEARNING_PURPOSES.map((purpose) => (
                      <SelectItem key={purpose} value={purpose}>
                        {purpose}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.purpose && (
                  <p className="text-sm text-red-600">{errors.purpose.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Preferred Schedule *</Label>
                <Select onValueChange={(value) => setValue('learningSchedule', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="When do you prefer to learn?" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHEDULES.map((schedule) => (
                      <SelectItem key={schedule} value={schedule}>
                        {schedule}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.learningSchedule && (
                  <p className="text-sm text-red-600">{errors.learningSchedule.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Learning Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Goals</CardTitle>
              <CardDescription>
                Set your academic and personal learning objectives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Short-term Goals (This Semester)</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Complete all assigned courses</li>
                    <li>• Maintain good attendance in live classes</li>
                    <li>• Submit assignments on time</li>
                    <li>• Participate actively in discussions</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Long-term Goals (This Year)</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Improve English proficiency level</li>
                    <li>• Achieve target grades in all subjects</li>
                    <li>• Develop critical thinking skills</li>
                    <li>• Prepare for next academic level</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
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
      </div>
    </div>
  )
}