'use client'

import { RoleSpecificData } from './CreateUserModal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

interface TeacherFieldsProps {
  data: RoleSpecificData
  onChange: (data: RoleSpecificData) => void
}

export default function TeacherFields({ data, onChange }: TeacherFieldsProps) {
  const handleSubjectsChange = (value: string) => {
    const subjects = value.split(',').map(s => s.trim()).filter(s => s)
    onChange({ ...data, subjects })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Qualifications */}
      <div className="md:col-span-2">
        <Label htmlFor="qualifications">Qualifications</Label>
        <Input
          id="qualifications"
          value={data.qualifications || ''}
          onChange={(e) => onChange({ ...data, qualifications: e.target.value })}
          placeholder="e.g., Bachelor's in Education, Master's in Mathematics"
          className="mt-1"
        />
      </div>

      {/* Field of Study */}
      <div>
        <Label htmlFor="fieldOfStudy">Field of Study</Label>
        <Input
          id="fieldOfStudy"
          value={data.fieldOfStudy || ''}
          onChange={(e) => onChange({ ...data, fieldOfStudy: e.target.value })}
          placeholder="e.g., Mathematics, English Literature"
          className="mt-1"
        />
      </div>

      {/* Experience Years */}
      <div>
        <Label htmlFor="experienceYears">Years of Experience</Label>
        <Input
          id="experienceYears"
          type="number"
          min="0"
          value={data.experienceYears || ''}
          onChange={(e) => onChange({ ...data, experienceYears: parseInt(e.target.value) || 0 })}
          placeholder="5"
          className="mt-1"
        />
      </div>

      {/* Subjects */}
      <div className="md:col-span-2">
        <Label htmlFor="subjects">Subjects (comma-separated)</Label>
        <Input
          id="subjects"
          value={data.subjects?.join(', ') || ''}
          onChange={(e) => handleSubjectsChange(e.target.value)}
          placeholder="Mathematics, Physics, Chemistry"
          className="mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter subjects separated by commas
        </p>
      </div>

      {/* Bio */}
      <div className="md:col-span-2">
        <Label htmlFor="bio">Bio/Description</Label>
        <Textarea
          id="bio"
          value={data.bio || ''}
          onChange={(e) => onChange({ ...data, bio: e.target.value })}
          placeholder="Brief description about the teacher..."
          className="mt-1"
          rows={4}
        />
      </div>

      {/* Pre-Approved */}
      <div className="md:col-span-2 flex items-center space-x-2">
        <Checkbox
          id="preApproved"
          checked={data.preApproved || false}
          onCheckedChange={(checked) =>
            onChange({ ...data, preApproved: checked as boolean })
          }
        />
        <Label htmlFor="preApproved" className="cursor-pointer">
          Pre-approve this teacher (skip verification process)
        </Label>
      </div>
    </div>
  )
}
