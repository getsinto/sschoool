'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Users, Upload, X } from 'lucide-react'

interface RecipientSelectorProps {
  onRecipientsChange: (recipients: string[]) => void
  selectedRecipients: string[]
}

export default function RecipientSelector({ onRecipientsChange, selectedRecipients }: RecipientSelectorProps) {
  const [selectionType, setSelectionType] = useState<'all' | 'role' | 'course' | 'custom' | 'csv'>('all')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])

  const roles = ['Students', 'Teachers', 'Parents']
  const courses = ['Mathematics Grade 10', 'Physics Grade 11', 'Chemistry Grade 9']

  const toggleRole = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    )
  }

  const toggleCourse = (course: string) => {
    setSelectedCourses(prev =>
      prev.includes(course) ? prev.filter(c => c !== course) : [...prev, course]
    )
  }

  const estimatedCount = selectionType === 'all' ? 1250 : 
                        selectionType === 'role' ? selectedRoles.length * 300 :
                        selectionType === 'course' ? selectedCourses.length * 50 : 0

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Select Recipients</h3>
          <Badge variant="outline">
            <Users className="w-3 h-3 mr-1" />
            ~{estimatedCount} recipients
          </Badge>
        </div>

        {/* Selection Type */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              checked={selectionType === 'all'}
              onChange={() => setSelectionType('all')}
              className="rounded-full"
            />
            <span className="text-sm">All Users</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              checked={selectionType === 'role'}
              onChange={() => setSelectionType('role')}
              className="rounded-full"
            />
            <span className="text-sm">By Role</span>
          </label>

          {selectionType === 'role' && (
            <div className="ml-6 space-y-2">
              {roles.map(role => (
                <label key={role} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role)}
                    onChange={() => toggleRole(role)}
                    className="rounded"
                  />
                  <span className="text-sm">{role}</span>
                </label>
              ))}
            </div>
          )}

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              checked={selectionType === 'course'}
              onChange={() => setSelectionType('course')}
              className="rounded-full"
            />
            <span className="text-sm">By Course Enrollment</span>
          </label>

          {selectionType === 'course' && (
            <div className="ml-6 space-y-2">
              {courses.map(course => (
                <label key={course} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course)}
                    onChange={() => toggleCourse(course)}
                    className="rounded"
                  />
                  <span className="text-sm">{course}</span>
                </label>
              ))}
            </div>
          )}

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              checked={selectionType === 'custom'}
              onChange={() => setSelectionType('custom')}
              className="rounded-full"
            />
            <span className="text-sm">Custom Filter</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              checked={selectionType === 'csv'}
              onChange={() => setSelectionType('csv')}
              className="rounded-full"
            />
            <span className="text-sm">Upload CSV</span>
          </label>

          {selectionType === 'csv' && (
            <div className="ml-6">
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Upload Email List
              </Button>
              <p className="text-xs text-gray-500 mt-1">CSV file with email addresses</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
