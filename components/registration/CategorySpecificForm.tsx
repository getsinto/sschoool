'use client'

import { UserType, ValidationErrors, GRADE_LEVELS, ACADEMIC_YEARS, QUALIFICATIONS, SUBJECTS } from '@/types/registration'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Upload, FileText, X } from 'lucide-react'
import { useState } from 'react'

interface CategorySpecificFormProps {
  userType: UserType
  data: any
  errors: ValidationErrors
  onChange: (data: any) => void
  onNext: () => void
  onBack: () => void
  uploadFile: (file: File, type: 'id_front' | 'id_back' | 'profile_photo' | 'selfie_with_id' | 'resume') => Promise<string>
}

export function CategorySpecificForm({ 
  userType, 
  data, 
  errors, 
  onChange, 
  onNext, 
  onBack,
  uploadFile 
}: CategorySpecificFormProps) {
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (file: File, type: 'id_front' | 'id_back' | 'profile_photo' | 'selfie_with_id' | 'resume') => {
    setUploading(true)
    try {
      const url = await uploadFile(file, type)
      onChange({ ...data, [`${type}Url`]: url })
    } catch (error) {
      console.error('File upload failed:', error)
    } finally {
      setUploading(false)
    }
  }

  const renderStudentForm = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="previousSchool">Previous School Name *</Label>
        <Input
          id="previousSchool"
          value={data.previousSchool || ''}
          onChange={(e) => onChange({ ...data, previousSchool: e.target.value })}
          placeholder="Name of your previous school"
          className={errors.previousSchool ? 'border-red-500' : ''}
        />
        {errors.previousSchool && (
          <p className="text-sm text-red-600 mt-1">{errors.previousSchool}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gradeLevel">Grade/Standard *</Label>
          <Select 
            value={data.gradeLevel || ''} 
            onValueChange={(value) => onChange({ ...data, gradeLevel: value })}
          >
            <SelectTrigger className={errors.gradeLevel ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select your grade" />
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
            <p className="text-sm text-red-600 mt-1">{errors.gradeLevel}</p>
          )}
        </div>

        <div>
          <Label htmlFor="academicYear">Academic Year *</Label>
          <Select 
            value={data.academicYear || ''} 
            onValueChange={(value) => onChange({ ...data, academicYear: value })}
          >
            <SelectTrigger className={errors.academicYear ? 'border-red-500' : ''}>
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
            <p className="text-sm text-red-600 mt-1">{errors.academicYear}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="parentEmail">Parent/Guardian Email (Optional)</Label>
        <Input
          id="parentEmail"
          type="email"
          value={data.parentEmail || ''}
          onChange={(e) => onChange({ ...data, parentEmail: e.target.value })}
          placeholder="parent@example.com"
          className={errors.parentEmail ? 'border-red-500' : ''}
        />
        {errors.parentEmail && (
          <p className="text-sm text-red-600 mt-1">{errors.parentEmail}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          We'll send a link request to your parent for monitoring your progress
        </p>
      </div>

      <div>
        <Label htmlFor="howDidYouHear">How did you hear about us?</Label>
        <Select 
          value={data.howDidYouHear || ''} 
          onValueChange={(value) => onChange({ ...data, howDidYouHear: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="google">Google Search</SelectItem>
            <SelectItem value="social_media">Social Media</SelectItem>
            <SelectItem value="friend_referral">Friend Referral</SelectItem>
            <SelectItem value="advertisement">Advertisement</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  const renderTeacherForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="qualification">Highest Qualification *</Label>
          <Select 
            value={data.qualification || ''} 
            onValueChange={(value) => onChange({ ...data, qualification: value })}
          >
            <SelectTrigger className={errors.qualification ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select qualification" />
            </SelectTrigger>
            <SelectContent>
              {QUALIFICATIONS.map((qual) => (
                <SelectItem key={qual} value={qual}>
                  {qual}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.qualification && (
            <p className="text-sm text-red-600 mt-1">{errors.qualification}</p>
          )}
        </div>

        <div>
          <Label htmlFor="fieldOfStudy">Field of Study *</Label>
          <Input
            id="fieldOfStudy"
            value={data.fieldOfStudy || ''}
            onChange={(e) => onChange({ ...data, fieldOfStudy: e.target.value })}
            placeholder="e.g., Mathematics, Physics, English Literature"
            className={errors.fieldOfStudy ? 'border-red-500' : ''}
          />
          {errors.fieldOfStudy && (
            <p className="text-sm text-red-600 mt-1">{errors.fieldOfStudy}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="teachingExperience">Teaching Experience (Years) *</Label>
          <Input
            id="teachingExperience"
            type="number"
            min="0"
            max="50"
            value={data.teachingExperience || ''}
            onChange={(e) => onChange({ ...data, teachingExperience: parseInt(e.target.value) || 0 })}
            placeholder="0"
            className={errors.teachingExperience ? 'border-red-500' : ''}
          />
          {errors.teachingExperience && (
            <p className="text-sm text-red-600 mt-1">{errors.teachingExperience}</p>
          )}
        </div>

        <div>
          <Label htmlFor="onlineTeachingExperience">Online Teaching Experience (Years)</Label>
          <Input
            id="onlineTeachingExperience"
            type="number"
            min="0"
            max="30"
            value={data.onlineTeachingExperience || ''}
            onChange={(e) => onChange({ ...data, onlineTeachingExperience: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <Label>Subjects You Can Teach *</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
          {SUBJECTS.map((subject) => (
            <div key={subject} className="flex items-center space-x-2">
              <Checkbox
                id={subject}
                checked={data.subjectsToTeach?.includes(subject) || false}
                onCheckedChange={(checked) => {
                  const current = data.subjectsToTeach || []
                  if (checked) {
                    onChange({ ...data, subjectsToTeach: [...current, subject] })
                  } else {
                    onChange({ ...data, subjectsToTeach: current.filter((s: string) => s !== subject) })
                  }
                }}
              />
              <Label htmlFor={subject} className="text-sm">
                {subject}
              </Label>
            </div>
          ))}
        </div>
        {errors.subjectsToTeach && (
          <p className="text-sm text-red-600 mt-1">{errors.subjectsToTeach}</p>
        )}
      </div>

      <div>
        <Label htmlFor="bio">Short Bio *</Label>
        <Textarea
          id="bio"
          value={data.bio || ''}
          onChange={(e) => onChange({ ...data, bio: e.target.value })}
          placeholder="Tell us about your teaching experience and approach..."
          rows={5}
          className={errors.bio ? 'border-red-500' : ''}
        />
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>{data.bio?.length || 0}/500 characters</span>
          {errors.bio && (
            <span className="text-red-600">{errors.bio}</span>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="linkedinProfile">LinkedIn Profile (Optional)</Label>
        <Input
          id="linkedinProfile"
          type="url"
          value={data.linkedinProfile || ''}
          onChange={(e) => onChange({ ...data, linkedinProfile: e.target.value })}
          placeholder="https://linkedin.com/in/yourprofile"
          className={errors.linkedinProfile ? 'border-red-500' : ''}
        />
        {errors.linkedinProfile && (
          <p className="text-sm text-red-600 mt-1">{errors.linkedinProfile}</p>
        )}
      </div>

      <div>
        <Label>Resume/CV Upload (Optional but recommended)</Label>
        <div className="mt-2">
          {data.resumeUrl ? (
            <div className="flex items-center justify-between p-3 border border-green-200 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-green-600" />
                <span className="text-sm text-green-800">Resume uploaded successfully</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onChange({ ...data, resumeUrl: '' })}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="resume-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Upload your resume
                  </span>
                  <span className="mt-1 block text-sm text-gray-500">
                    PDF only, max 5MB
                  </span>
                </label>
                <input
                  id="resume-upload"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, 'resume')
                  }}
                  disabled={uploading}
                />
              </div>
              {uploading && (
                <div className="mt-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderParentForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="relationship">Relationship to Student *</Label>
          <Select 
            value={data.relationship || ''} 
            onValueChange={(value) => onChange({ ...data, relationship: value })}
          >
            <SelectTrigger className={errors.relationship ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select relationship" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="father">Father</SelectItem>
              <SelectItem value="mother">Mother</SelectItem>
              <SelectItem value="legal_guardian">Legal Guardian</SelectItem>
              <SelectItem value="grandparent">Grandparent</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.relationship && (
            <p className="text-sm text-red-600 mt-1">{errors.relationship}</p>
          )}
        </div>

        <div>
          <Label htmlFor="occupation">Occupation</Label>
          <Input
            id="occupation"
            value={data.occupation || ''}
            onChange={(e) => onChange({ ...data, occupation: e.target.value })}
            placeholder="Your occupation"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="numberOfChildren">Number of Children to Enroll *</Label>
        <Input
          id="numberOfChildren"
          type="number"
          min="1"
          max="10"
          value={data.numberOfChildren || ''}
          onChange={(e) => onChange({ ...data, numberOfChildren: parseInt(e.target.value) || 1 })}
          className={errors.numberOfChildren ? 'border-red-500' : ''}
        />
        {errors.numberOfChildren && (
          <p className="text-sm text-red-600 mt-1">{errors.numberOfChildren}</p>
        )}
      </div>

      <div>
        <Label htmlFor="emergencyContact">Emergency Contact Number *</Label>
        <Input
          id="emergencyContact"
          type="tel"
          value={data.emergencyContact || ''}
          onChange={(e) => onChange({ ...data, emergencyContact: e.target.value })}
          placeholder="Emergency contact number"
          className={errors.emergencyContact ? 'border-red-500' : ''}
        />
        {errors.emergencyContact && (
          <p className="text-sm text-red-600 mt-1">{errors.emergencyContact}</p>
        )}
      </div>

      <div>
        <Label>Preferred Contact Method *</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
          {['email', 'phone', 'whatsapp', 'sms'].map((method) => (
            <div key={method} className="flex items-center space-x-2">
              <Checkbox
                id={method}
                checked={data.preferredContactMethod === method}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange({ ...data, preferredContactMethod: method })
                  }
                }}
              />
              <Label htmlFor={method} className="text-sm capitalize">
                {method}
              </Label>
            </div>
          ))}
        </div>
        {errors.preferredContactMethod && (
          <p className="text-sm text-red-600 mt-1">{errors.preferredContactMethod}</p>
        )}
      </div>

      <div>
        <Label htmlFor="howDidYouHear">How did you hear about us?</Label>
        <Select 
          value={data.howDidYouHear || ''} 
          onValueChange={(value) => onChange({ ...data, howDidYouHear: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="google">Google Search</SelectItem>
            <SelectItem value="social_media">Social Media</SelectItem>
            <SelectItem value="friend_referral">Friend Referral</SelectItem>
            <SelectItem value="advertisement">Advertisement</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  const renderSpokenEnglishForm = () => (
    <div className="space-y-6">
      <div>
        <Label>Current English Level *</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {[
            { value: 'zero', title: 'Zero', desc: 'Never learned English' },
            { value: 'beginner', title: 'Beginner', desc: 'Basic words and phrases' },
            { value: 'intermediate', title: 'Intermediate', desc: 'Can have simple conversations' },
            { value: 'advanced', title: 'Advanced', desc: 'Fluent but want to improve' }
          ].map((level) => (
            <Card 
              key={level.value}
              className={`cursor-pointer transition-all ${
                data.englishLevel === level.value 
                  ? 'ring-2 ring-blue-500 border-blue-500' 
                  : 'hover:border-blue-300'
              }`}
              onClick={() => onChange({ ...data, englishLevel: level.value })}
            >
              <CardContent className="p-4 text-center">
                <h4 className="font-medium">{level.title}</h4>
                <p className="text-sm text-gray-600">{level.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        {errors.englishLevel && (
          <p className="text-sm text-red-600 mt-1">{errors.englishLevel}</p>
        )}
      </div>

      <div>
        <Label htmlFor="ageGroup">Age Group *</Label>
        <Select 
          value={data.ageGroup || ''} 
          onValueChange={(value) => onChange({ ...data, ageGroup: value })}
        >
          <SelectTrigger className={errors.ageGroup ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select age group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6-12">6-12 years (Kids)</SelectItem>
            <SelectItem value="13-17">13-17 years (Teens)</SelectItem>
            <SelectItem value="18-25">18-25 years (Young Adults)</SelectItem>
            <SelectItem value="26-40">26-40 years (Adults)</SelectItem>
            <SelectItem value="41+">41+ years (Senior Adults)</SelectItem>
          </SelectContent>
        </Select>
        {errors.ageGroup && (
          <p className="text-sm text-red-600 mt-1">{errors.ageGroup}</p>
        )}
      </div>

      <div>
        <Label>Purpose of Learning English * (Select all that apply)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          {[
            'Academic/School',
            'Career/Job',
            'Travel',
            'Immigration (IELTS/TOEFL prep)',
            'Personal Interest',
            'Business Communication',
            'Other'
          ].map((purpose) => (
            <div key={purpose} className="flex items-center space-x-2">
              <Checkbox
                id={purpose}
                checked={data.purposeOfLearning?.includes(purpose) || false}
                onCheckedChange={(checked) => {
                  const current = data.purposeOfLearning || []
                  if (checked) {
                    onChange({ ...data, purposeOfLearning: [...current, purpose] })
                  } else {
                    onChange({ ...data, purposeOfLearning: current.filter((p: string) => p !== purpose) })
                  }
                }}
              />
              <Label htmlFor={purpose} className="text-sm">
                {purpose}
              </Label>
            </div>
          ))}
        </div>
        {errors.purposeOfLearning && (
          <p className="text-sm text-red-600 mt-1">{errors.purposeOfLearning}</p>
        )}
      </div>

      <div>
        <Label>Preferred Learning Schedule * (Select all that apply)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
          {[
            'Weekday Mornings (6 AM - 12 PM)',
            'Weekday Afternoons (12 PM - 6 PM)',
            'Weekday Evenings (6 PM - 10 PM)',
            'Weekend Mornings',
            'Weekend Evenings',
            'Flexible / Anytime'
          ].map((schedule) => (
            <div key={schedule} className="flex items-center space-x-2">
              <Checkbox
                id={schedule}
                checked={data.learningSchedule?.includes(schedule) || false}
                onCheckedChange={(checked) => {
                  const current = data.learningSchedule || []
                  if (checked) {
                    onChange({ ...data, learningSchedule: [...current, schedule] })
                  } else {
                    onChange({ ...data, learningSchedule: current.filter((s: string) => s !== schedule) })
                  }
                }}
              />
              <Label htmlFor={schedule} className="text-sm">
                {schedule}
              </Label>
            </div>
          ))}
        </div>
        {errors.learningSchedule && (
          <p className="text-sm text-red-600 mt-1">{errors.learningSchedule}</p>
        )}
      </div>

      <div>
        <Label htmlFor="nativeLanguage">Native Language *</Label>
        <Input
          id="nativeLanguage"
          value={data.nativeLanguage || ''}
          onChange={(e) => onChange({ ...data, nativeLanguage: e.target.value })}
          placeholder="Your native language"
          className={errors.nativeLanguage ? 'border-red-500' : ''}
        />
        {errors.nativeLanguage && (
          <p className="text-sm text-red-600 mt-1">{errors.nativeLanguage}</p>
        )}
      </div>

      <div>
        <Label>Have you learned English before? *</Label>
        <div className="flex space-x-4 mt-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="previousLearning-yes"
              checked={data.previousLearning === true}
              onCheckedChange={(checked) => {
                if (checked) {
                  onChange({ ...data, previousLearning: true })
                }
              }}
            />
            <Label htmlFor="previousLearning-yes">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="previousLearning-no"
              checked={data.previousLearning === false}
              onCheckedChange={(checked) => {
                if (checked) {
                  onChange({ ...data, previousLearning: false, yearsOfLearning: undefined, whatStopped: '' })
                }
              }}
            />
            <Label htmlFor="previousLearning-no">No</Label>
          </div>
        </div>
        {errors.previousLearning && (
          <p className="text-sm text-red-600 mt-1">{errors.previousLearning}</p>
        )}
      </div>

      {data.previousLearning && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="yearsOfLearning">For how many years?</Label>
            <Input
              id="yearsOfLearning"
              type="number"
              min="0"
              value={data.yearsOfLearning || ''}
              onChange={(e) => onChange({ ...data, yearsOfLearning: parseInt(e.target.value) || 0 })}
              placeholder="Number of years"
            />
          </div>
          <div>
            <Label htmlFor="whatStopped">What stopped you?</Label>
            <Textarea
              id="whatStopped"
              value={data.whatStopped || ''}
              onChange={(e) => onChange({ ...data, whatStopped: e.target.value })}
              placeholder="Why did you stop learning?"
              rows={2}
            />
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="learningGoals">Learning Goals (Optional)</Label>
        <Textarea
          id="learningGoals"
          value={data.learningGoals || ''}
          onChange={(e) => onChange({ ...data, learningGoals: e.target.value })}
          placeholder="What do you hope to achieve? (e.g., speak fluently, pass IELTS, business communication)"
          rows={4}
        />
        <div className="text-sm text-gray-500 mt-1">
          {data.learningGoals?.length || 0}/500 characters
        </div>
      </div>

      <div>
        <Label>Preferred Lesson Duration *</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
          {[30, 45, 60, 90].map((duration) => (
            <div key={duration} className="flex items-center space-x-2">
              <Checkbox
                id={`duration-${duration}`}
                checked={data.preferredLessonDuration === duration}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange({ ...data, preferredLessonDuration: duration })
                  }
                }}
              />
              <Label htmlFor={`duration-${duration}`} className="text-sm">
                {duration} minutes
              </Label>
            </div>
          ))}
        </div>
        {errors.preferredLessonDuration && (
          <p className="text-sm text-red-600 mt-1">{errors.preferredLessonDuration}</p>
        )}
      </div>
    </div>
  )

  const getTitle = () => {
    switch (userType) {
      case 'student': return 'Student Information'
      case 'teacher': return 'Teaching Background'
      case 'parent': return 'Parent Information'
      case 'spoken_english': return 'Learning Preferences'
      default: return 'Additional Information'
    }
  }

  const getDescription = () => {
    switch (userType) {
      case 'student': return 'Tell us about your academic background'
      case 'teacher': return 'Share your teaching qualifications and experience'
      case 'parent': return 'Provide details about your family and preferences'
      case 'spoken_english': return 'Help us understand your English learning goals'
      default: return 'Please provide additional information'
    }
  }

  const renderForm = () => {
    switch (userType) {
      case 'student': return renderStudentForm()
      case 'teacher': return renderTeacherForm()
      case 'parent': return renderParentForm()
      case 'spoken_english': return renderSpokenEnglishForm()
      default: return <div>Invalid user type</div>
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{getTitle()}</CardTitle>
          <p className="text-sm text-gray-600">
            {getDescription()}
          </p>
        </CardHeader>
        <CardContent>
          {renderForm()}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={onNext}>
              Continue to ID Verification
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}