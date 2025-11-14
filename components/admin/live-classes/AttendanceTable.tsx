'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Download, Search, Clock, User, CheckCircle, XCircle } from 'lucide-react'

interface AttendanceRecord {
  id: string
  studentId: string
  studentName: string
  studentPhoto?: string
  email: string
  joinTime: string
  leaveTime: string | null
  duration: number
  status: 'present' | 'absent' | 'late'
}

interface AttendanceTableProps {
  classId: string
  attendance: AttendanceRecord[]
  onExport?: () => void
}

export default function AttendanceTable({ classId, attendance, onExport }: AttendanceTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'joinTime' | 'duration'>('name')

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Present
          </Badge>
        )
      case 'late':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Late
          </Badge>
        )
      case 'absent':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Absent
          </Badge>
        )
      default:
        return null
    }
  }

  const filteredAttendance = attendance
    .filter(record => 
      record.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.studentName.localeCompare(b.studentName)
        case 'joinTime':
          return new Date(a.joinTime).getTime() - new Date(b.joinTime).getTime()
        case 'duration':
          return b.duration - a.duration
        default:
          return 0
      }
    })

  const stats = {
    total: attendance.length,
    present: attendance.filter(r => r.status === 'present').length,
    late: attendance.filter(r => r.status === 'late').length,
    absent: attendance.filter(r => r.status === 'absent').length,
    avgDuration: attendance.length > 0 
      ? Math.round(attendance.reduce((sum, r) => sum + r.duration, 0) / attendance.length)
      : 0
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Attendance ({stats.total} students)</CardTitle>
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-green-600">Present</p>
            <p className="text-2xl font-bold text-green-700">{stats.present}</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-xs text-yellow-600">Late</p>
            <p className="text-2xl font-bold text-yellow-700">{stats.late}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-xs text-red-600">Absent</p>
            <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600">Avg Duration</p>
            <p className="text-2xl font-bold text-blue-700">{formatDuration(stats.avgDuration)}</p>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="name">Sort by Name</option>
            <option value="joinTime">Sort by Join Time</option>
            <option value="duration">Sort by Duration</option>
          </select>
        </div>

        {/* Attendance Table */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Student</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Join Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Leave Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    {searchQuery ? 'No students found' : 'No attendance records yet'}
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={record.studentPhoto} />
                          <AvatarFallback>
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{record.studentName}</p>
                          <p className="text-xs text-gray-500">{record.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {formatTime(record.joinTime)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {record.leaveTime ? formatTime(record.leaveTime) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {formatDuration(record.duration)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
