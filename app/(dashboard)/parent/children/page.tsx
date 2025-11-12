'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Users,
  Plus,
  Eye,
  Unlink,
  Search,
  Filter,
  TrendingUp,
  BookOpen,
  Award,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Mock data
const mockChildren = [
  {
    id: '1',
    name: 'Emma Johnson',
    avatar: '/avatars/emma.jpg',
    grade: 'Grade 10',
    age: 15,
    email: 'emma.johnson@student.com',
    totalCourses: 5,
    overallPerformance: 92,
    attendanceRate: 95,
    status: 'active',
    relationship: 'Daughter',
    linkedDate: '2023-09-01',
    recentGrade: 'A',
    alerts: 0
  },
  {
    id: '2',
    name: 'Lucas Johnson',
    avatar: '/avatars/lucas.jpg',
    grade: 'Grade 8',
    age: 13,
    email: 'lucas.johnson@student.com',
    totalCourses: 4,
    overallPerformance: 85,
    attendanceRate: 88,
    status: 'active',
    relationship: 'Son',
    linkedDate: '2023-09-01',
    recentGrade: 'B+',
    alerts: 2
  }
]

export default function ManageChildrenPage() {
  const [children] = useState(mockChildren)
  const [searchQuery, setSearchQuery] = useState('')
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkForm, setLinkForm] = useState({
    studentEmail: '',
    relationship: ''
  })

  const filteredChildren = children.filter(child =>
    child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    child.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleLinkChild = () => {
    // API call to link child
    console.log('Linking child:', linkForm)
    setLinkDialogOpen(false)
    setLinkForm({ studentEmail: '', relationship: '' })
  }

  const handleUnlinkChild = (childId: string) => {
    if (confirm('Are you sure you want to unlink this child? You will lose access to their academic information.')) {
      // API call to unlink
      console.log('Unlinking child:', childId)
    }
  }

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-green-600'
    if (performance >= 80) return 'text-blue-600'
    if (performance >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Children</h1>
          <p className="text-gray-600 mt-1">View and manage your linked children</p>
        </div>

        <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Link New Child
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Link New Child</DialogTitle>
              <DialogDescription>
                Enter your child's student email or ID to send a link request
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="studentEmail">Student Email or ID</Label>
                <Input
                  id="studentEmail"
                  placeholder="student@example.com or Student ID"
                  value={linkForm.studentEmail}
                  onChange={(e) => setLinkForm({ ...linkForm, studentEmail: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationship">Relationship</Label>
                <Select
                  value={linkForm.relationship}
                  onValueChange={(value) => setLinkForm({ ...linkForm, relationship: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="father">Father</SelectItem>
                    <SelectItem value="mother">Mother</SelectItem>
                    <SelectItem value="guardian">Legal Guardian</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> The student or school admin must approve your link request before you can access their information.
                </p>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleLinkChild}>
                  Send Link Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Children</p>
                <p className="text-2xl font-bold text-gray-900">{children.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Status</p>
                <p className="text-2xl font-bold text-green-600">
                  {children.filter(c => c.status === 'active').length}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-purple-600">
                  {children.reduce((sum, c) => sum + c.totalCourses, 0)}
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-orange-600">
                  {children.reduce((sum, c) => sum + c.alerts, 0)}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Children List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredChildren.map((child) => (
          <Card key={child.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={child.avatar} />
                  <AvatarFallback>{child.name.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{child.name}</h3>
                      <p className="text-sm text-gray-600">{child.grade} • {child.age} years old</p>
                      <p className="text-xs text-gray-500">{child.email}</p>
                    </div>
                    <Badge variant={child.status === 'active' ? 'default' : 'secondary'}>
                      {child.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 my-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600">Total Courses</p>
                      <p className="text-xl font-bold text-gray-900">{child.totalCourses}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600">Performance</p>
                      <p className={`text-xl font-bold ${getPerformanceColor(child.overallPerformance)}`}>
                        {child.overallPerformance}%
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600">Attendance</p>
                      <p className="text-xl font-bold text-blue-600">{child.attendanceRate}%</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600">Recent Grade</p>
                      <p className="text-xl font-bold text-green-600">{child.recentGrade}</p>
                    </div>
                  </div>

                  {child.alerts > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mb-3">
                      <p className="text-xs text-orange-900 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {child.alerts} active alert{child.alerts > 1 ? 's' : ''} requiring attention
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link href={`/dashboard/parent/children/${child.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUnlinkChild(child.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Unlink className="w-4 h-4 mr-2" />
                      Unlink
                    </Button>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Relationship: {child.relationship} • Linked since {new Date(child.linkedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredChildren.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No children found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery ? 'Try adjusting your search criteria' : 'Link your first child to get started'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setLinkDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Link New Child
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
