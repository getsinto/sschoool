/**
 * Assignment Table Component
 * Feature: course-assignment-permissions
 * 
 * Displays current teacher assignments with permissions and actions
 * Requirements: 7.3, 7.4, 12.1, 12.2, 12.3
 */
'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  Crown, 
  Edit, 
  Trash2, 
  User,
  CheckCircle,
  XCircle,
  Calendar,
  Mail
} from 'lucide-react'
import Image from 'next/image'

interface TeacherAssignment {
  id: string
  teacher_id: string
  teacher: {
    id: string
    user_id: string
    full_name: string
    email: string
    profile_image_url?: string
    teacher_type: string
  }
  can_manage_content: boolean
  can_grade: boolean
  can_communicate: boolean
  is_primary_teacher: boolean
  assigned_at: string
  assigned_by: string
}

interface AssignmentTableProps {
  courseId: string
  assignments: TeacherAssignment[]
  onEdit: (assignment: TeacherAssignment) => void
  onRemove: (assignmentId: string) => void
  onChangePrimary: (teacherId: string) => void
  onRefresh: () => void
}

export default function AssignmentTable({
  courseId,
  assignments,
  onEdit,
  onRemove,
  onChangePrimary,
  onRefresh
}: AssignmentTableProps) {
  const [editingAssignment, setEditingAssignment] = useState<TeacherAssignment | null>(null)
  const [removingAssignment, setRemovingAssignment] = useState<string | null>(null)
  const [editPermissions, setEditPermissions] = useState({
    can_manage_content: false,
    can_grade: false,
    can_communicate: false
  })
  const [saving, setSaving] = useState(false)

  const handleEditClick = (assignment: TeacherAssignment) => {
    setEditingAssignment(assignment)
    setEditPermissions({
      can_manage_content: assignment.can_manage_content,
      can_grade: assignment.can_grade,
      can_communicate: assignment.can_communicate
    })
  }

  const handleSavePermissions = async () => {
    if (!editingAssignment) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/assign-teachers`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignment_id: editingAssignment.id,
          permissions: editPermissions
        })
      })

      if (response.ok) {
        setEditingAssignment(null)
        onRefresh()
      } else {
        const error = await response.json()
        alert(`Failed to update permissions: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to update permissions:', error)
      alert('Failed to update permissions')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveConfirm = async () => {
    if (!removingAssignment) return

    try {
      const response = await fetch(`/api/admin/courses/${courseId}/assign-teachers`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignment_id: removingAssignment
        })
      })

      if (response.ok) {
        setRemovingAssignment(null)
        onRemove(removingAssignment)
        onRefresh()
      } else {
        const error = await response.json()
        alert(`Failed to remove teacher: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to remove teacher:', error)
      alert('Failed to remove teacher')
    }
  }

  const getTeacherTypeLabel = (type: string) => {
    switch (type) {
      case 'senior_teacher':
        return 'Senior Teacher'
      case 'course_teacher':
        return 'Course Teacher'
      case 'tuition_teacher':
        return 'Tuition Teacher'
      default:
        return type
    }
  }

  const getTeacherTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'senior_teacher':
        return 'bg-purple-100 text-purple-800'
      case 'course_teacher':
        return 'bg-blue-100 text-blue-800'
      case 'tuition_teacher':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (assignments.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Teachers Assigned</h3>
          <p className="text-gray-600">
            This course doesn't have any teachers assigned yet. Click "Assign Teachers" to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Assigned Teachers ({assignments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {assignment.teacher.profile_image_url ? (
                        <Image
                          src={assignment.teacher.profile_image_url}
                          alt={assignment.teacher.full_name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">
                          {assignment.teacher.full_name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {assignment.teacher.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge className={getTeacherTypeBadgeColor(assignment.teacher.teacher_type)}>
                      {getTeacherTypeLabel(assignment.teacher.teacher_type)}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-sm">
                        {assignment.can_manage_content ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-300 mr-1" />
                        )}
                        <span className={assignment.can_manage_content ? 'text-gray-900' : 'text-gray-400'}>
                          Manage Content
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        {assignment.can_grade ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-300 mr-1" />
                        )}
                        <span className={assignment.can_grade ? 'text-gray-900' : 'text-gray-400'}>
                          Grade Students
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        {assignment.can_communicate ? (
                          <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-300 mr-1" />
                        )}
                        <span className={assignment.can_communicate ? 'text-gray-900' : 'text-gray-400'}>
                          Communicate
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    {assignment.is_primary_teacher ? (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Crown className="w-3 h-3 mr-1" />
                        Primary Teacher
                      </Badge>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onChangePrimary(assignment.teacher_id)}
                      >
                        Set as Primary
                      </Button>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(assignment.assigned_at).toLocaleDateString()}
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(assignment)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRemovingAssignment(assignment.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Permissions Dialog */}
      {editingAssignment && (
        <AlertDialog open={!!editingAssignment} onOpenChange={() => setEditingAssignment(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Edit Permissions</AlertDialogTitle>
              <AlertDialogDescription>
                Update permissions for {editingAssignment.teacher.full_name}
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4 py-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <Checkbox
                  checked={editPermissions.can_manage_content}
                  onCheckedChange={(checked) => 
                    setEditPermissions(prev => ({ ...prev, can_manage_content: checked as boolean }))
                  }
                />
                <div>
                  <div className="font-medium">Manage Content</div>
                  <div className="text-sm text-gray-500">
                    Can create, edit, and organize course content
                  </div>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <Checkbox
                  checked={editPermissions.can_grade}
                  onCheckedChange={(checked) => 
                    setEditPermissions(prev => ({ ...prev, can_grade: checked as boolean }))
                  }
                />
                <div>
                  <div className="font-medium">Grade Students</div>
                  <div className="text-sm text-gray-500">
                    Can grade assignments and provide feedback
                  </div>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <Checkbox
                  checked={editPermissions.can_communicate}
                  onCheckedChange={(checked) => 
                    setEditPermissions(prev => ({ ...prev, can_communicate: checked as boolean }))
                  }
                />
                <div>
                  <div className="font-medium">Communicate with Students</div>
                  <div className="text-sm text-gray-500">
                    Can send messages and announcements
                  </div>
                </div>
              </label>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSavePermissions} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Remove Confirmation Dialog */}
      {removingAssignment && (
        <AlertDialog open={!!removingAssignment} onOpenChange={() => setRemovingAssignment(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Teacher</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove this teacher from the course? They will lose access to all course content and students.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleRemoveConfirm}
                className="bg-red-600 hover:bg-red-700"
              >
                Remove Teacher
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
