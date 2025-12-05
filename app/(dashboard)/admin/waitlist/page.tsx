/**
 * Admin Waitlist Management Page
 * Manage and monitor all course waitlists
 */

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Users,
  Search,
  Mail,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface WaitlistEntry {
  id: string
  course_id: string
  batch_id?: string
  student_id: string
  joined_waitlist_at: string
  position?: number
  status: string
  course: {
    title: string
    thumbnail_url?: string
  }
  batch?: {
    batch_name: string
  }
  student: {
    full_name: string
    email: string
  }
}

export default function AdminWaitlistPage() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchWaitlist()
  }, [])

  const fetchWaitlist = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/waitlist')
      if (response.ok) {
        const data = await response.json()
        setWaitlist(data.waitlist || [])
      }
    } catch (error) {
      console.error('Failed to fetch waitlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const notifyStudent = async (entryId: string) => {
    try {
      const response = await fetch(`/api/admin/waitlist/${entryId}/notify`, {
        method: 'POST'
      })
      
      if (response.ok) {
        alert('Student notified successfully')
        fetchWaitlist()
      }
    } catch (error) {
      console.error('Failed to notify student:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800'
      case 'notified':
        return 'bg-blue-100 text-blue-800'
      case 'enrolled':
        return 'bg-green-100 text-green-800'
      case 'expired':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredWaitlist = waitlist.filter(entry => {
    const matchesSearch = entry.course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entry.student.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || entry.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: waitlist.length,
    waiting: waitlist.filter(e => e.status === 'waiting').length,
    notified: waitlist.filter(e => e.status === 'notified').length,
    enrolled: waitlist.filter(e => e.status === 'enrolled').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Waitlist Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage all course waitlists
          </p>
        </div>
        <Button onClick={fetchWaitlist} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Waiting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.waiting}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Notified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.notified}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Enrolled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.enrolled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by course, student name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="waiting">Waiting</option>
              <option value="notified">Notified</option>
              <option value="enrolled">Enrolled</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Waitlist Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Waitlist Entries ({filteredWaitlist.length})</CardTitle>
          <CardDescription>
            All students waiting for course enrollment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredWaitlist.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No waitlist entries found</p>
              </div>
            ) : (
              filteredWaitlist.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {entry.course.thumbnail_url && (
                      <img
                        src={entry.course.thumbnail_url}
                        alt={entry.course.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{entry.student.full_name}</h3>
                        <Badge className={getStatusColor(entry.status)}>
                          {entry.status}
                        </Badge>
                        {entry.position && (
                          <Badge variant="outline">
                            Position #{entry.position}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {entry.student.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {entry.course.title}
                        {entry.batch && ` - ${entry.batch.batch_name}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Joined: {new Date(entry.joined_waitlist_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.status === 'waiting' && (
                      <Button
                        onClick={() => notifyStudent(entry.id)}
                        size="sm"
                        variant="outline"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Notify
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
