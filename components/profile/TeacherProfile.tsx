'use client'

import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Upload, X, FileText, Save, Loader2, CheckCircle, Clock } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { toast } from 'react-hot-toast'

const teacherProfileSchema = z.object({
  qualifications: z.string().min(10, 'Please provide your qualifications (minimum 10 characters)'),
  fieldOfStudy: z.string().min(1, 'Please enter your field of study'),
  experienceYears: z.number().min(0, 'Experience years must be 0 or more'),
  bio: z.string().min(50, 'Please provide a bio (minimum 50 characters)'),
})

type TeacherProfileForm = z.infer<typeof teacherProfileSchema>

const SUBJECTS = [
  'Mathematics', 'English', 'Science', 'Physics', 'Chemistry', 'Biology',
  'History', 'Geography', 'Computer Science', 'Art', 'Music', 'Physical Education',
  'Foreign Languages', 'Literature', 'Economics', 'Psychology', 'Philosophy',
  'Sociology', 'Political Science', 'Environmental Science', 'Statistics'
]

export default function TeacherProfile() {
  const { profile, teacherProfile, updateTeacherProfile } = useUser()
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(teacherProfile?.subjects || [])
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const resumeInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TeacherProfileForm>({
    resolver: zodResolver(teacherProfileSchema),
    defaultValues: {
      qualifications: teacherProfile?.qualifications || '',
      fieldOfStudy: teacherProfile?.field_of_study || '',
      experienceYears: teacherProfile?.experience_years || 0,
      bio: teacherProfile?.bio || '',
    },
  })

  const handleSubjectToggle = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    )
  }

  const handleResumeUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB')
      return
    }
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only PDF and Word documents are allowed')
      return
    }

    setResumeFile(file)
  }

  const removeResume = () => {
    setResumeFile(null)
    if (resumeInputRef.current) {
      resumeInputRef.current.value = ''
    }
  }

  const onSubmit = async (data: TeacherProfileForm) => {
    if (selectedSubjects.length === 0) {
      toast.error('Please select at least one subject you can teach')
      return
    }

    setIsLoading(true)

    try {
      // Upload resume if changed
      let resumeUrl = teacherProfile?.resume_url
      
      if (resumeFile) {
        const formData = new FormData()
        formData.append('file', resumeFile)
        formData.append('type', 'resume')
        
        const uploadResponse = await fetch('/api/profile/upload-document', {
          method: 'POST',
          body: formData,
        })
        
        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json()
          resumeUrl = url
        } else {
          throw new Error('Failed to upload resume')
        }
      }

      // Update teacher profile
      const { error } = await updateTeacherProfile({
        qualifications: data.qualifications,
        field_of_study: data.fieldOfStudy,
        experience_years: data.experienceYears,
        subjects: selectedSubjects,
        bio: data.bio,
        resume_url: resumeUrl,
      })

      if (error) {
        throw new Error(error)
      }

      toast.success('Teacher profile updated successfully!')
      setResumeFile(null)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update teacher profile')
    } finally {
      setIsLoading(false)
    }
  }

  const getApprovalStatus = () => {
    if (teacherProfile?.is_approved) {
      return { status: 'approved', label: 'Approved', color: 'default', icon: CheckCircle }
    }
    
    if (teacherProfile?.qualifications && teacherProfile?.bio) {
      return { status: 'pending', label: 'Pending Approval', color: 'secondary', icon: Clock }
    }
    
    return { status: 'incomplete', label: 'Profile Incomplete', color: 'secondary', icon: X }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const approvalStatus = getApprovalStatus()
  const StatusIcon = approvalStatus.icon

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Teacher Profile</h1>
            <p className="text-gray-600">Manage your teaching credentials and information</p>
          </div>
          <Badge 
            variant={approvalStatus.color as any}
            className="flex items-center space-x-1"
          >
            <StatusIcon className="h-3 w-3" />
            <span>{approvalStatus.label}</span>
          </Badge>
        </div>
      </div>

      {/* Approval Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Approval Status</CardTitle>
          <CardDescription>Current status of your teacher profile</CardDescription>
        </CardHeader>
        <CardContent>
          {approvalStatus.status === 'approved' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Profile Approved</p>
                  <p className="text-sm text-green-700">
                    Your teacher profile has been approved. You can now create courses and conduct live classes.
                  </p>
                  {teacherProfile?.approval_date && (
                    <p className="text-xs text-green-600 mt-1">
                      Approved on {new Date(teacherProfile.approval_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {approvalStatus.status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-900">Under Review</p>
                  <p className="text-sm text-yellow-700">
                    Your teacher profile is being reviewed by our admin team. This usually takes 24-48 hours.
                    You'll receive an email notification once approved.
                  </p>
                </div>
              </div>
            </div>
          )}

          {approvalStatus.status === 'incomplete' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <X className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Complete Your Profile</p>
                  <p className="text-sm text-blue-700">
                    Please complete all required fields below to submit your profile for approval.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
            <CardDescription>
              Provide details about your educational background and experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qualifications">Qualifications *</Label>
              <Input
                id="qualifications"
                placeholder="e.g., M.Ed in Mathematics, B.Sc in Physics, Teaching Certificate"
                {...register('qualifications')}
              />
              {errors.qualifications && (
                <p className="text-sm text-red-600">{errors.qualifications.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fieldOfStudy">Field of Study *</Label>
                <Input
                  id="fieldOfStudy"
                  placeholder="e.g., Mathematics Education, English Literature"
                  {...register('fieldOfStudy')}
                />
                {errors.fieldOfStudy && (
                  <p className="text-sm text-red-600">{errors.fieldOfStudy.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="experienceYears">Years of Experience *</Label>
                <Input
                  id="experienceYears"
                  type="number"
                  min="0"
                  placeholder="0"
                  {...register('experienceYears', { valueAsNumber: true })}
                />
                {errors.experienceYears && (
                  <p className="text-sm text-red-600">{errors.experienceYears.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subjects */}
        <Card>
          <CardHeader>
            <CardTitle>Subjects You Can Teach *</CardTitle>
            <CardDescription>
              Select all subjects you are qualified to teach
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {SUBJECTS.map((subject) => (
                <div key={subject} className="flex items-center space-x-2">
                  <Checkbox
                    id={subject}
                    checked={selectedSubjects.includes(subject)}
                    onCheckedChange={() => handleSubjectToggle(subject)}
                  />
                  <Label htmlFor={subject} className="text-sm">
                    {subject}
                  </Label>
                </div>
              ))}
            </div>
            {selectedSubjects.length === 0 && (
              <p className="text-sm text-red-600 mt-2">Please select at least one subject</p>
            )}
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Selected subjects:</p>
              <div className="flex flex-wrap gap-2">
                {selectedSubjects.map((subject) => (
                  <Badge key={subject} variant="secondary">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        <Card>
          <CardHeader>
            <CardTitle>Teaching Bio *</CardTitle>
            <CardDescription>
              Write a compelling bio that showcases your teaching philosophy and experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Textarea
                rows={6}
                placeholder="Tell students about your teaching experience, methodology, achievements, and what makes you passionate about teaching..."
                {...register('bio')}
              />
              {errors.bio && (
                <p className="text-sm text-red-600">{errors.bio.message}</p>
              )}
              <p className="text-sm text-gray-500">
                This will be displayed on your teacher profile and course pages.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Resume Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Resume/CV</CardTitle>
            <CardDescription>
              Upload your resume or CV for additional verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Current Resume */}
              {teacherProfile?.resume_url && !resumeFile && (
                <div className="bg-gray-50 border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div>
                        <p className="font-medium">Current Resume</p>
                        <p className="text-sm text-gray-500">Uploaded previously</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(teacherProfile.resume_url, '_blank')}
                      >
                        View
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => resumeInputRef.current?.click()}
                      >
                        Replace
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* New Resume Upload */}
              {resumeFile ? (
                <div className="bg-gray-50 border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="font-medium">{resumeFile.name}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(resumeFile.size)}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeResume}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => resumeInputRef.current?.click()}
                      >
                        {teacherProfile?.resume_url ? 'Upload New Resume' : 'Upload Resume'}
                      </Button>
                      <p className="mt-2 text-sm text-gray-500">
                        PDF or Word document (max 10MB)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <input
                ref={resumeInputRef}
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleResumeUpload}
                className="hidden"
              />
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
  )
}