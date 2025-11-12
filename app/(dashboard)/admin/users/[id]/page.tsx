'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import VerificationModal from '@/components/admin/users/VerificationModal'
import { 
  ArrowLeft,
  User,
  Shield,
  ShieldCheck,
  ShieldX,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit,
  UserX,
  Trash2,
  Key,
  Activity,
  BookOpen,
  CreditCard,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react'

interface UserDetails {
  id: string
  profilePhoto?: string
  fullName: string
  email: string
  phone?: string
  role: 'student' | 'teacher' | 'parent' | 'admin'
  registrationDate: string
  verificationStatus: 'pending' | 'verified' | 'rejected'
  accountStatus: 'active' | 'suspended' | 'inactive'
  lastActive?: string
  address?: {
    street: string
    city: string
    state: string
    country: string
    zipCode: string
  }
  idDocuments?: {
    front: string
    back: string
    uploadDate: string
  }
  verificationHistory: Array<{
    date: string
    action: string
    reason?: string
    adminName: string
  }>
  enrolledCourses?: Array<{
    id: string
    name: string
    enrollmentDate: string
    progress: number
    status: string
  }>
  createdCourses?: Array<{
    id: string
    name: string
    students: number
    createdDate: string
    status: string
  }>
  linkedChildren?: Array<{
    id: string
    name: string
    age: number
    grade: string
  }>
  paymentHistory: Array<{
    id: string
    amount: number
    date: string
    description: string
    status: string
  }>
  supportTickets: Array<{
    id: string
    subject: string
    status: string
    createdDate: string
    priority: string
  }>
  activityTimeline: Array<{
    id: string
    action: string
    description: string
    timestamp: string
    type: 'login' | 'course' | 'payment' | 'support' | 'verification'
  }>
}

// Mock user data
const mockUserDetails: UserDetails = {
  id: '1',
  fullName: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  phone: '+1 (555) 123-4567',
  role: 'student',
  registrationDate: '2024-01-15',
  verificationStatus: 'verified',
  accountStatus: 'active',
  lastActive: '2024-01-20',
  address: {
    street: '123 Main Street',
    city: 'New York',
    state: 'NY',
    country: 'United States',
    zipCode: '10001'
  },
  idDocuments: {
    front: '/api/placeholder/400/250',
    back: '/api/placeholder/400/250',
    uploadDate: '2024-01-16'
  },
  verificationHistory: [
    {
      date: '2024-01-17',
      action: 'Approved',
      reason: 'All documents verified successfully',
      adminName: 'Admin User'
    },
    {
      date: '2024-01-16',
      action: 'Submitted',
      adminName: 'System'
    }
  ],
  enrolledCourses: [
    {
      id: '1',
      name: 'Mathematics Grade 10',
      enrollmentDate: '2024-01-15',
      progress: 75,
      status: 'active'
    },
    {
      id: '2',
      name: 'English Literature',
      enrollmentDate: '2024-01-18',
      progress: 45,
      status: 'active'
    }
  ],
  paymentHistory: [
    {
      id: '1',
      amount: 299,
      date: '2024-01-15',
      description: 'Mathematics Grade 10 - Monthly Subscription',
      status: 'completed'
    },
    {
      id: '2',
      amount: 249,
      date: '2024-01-18',
      description: 'English Literature - Monthly Subscription',
      status: 'completed'
    }
  ],
  supportTickets: [
    {
      id: '1',
      subject: 'Login Issues',
      status: 'resolved',
      createdDate: '2024-01-19',
      priority: 'medium'
    }
  ],
  activityTimeline: [
    {
      id: '1',
      action: 'Login',
      description: 'User logged in from Chrome browser',
      timestamp: '2024-01-20T10:30:00Z',
      type: 'login'
    },
    {
      id: '2',
      action: 'Course Progress',
      description: 'Completed lesson 8 in Mathematics Grade 10',
      timestamp: '2024-01-20T09:15:00Z',
      type: 'course'
    },
    {
      id: '3',
      action: 'Payment',
      description: 'Payment of $249 processed successfully',
      timestamp: '2024-01-18T14:22:00Z',
      type: 'payment'
    }
  ]
}

export default function UserDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<UserDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUser(mockUserDetails)
      setIsLoading(false)
    }, 1000)
  }, [params.id])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="space-y-6">
              <div className="h-48 bg-gray-200 rounded-lg"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">User not found</h3>
        <p className="text-gray-600 mb-4">The user you're looking for doesn't exist.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'verified': return <ShieldCheck className="w-5 h-5 text-green-600" />
      case 'rejected': return <ShieldX className="w-5 h-5 text-red-600" />
      default: return <Shield className="w-5 h-5 text-orange-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const config = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-red-100 text-red-800',
      inactive: 'bg-gray-100 text-gray-800'
    }
    return config[status as keyof typeof config] || config.inactive
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{user.fullName}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
          <Button variant="outline">
            <Key className="w-4 h-4 mr-2" />
            Reset Password
          </Button>
          <Button variant="outline">
            <Mail className="w-4 h-4 mr-2" />
            Send Email
          </Button>
          {user.accountStatus === 'active' ? (
            <Button variant="outline" className="text-orange-600 hover:text-orange-700">
              <UserX className="w-4 h-4 mr-2" />
              Suspend Account
            </Button>
          ) : (
            <Button variant="outline" className="text-green-600 hover:text-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Activate Account
            </Button>
          )}
          <Button variant="outline" className="text-red-600 hover:text-red-700">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
        </div>
      </div>

      {/* User Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Account Status</p>
                <Badge className={getStatusBadge(user.accountStatus)}>
                  {user.accountStatus.charAt(0).toUpperCase() + user.accountStatus.slice(1)}
                </Badge>
              </div>
              <User className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verification</p>
                <div className="flex items-center space-x-2 mt-1">
                  {getVerificationIcon(user.verificationStatus)}
                  <span className="font-medium capitalize">{user.verificationStatus}</span>
                </div>
              </div>
              <Shield className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Role</p>
                <p className="text-lg font-bold capitalize">{user.role}</p>
              </div>
              <Badge className="bg-blue-100 text-blue-800">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Active</p>
                <p className="text-lg font-bold">
                  {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Full Name</label>
                      <p className="text-gray-900">{user.fullName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Registration Date</label>
                      <p className="text-gray-900">{new Date(user.registrationDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  {user.address && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Address</label>
                      <p className="text-gray-900">
                        {user.address.street}, {user.address.city}, {user.address.state} {user.address.zipCode}, {user.address.country}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="verification" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>ID Verification</CardTitle>
                    {user.verificationStatus === 'pending' && (
                      <Button onClick={() => setShowVerificationModal(true)}>
                        Review Documents
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {user.idDocuments && (
                    <div>
                      <h4 className="font-medium mb-4">Uploaded Documents</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Front Side</p>
                          <img 
                            src={user.idDocuments.front} 
                            alt="ID Front" 
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Back Side</p>
                          <img 
                            src={user.idDocuments.back} 
                            alt="ID Back" 
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Uploaded on {new Date(user.idDocuments.uploadDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium mb-4">Verification History</h4>
                    <div className="space-y-3">
                      {user.verificationHistory.map((entry, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{entry.action}</p>
                              <p className="text-sm text-gray-500">{new Date(entry.date).toLocaleDateString()}</p>
                            </div>
                            {entry.reason && (
                              <p className="text-sm text-gray-600 mt-1">{entry.reason}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">By {entry.adminName}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="courses" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {user.role === 'student' ? 'Enrolled Courses' : 
                     user.role === 'teacher' ? 'Created Courses' : 
                     'Linked Children Courses'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user.enrolledCourses && user.enrolledCourses.length > 0 ? (
                    <div className="space-y-4">
                      {user.enrolledCourses.map((course) => (
                        <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <BookOpen className="w-8 h-8 text-blue-600" />
                            <div>
                              <h4 className="font-medium">{course.name}</h4>
                              <p className="text-sm text-gray-600">
                                Enrolled: {new Date(course.enrollmentDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${course.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{course.progress}%</span>
                            </div>
                            <Badge className="mt-1 bg-green-100 text-green-800">
                              {course.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No courses found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  {user.paymentHistory.length > 0 ? (
                    <div className="space-y-4">
                      {user.paymentHistory.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <CreditCard className="w-8 h-8 text-green-600" />
                            <div>
                              <h4 className="font-medium">${payment.amount}</h4>
                              <p className="text-sm text-gray-600">{payment.description}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(payment.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            {payment.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No payment history</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="support" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Support Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  {user.supportTickets.length > 0 ? (
                    <div className="space-y-4">
                      {user.supportTickets.map((ticket) => (
                        <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <MessageSquare className="w-8 h-8 text-blue-600" />
                            <div>
                              <h4 className="font-medium">{ticket.subject}</h4>
                              <p className="text-sm text-gray-600">
                                Created: {new Date(ticket.createdDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-blue-100 text-blue-800 mb-1">
                              {ticket.priority}
                            </Badge>
                            <br />
                            <Badge className="bg-green-100 text-green-800">
                              {ticket.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No support tickets</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Activity Timeline */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user.activityTimeline.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.action}</p>
                      <p className="text-xs text-gray-600">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        user={user}
        onVerificationUpdate={(status: 'verified' | 'rejected', reason?: string) => {
          setUser(prev => prev ? { ...prev, verificationStatus: status } : null)
          setShowVerificationModal(false)
        }}
      />
    </div>
  )
}