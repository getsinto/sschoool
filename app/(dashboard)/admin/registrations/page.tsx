'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter,
  Eye,
  Mail,
  Phone,
  Calendar,
  FileText,
  Download
} from 'lucide-react'
import { format } from 'date-fns'

interface Registration {
  id: string
  first_name: string
  last_name: string
  email: string
  role: 'student' | 'teacher' | 'parent' | 'spoken_english'
  account_status: 'pending_verification' | 'pending_review' | 'active' | 'rejected'
  email_verified: boolean
  created_at: string
  category_specific_data: any
  id_type?: string
  id_number?: string
  mobile_number?: string
}

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedTab, setSelectedTab] = useState('pending')

  useEffect(() => {
    loadRegistrations()
  }, [filter, selectedTab])

  const loadRegistrations = async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.append('status', filter)
      if (selectedTab !== 'all') params.append('tab', selectedTab)
      
      const response = await fetch(`/api/admin/registrations?${params}`)
      if (response.ok) {
        const data = await response.json()
        setRegistrations(data.registrations)
      }
    } catch (error) {
      console.error('Failed to load registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/registrations/${id}/approve`, {
        method: 'POST'
      })
      if (response.ok) {
        loadRegistrations()
      }
    } catch (error) {
      console.error('Failed to approve registration:', error)
    }
  }

  const handleReject = async (id: string, reason: string) => {
    try {
      const response = await fetch(`/api/admin/registrations/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      })
      if (response.ok) {
        loadRegistrations()
      }
    } catch (error) {
      console.error('Failed to reject registration:', error)
    }
  }

  const getStatusBadge = (status: string, emailVerified: boolean) => {
    if (!emailVerified) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Email Pending</Badge>
    }
    
    switch (status) {
      case 'pending_verification':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Pending Verification</Badge>
      case 'pending_review':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Pending Review</Badge>
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student': return '🎓'
      case 'teacher': return '👨‍🏫'
      case 'parent': return '👨‍👩‍👧'
      case 'spoken_english': return '🗣️'
      default: return '👤'
    }
  }

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = search === '' || 
      reg.first_name.toLowerCase().includes(search.toLowerCase()) ||
      reg.last_name.toLowerCase().includes(search.toLowerCase()) ||
      reg.email.toLowerCase().includes(search.toLowerCase())
    
    const matchesTab = selectedTab === 'all' || 
      (selectedTab === 'pending' && (reg.account_status === 'pending_verification' || reg.account_status === 'pending_review')) ||
      (selectedTab === 'teachers' && reg.role === 'teacher') ||
      (selectedTab === 'students' && reg.role === 'student') ||
      (selectedTab === 'parents' && reg.role === 'parent') ||
      (selectedTab === 'spoken_english' && reg.role === 'spoken_english')
    
    return matchesSearch && matchesTab
  })

  const pendingCount = registrations.filter(r => r.account_status === 'pending_review' || r.account_status === 'pending_verification').length
  const teacherCount = registrations.filter(r => r.role === 'teacher').length
  const studentCount = registrations.filter(r => r.role === 'student').length
  const parentCount = registrations.filter(r => r.role === 'parent').length
  const spokenEnglishCount = registrations.filter(r => r.role === 'spoken_english').length

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          Registration Management
        </h1>
        <p className="text-muted-foreground">Review and manage user registrations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Pending</span>
            </div>
            <p className="text-2xl font-bold">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">👨‍🏫</span>
              <span className="text-sm font-medium">Teachers</span>
            </div>
            <p className="text-2xl font-bold">{teacherCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎓</span>
              <span className="text-sm font-medium">Students</span>
            </div>
            <p className="text-2xl font-bold">{studentCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">👨‍👩‍👧</span>
              <span className="text-sm font-medium">Parents</span>
            </div>
            <p className="text-2xl font-bold">{parentCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🗣️</span>
              <span className="text-sm font-medium">Spoken English</span>
            </div>
            <p className="text-2xl font-bold">{spokenEnglishCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending_verification">Pending Verification</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({registrations.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
          <TabsTrigger value="teachers">Teachers ({teacherCount})</TabsTrigger>
          <TabsTrigger value="students">Students ({studentCount})</TabsTrigger>
          <TabsTrigger value="parents">Parents ({parentCount})</TabsTrigger>
          <TabsTrigger value="spoken_english">Spoken English ({spokenEnglishCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading registrations...</p>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No registrations found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredRegistrations.map((registration) => (
                <Card key={registration.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{getRoleIcon(registration.role)}</span>
                          <div>
                            <h3 className="font-semibold text-lg">
                              {registration.first_name} {registration.last_name}
                            </h3>
                            <p className="text-muted-foreground capitalize">{registration.role.replace('_', ' ')}</p>
                          </div>
                          {getStatusBadge(registration.account_status, registration.email_verified)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{registration.email}</span>
                          </div>
                          {registration.mobile_number && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{registration.mobile_number}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{format(new Date(registration.created_at), 'MMM dd, yyyy')}</span>
                          </div>
                        </div>

                        {registration.role === 'teacher' && registration.category_specific_data && (
                          <div className="mt-4 p-3 bg-muted rounded-lg">
                            <h4 className="font-medium mb-2">Teaching Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div>Qualification: {registration.category_specific_data.qualification}</div>
                              <div>Experience: {registration.category_specific_data.teachingExperience} years</div>
                              <div>Field: {registration.category_specific_data.fieldOfStudy}</div>
                              {registration.category_specific_data.subjectsToTeach && (
                                <div>Subjects: {registration.category_specific_data.subjectsToTeach.join(', ')}</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/admin/registrations/${registration.id}`, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        
                        {registration.account_status === 'pending_review' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(registration.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(registration.id, 'Application rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
