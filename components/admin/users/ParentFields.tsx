'use client'

import { RoleSpecificData } from './CreateUserModal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ParentFieldsProps {
  data: RoleSpecificData
  onChange: (data: RoleSpecificData) => void
}

export default function ParentFields({ data, onChange }: ParentFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Relationship */}
      <div>
        <Label htmlFor="relationship">Relationship to Student</Label>
        <Input
          id="relationship"
          value={data.relationship || ''}
          onChange={(e) => onChange({ ...data, relationship: e.target.value })}
          placeholder="e.g., Father, Mother, Guardian"
          className="mt-1"
        />
      </div>

      {/* Occupation */}
      <div>
        <Label htmlFor="occupation">Occupation</Label>
        <Input
          id="occupation"
          value={data.occupation || ''}
          onChange={(e) => onChange({ ...data, occupation: e.target.value })}
          placeholder="e.g., Engineer, Teacher"
          className="mt-1"
        />
      </div>

      {/* Linked Students */}
      <div className="md:col-span-2">
        <Label htmlFor="linkedStudents">Linked Student IDs (optional)</Label>
        <Input
          id="linkedStudents"
          value={data.linkedStudents?.join(', ') || ''}
          onChange={(e) => {
            const ids = e.target.value.split(',').map(s => s.trim()).filter(s => s)
            onChange({ ...data, linkedStudents: ids })
          }}
          placeholder="student-id-1, student-id-2"
          className="mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">
          Enter student IDs separated by commas. You can also link students later.
        </p>
      </div>
    </div>
  )
}
