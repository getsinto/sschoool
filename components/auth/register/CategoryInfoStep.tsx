'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RegistrationData } from '@/app/(auth)/register/page'
import { useState } from 'react'

// Define schemas for different user types
const studentSchema = z.object({
  previousSchool: z.string().optional(),
  gradeLevel: z.string().min(1, 'Please select your grade level'),
  academicYear: z.string().min(1, 'Please select academic year'),
  englishLevel: z.string().min(1, 'Please select your English level'),
  purpose: z.string().min(1, 'Please select your learning purpose'),
  learningSchedule: z.string().min(1, 'Please select your preferred schedule'),
})

const teacherSchema = z.object({
  qualifications: z.string().min(10, 'Please provide your qualifications (minimum 10 characters)'),
  fieldOfStudy: z.string().min(1, 'Please enter your field of study'),
  experienceYears: z.number().min(0, 'Experience years must be 0 or more'),
  subjects: z.array(z.string()).min(1, 'Please select at least one subject'),
  bio: z.string().min(50, 'Please provide a bio (minimum 50 characters)'),
})

const parentSchema = z.object({
  relationship: z.string().min(1, 'Please specify your relationship'),
  occupation: z.string().min(1, 'Please enter your occupation'),
})

interface CategoryInfoStepProps {
  data: RegistrationData
  updateData: (updates: Partial<RegistrationData>) => void
  onNext: () => void
  onPrev: () => void
}

const GRADE_LEVELS = [
  'Pre-K', 'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
]

const ENGLISH_LEVELS = [
  'Beginner', 'Elementary', 'Pre-Intermediate', 'Intermediate', 
  'Upper-Intermediate', 'Advanced', 'Proficient'
]

const SUBJECTS = [
  'Mathematics', 'English', 'Science', 'Physics', 'Chemistry', 'Biology',
  'History', 'Geography', 'Computer Science', 'Art', 'Music', 'Physical Education',
  'Foreign Languages', 'Literature', 'Economics', 'Psychology'
]

const LEARNING_PURPOSES = [
  'Academic Excellence', 'Exam Preparation', 'Skill Development', 
  'Career Advancement', 'Personal Interest', 'Language Improvement'
]

const SCHEDULES = [
  'Weekday Mornings', 'Weekday Afternoons', 'Weekday Evenings',
  'Weekend Mornings', 'Weekend Afternoons', 'Flexible/Any Time'
]

const RELATIONSHIPS = [
  'Mother', 'Father', 'Guardian', 'Grandmother', 'Grandfather', 'Other'
]

export default function CategoryInfoStep({ data, updateData, onNext, onPrev }: CategoryInfoStepProps) {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(data.subjects || [])

  const getSchema = () => {
    switch (data.userType) {
      case 'student':
      case 'spoken_english':
        return studentSchema
      case 'teacher':
        return teacherSchema
      case 'parent':
        return parentSchema
      default:
        return z.object({})
    }
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: {
      previousSchool: data.previousSchool || '',
      gradeLevel: data.gradeLevel || '',
      academicYear: data.academicYear || '',
      englishLevel: data.englishLevel || '',
      purpose: data.purpose || '',
      learningSchedule: data.learningSchedule || '',
      qualifications: data.qualifications || '',
      fieldOfStudy: data.fieldOfStudy || '',
      experienceYears: data.experienceYears || 0,
      bio: data.bio || '',
      relationship: data.relationship || '',
      occupation: data.occupation || '',
    },
  })

  const onSubmit = (formData: any) => {
    const updates: Partial<RegistrationData> = { ...formData }
    if (data.userType === 'teacher') {
      updates.subjects = selectedSubjects
    }
    updateData(updates)
    onNext()
  }

  const handleSubjectToggle = (subject: string) => {
    const newSubjects = selectedSubjects.includes(subject)
      ? selectedSubjects.filter(s => s !== subject)
      : [...selectedSubjects, subject]
    setSelectedSubjects(newSubjects)
    setValue('subjects', newSubjects)
  }

  const renderStudentForm = () => (
    <div className="space-y-4">
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
              <SelectItem value="2024-25">2024-25</SelectItem>
              <SelectItem value="2025-26">2025-26</SelectItem>
            </SelectContent>
          </Select>
          {errors.academicYear && (
            <p className="text-sm text-red-600">{errors.academicYear.message}</p>
          )}
        </div>
      </div>

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
    </div>
  )

  const renderTeacherForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="qualifications">Qualifications *</Label>
        <Input
          id="qualifications"
          placeholder="e.g., M.Ed in Mathematics, B.Sc in Physics"
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
            placeholder="e.g., Mathematics Education"
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

      <div className="space-y-2">
        <Label>Subjects You Can Teach *</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
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
        {errors.subjects && (
          <p className="text-sm text-red-600">{errors.subjects.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio *</Label>
        <textarea
          id="bio"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Tell us about yourself, your teaching philosophy, and experience..."
          {...register('bio')}
        />
        {errors.bio && (
          <p className="text-sm text-red-600">{errors.bio.message}</p>
        )}
      </div>
    </div>
  )

  const renderParentForm = () => (
    <div className="space-y-4">
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

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="text-yellow-600 mt-0.5">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-yellow-900 mb-1">
              Parent Account Information
            </h4>
            <p className="text-sm text-yellow-700">
              After registration, you'll be able to link your children's accounts and monitor their progress. 
              You can also manage payments and communicate with teachers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const getTitle = () => {
    switch (data.userType) {
      case 'student':
        return 'Student Information'
      case 'teacher':
        return 'Teaching Information'
      case 'parent':
        return 'Parent Information'
      case 'spoken_english':
        return 'Learning Preferences'
      default:
        return 'Additional Information'
    }
  }

  const getDescription = () => {
    switch (data.userType) {
      case 'student':
        return 'Tell us about your academic background and learning goals'
      case 'teacher':
        return 'Share your qualifications and teaching expertise'
      case 'parent':
        return 'Provide information about your relationship to the student'
      case 'spoken_english':
        return 'Help us customize your English learning experience'
      default:
        return 'Please provide additional information'
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold mb-2">{getTitle()}</h2>
        <p className="text-gray-600">{getDescription()}</p>
      </div>

      {(data.userType === 'student' || data.userType === 'spoken_english') && renderStudentForm()}
      {data.userType === 'teacher' && renderTeacherForm()}
      {data.userType === 'parent' && renderParentForm()}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onPrev}>
          Previous
        </Button>
        <Button type="submit">
          Continue
        </Button>
      </div>
    </form>
  )
}