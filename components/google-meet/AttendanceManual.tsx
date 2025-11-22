'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Users, Save, Info, CheckCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface Student {
  id: string
  name: string
  email: string
  avatar_url?: string
}

interface AttendanceRecord {
  student_id: string
  present: boolean
  join_time?: string
  leave_time?: string
  notes?: string
}

interface AttendanceManualProps {
  liveClassId: string
  students: Student[]
  onSave?: (attendance: AttendanceRecord[]) => void
}

export function AttendanceManual({ liveClassId, students, onSave }: AttendanceManualProps) {
  const { toast } = useToast()
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Initialize attendance records
    const initialAttendance: Record<string, AttendanceRecord> = {}
    students.forEach(student => {
      initialAttendance[student.id] = {
        student_id: student.id,
        present: false,
        join_time: '',
        leave_time: '',
        notes: ''
      }
    })
    setAttendance(initialAttendance)
  }, [students])

  const handleTogglePresent = (studentId: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        present: !prev[studentId].present
      }
    }))
    setSaved(false)
  }

  const handleTimeChange = (studentId: string, field: 'join_time' | 'leave_time', value: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }))
    setSaved(false)
  }

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes
      }
    }))
    setSaved(false)
  }

  const handleMarkAllPresent = () => {
    const updatedAttendance = { ...attendance }
    Object.keys(updatedAttendance).forEach(studentId => {
      updatedAttendance[studentId].present = true
    })
    setAttendance(updatedAttendance)
    setSaved(false)
  }

  const handleMarkAllAbsent = () => {
    const updatedAttendance = { ...attendance }
    Object.keys(updatedAttendance).forEach(studentId => {
      updatedAttendance[studentId].present = false
    })
    setAttendance(updatedAttendance)
    setSaved(false)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const attendanceRecords = Object.values(attendance)
      
      const response = await fetch(`/api/teacher/live-classes/${liveClassId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendance: attendanceRecords })
      })

      if (!response.ok) throw new Error('Failed to save attendance')

      setSaved(true)
      
      if (onSave) {
        onSave(attendanceRecords)
      }

      toast({
        title: 'Attendance Saved',
        description: 'Student attendance has been recorded successfully'
      })
    } catch (error) {
      console.error('Error saving attendance:', error)
      toast({
        title: 'Error',
        description: 'Failed to save attendance',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const presentCount = Object.values(attendance).filter(a => a.present).length
  const absentCount = students.length - presentCount

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Manual Attendance
            </CardTitle>
            <CardDescription>
              Mark student attendance for this Google Meet session
            </CardDescription>
          </div>
          {saved && (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Saved
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Google Meet doesn't provide automatic attendance tracking. Please manually mark
            students as present or absent based on who joined the session.
          </AlertDescription>
        </Alert>

        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-2xl font-bold">{students.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Present</p>
              <p className="text-2xl font-bold text-green-600">{presentCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Absent</p>
              <p className="text-2xl font-bold text-red-600">{absentCount}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllPresent}
            >
              Mark All Present
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAbsent}
            >
              Mark All Absent
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {students.map(student => (
            <div key={student.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={attendance[student.id]?.present || false}
                    onCheckedChange={() => handleTogglePresent(student.id)}
                  />
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                </div>
                <Badge variant={attendance[student.id]?.present ? 'default' : 'secondary'}>
                  {attendance[student.id]?.present ? 'Present' : 'Absent'}
                </Badge>
              </div>

              {attendance[student.id]?.present && (
                <div className="grid grid-cols-2 gap-3 ml-8">
                  <div>
                    <Label className="text-xs">Join Time (Optional)</Label>
                    <Input
                      type="time"
                      value={attendance[student.id]?.join_time || ''}
                      onChange={(e) => handleTimeChange(student.id, 'join_time', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Leave Time (Optional)</Label>
                    <Input
                      type="time"
                      value={attendance[student.id]?.leave_time || ''}
                      onChange={(e) => handleTimeChange(student.id, 'leave_time', e.target.value)}
                      className="h-8"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs">Notes (Optional)</Label>
                    <Input
                      value={attendance[student.id]?.notes || ''}
                      onChange={(e) => handleNotesChange(student.id, e.target.value)}
                      placeholder="Add notes about participation..."
                      className="h-8"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full"
        >
          {saving ? (
            <>
              <Save className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Attendance
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
