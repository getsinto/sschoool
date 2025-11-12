'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import VerificationModal from '@/components/admin/users/VerificationModal'
import { 
  Shield, 
  ShieldCheck, 
  ShieldX, 
  Search, 
  Filter,
  Clock,
  User,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw
} from 'lucide-react'

interface PendingVerification {
  id: string
  userId: string
  fullName: string
  email: string
  role: string
  submittedDate: string
  priority: 'low' | 'medium' | 'high'
  documentType: string
  status: 'pending' | 'in_review'
  reviewedBy?: string
  notes?: string
}

// Mock pending verifications
const mockPendingVerifications: PendingVerification[] = [
  {
    id: 'v1',
    userId: '3',
    fullName: 'Maria Rodriguez',
    email: 'maria.rodriguez@email.com',
    role: 'parent',
    submittedDate: '2024-01-18',
    priority: 'high',
    documentType: 'Driver License',
    status: 'pending'
  },
  {
    id: 'v2',
    userId: '5',
    fullName: 'Ahmed Al-Rashid',
    email: 'ahmed.alrashid@email.com',
    role: 'student',
    submittedDate: '2024-01-17',
    priority: 'medium',
    documentType: 'Passport',
    status: 'in_review',
    reviewedBy: 'Admin User'
  },
  {
    id: 'v3',
    userId: '7',
    fullName: 'Jennifer Lee',
    email: 'jennifer.lee@email.com',
    role: 'teacher',
    submittedDate: '2024-01-16',
    priority: 'high',
    documentType: 'National ID',
    status: 'pending'
  },
  {
    id: 'v4',
    userId: '9',
    fullName: 'David Kim',
    email: 'david.kim@email.com',
    role: 'student',
    submittedDate: '2024-01-15',
    priority: 'low',
    documentType: 'Student ID',
    status: 'pending'
  }
]

export default function VerificationQueuePage() {
  const [verifications, setVerifications] = useState<PendingVerification[]>(mockPendingVerifications)
  const [filteredVerifications, setFilteredVerifications] = useState<PendingVerification[]>(mockPendingVerifications)
  const [selectedVerifications, setSelectedVerifications] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Filter verifications
  useEffect(() => {
    let filtered = verifications

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(v => 
        v.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(v => v.priority === priorityFilter)
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(v => v.role === roleFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(v => v.status === statusFilter)
    }

    setFilteredVerifications(filtered)
  }, [verifications, searchQuery, priorityFilter, roleFilter, statusFilter])

  const handleBulkApprove = async () => {
    if (selectedVerifications.length === 0) return
    
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Remove approved verifications
      setVerifications(prev => 
        prev.filter(v => !selectedVerifications.includes(v.id))
      )
      setSelectedVerifications([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkReject = async () => {
    if (selectedVerifications.length === 0) return
    
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Remove rejected verifications
      setVerifications(prev => 
        prev.filter(v => !selectedVerifications.includes(v.id))
      )
      setSelectedVerifications([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewVerification = (verification: PendingVerification) => {
    // Mock user data for verification modal
    const mockUser = {
      id: verification.userId,
      fullName: verification.fullName,
      email: verification.email,
      role: verification.role,
      registrationDate: '2024-01-15',
      verificationStatus: 'pending' as const,
      idDocuments: {
        front: '/api/placeholder/400/250',
        back: '/api/placeholder/400/250',
        uploadDate: verification.submittedDate
      },
      address: {
        street: '123 Main Street',
        city: 'New York',
        state: 'NY',
        country: 'United States',
        zipCode: '10001'
      }
    }
    
    setSelectedUser(mockUser)
    setShowVerificationModal(true)
  }

  const getPriorityBadge = (priority: string) => {
    const config = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-orange-100 text-orange-800',
      low: 'bg-green-100 text-green-800'
    }
    return config[priority as keyof typeof config] || config.low
  }

  const getStatusBadge = (status: string) => {
    const config = {
      pending: 'bg-orange-100 text-orange-800',
      in_review: 'bg-blue-100 text-blue-800'
    }
    return config[status as keyof typeof config] || config.pending
  }

  const getDaysWaiting = (submittedDate: string) => {
    const days = Math.floor((Date.now() - new Date(submittedDate).getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ID Verification Queue</h1>
          <p className="text-gray-600 mt-1">Review and approve pending identity verifications</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setIsLoading(true)}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {selectedVerifications.length > 0 && (
            <>
              <Button 
                onClick={handleBulkApprove}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve ({selectedVerifications.length})
              </Button>
              <Button 
                onClick={handleBulkReject}
                disabled={isLoading}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject ({selectedVerifications.length})
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pending</p>
                <p className="text-3xl font-bold text-orange-600">{verifications.length}</p>
              </div>
              <Shield className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-3xl font-bold text-red-600">
                  {verifications.filter(v => v.priority === 'high').length}
                </p>
              </div>
              <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                High
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Review</p>
                <p className="text-3xl font-bold text-blue-600">
                  {verifications.filter(v => v.status === 'in_review').length}
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                Review
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Wait Time</p>
                <p className="text-3xl font-bold text-gray-900">2.3 days</p>
              </div>
              <Clock className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Verifications</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVerifications.length > 0 ? (
            <div className="space-y-4">
              {filteredVerifications.map((verification) => (
                <div 
                  key={verification.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedVerifications.includes(verification.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedVerifications([...selectedVerifications, verification.id])
                        } else {
                          setSelectedVerifications(selectedVerifications.filter(id => id !== verification.id))
                        }
                      }}
                      className="rounded"
                    />
                    
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{verification.fullName}</h4>
                        <Badge className={getPriorityBadge(verification.priority)}>
                          {verification.priority}
                        </Badge>
                        <Badge className={getStatusBadge(verification.status)}>
                          {verification.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{verification.email}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>Role: {verification.role}</span>
                        <span>Document: {verification.documentType}</span>
                        <span>Waiting: {getDaysWaiting(verification.submittedDate)} days</span>
                        {verification.reviewedBy && (
                          <span>Reviewer: {verification.reviewedBy}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewVerification(verification)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                    
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        // Quick approve
                        setVerifications(prev => prev.filter(v => v.id !== verification.id))
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => {
                        // Quick reject
                        setVerifications(prev => prev.filter(v => v.id !== verification.id))
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShieldCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending verifications</h3>
              <p className="text-gray-600">All identity verifications have been processed.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verification Modal */}
      {selectedUser && (
        <VerificationModal
          isOpen={showVerificationModal}
          onClose={() => {
            setShowVerificationModal(false)
            setSelectedUser(null)
          }}
          user={selectedUser}
          onVerificationUpdate={(status: 'verified' | 'rejected', reason?: string) => {
            // Remove from pending list
            setVerifications(prev => prev.filter(v => v.userId !== selectedUser.id))
            setShowVerificationModal(false)
            setSelectedUser(null)
          }}
        />
      )}
    </div>
  )
}