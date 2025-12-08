'use client'

import { RoleSpecificData } from './CreateUserModal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

interface StudentFieldsProps {
  data: RoleSpecificData
  onChange: (data: RoleSpecificData) => void
}

export default function StudentFields({ data, onChange }: StudentFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Student Type */}
      <div className="md:col-span-2">
        <Label htmlFor="studentType">
          Student Type <span className="text-red-500">*</span>
        </Label>
        <Select
          value={data.studentType || ''}
          onValueChange={(value) =>
            onChange({ ...data, studentType: value as 'online_school' | 'spoken_english' })
          }
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select student type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="online_school">Online School</SelectItem>
            <SelectItem value="spoken_english">Spoken English</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grade Level */}
      <div>
        <Label htmlFor="gradeLevel">Grade Level</Label>
        <Input
          id="gradeLevel"
          value={data.gradeLevel || ''}
          onChange={(e) => onChange({ ...data, gradeLevel: e.target.value })}
          placeholder="Grade 10"
          className="mt-1"
        />
      </div>

      {/* Academic Year */}
      <div>
        <Label htmlFor="academicYear">Academic Year</Label>
        <Input
          id="academicYear"
          value={data.academicYear || ''}
          onChange={(e) => onChange({ ...data, academicYear: e.target.value })}
          placeholder="2024-2025"
          className="mt-1"
        />
      </div>

      {/* Previous School */}
      <div className="md:col-span-2">
        <Label htmlFor="previousSchool">Previous School</Label>
        <Input
          id="previousSchool"
          value={data.previousSchool || ''}
          onChange={(e) => onChange({ ...data, previousSchool: e.target.value })}
          placeholder="Previous school name"
          className="mt-1"
        />
      </div>

      {/* English Level (for Spoken English students) */}
      {data.studentType === 'spoken_english' && (
        <div>
          <Label htmlFor="englishLevel">English Level</Label>
          <Select
            value={data.englishLevel || ''}
            onValueChange={(value) => onChange({ ...data, englishLevel: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="elementary">Elementary</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="upper_intermediate">Upper Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Learning Schedule */}
      <div>
        <Label htmlFor="learningSchedule">Preferred Learning Schedule</Label>
        <Input
          id="learningSchedule"
          value={data.learningSchedule || ''}
          onChange={(e) => onChange({ ...data, learningSchedule: e.target.value })}
          placeholder="Weekdays, Evenings, etc."
          className="mt-1"
        />
      </div>

      {/* Purpose */}
      <div className="md:col-span-2">
        <Label htmlFor="purpose">Purpose/Goals</Label>
        <Textarea
          id="purpose"
          value={data.purpose || ''}
          onChange={(e) => onChange({ ...data, purpose: e.target.value })}
          placeholder="What are the student's learning goals?"
          className="mt-1"
          rows={3}
        />
      </div>
    </div>
  )
}
