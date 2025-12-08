'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import UserTable from '@/components/admin/users/UserTable'
import UserFilters from '@/components/admin/users/UserFilters'
import BulkActionModal from '@/components/admin/users/BulkActionModal'
import { 
  Users, 
  UserPlus, 
  Download, 
  Filter,
  Search,
  RefreshCw,
  ChevronDown
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface User {
  id: string
  profilePhoto?: string
  fullName: string
  email: string
  role: 'student' | 'teacher' | 'parent' | 'admin'
  registrationDate: string
  verificationStatus: 'pending' | 'verified' | 'rejected'
  accountStatus: 'active' | 'suspended' | 'inactive'
  lastActive?: string
}

// Mock data - in real app, this would come from API
const mockUsers: User[] = [
  {
    id: '1',
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    role: 'student',
    registrationDate: '2024-01-15',
    verificationStatus: 'verified',
    accountStatus: 'active',
    lastActive: '2024-01-20'
  },
  {
    id: '2',
    fullName: 'Dr. Michael Brown',
    email: 'michael.brown@email.com',
    role: 'teacher',
    registrationDate: '2024-01-10',
    verificationStatus: 'verified',
    accountStatus: 'active',
    lastActive: '2024-01-19'
  },
  {
    id: '3',
    fullName: 'Maria Rodriguez',
    email: 'maria.rodriguez@email.com',
    role: 'parent',
    registrationDate: '2024-01-18',
    verificationStatus: 'pending',
    accountStatus: 'active',
    lastActive: '2024-01-18'
  },
  {
    id: '4',
    fullName: 'Ahmed Al-Rashid',
    email: 'ahmed.alrashid@email.com',
    role: 'student',
    registrationDate: '2024-01-12',
    verificationStatus: 'verified',
    accountStatus: 'suspended',
    lastActive: '2024-01-17'
  },
  {
    id: '5',
    fullName: 'Jennifer Lee',
    email: 'jennifer.lee@email.com',
    role: 'teacher',
    registrationDate: '2024-01-08',
    verificationStatus: 'rejected',
    accountStatus: 'inactive',
    lastActive: '2024-01-16'
  }
]

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [filteredUsers, setFilteredUsers] = useState<User[]>(mockUsers)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [bulkAction, setBulkAction] = useState<'suspend' | 'delete' | 'export'>('suspend')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    verification: 'all',
    dateRange: 'all'
  })

  // Filter users based on active tab and filters
  useEffect(() => {
    let filtered = users

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter(user => user.role === activeTab)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply additional filters
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role)
    }
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => user.accountStatus === filters.status)
    }
    if (filters.verification !== 'all') {
      filtered = filtered.filter(user => user.verificationStatus === filters.verification)
    }

    setFilteredUsers(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [users, activeTab, searchQuery, filters])

  const handleBulkAction = (action: 'suspend' | 'delete' | 'export') => {
    if (selectedUsers.length === 0) return
    setBulkAction(action)
    setShowBulkModal(true)
  }

  const handleExport = () => {
    // In real app, this would call API to export data
    console.log('Exporting users...', selectedUsers.length > 0 ? selectedUsers : 'all')
  }

  const handleRefresh = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const totalUsers = filteredUsers.length
  const totalPages = Math.ceil(totalUsers / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalUsers)
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  const getTabCount = (role: string) => {
    if (role === 'all') return users.length
    return users.filter(user => user.role === role).length
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage all users, verify accounts, and monitor activity</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => handleExport()}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Select User Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/register?role=student')}>
                <Users className="w-4 h-4 mr-2" />
                Add Student
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/register?role=teacher')}>
                <Users className="w-4 h-4 mr-2" />
                Add Teacher
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/register?role=parent')}>
                <Users className="w-4 h-4 mr-2" />
                Add Parent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/register?role=spoken_english')}>
                <Users className="w-4 h-4 mr-2" />
                Add Spoken English Student
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/register?role=admin')}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Admin
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Verification</p>
                <p className="text-3xl font-bold text-orange-600">
                  {users.filter(u => u.verificationStatus === 'pending').length}
                </p>
              </div>
              <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                Pending
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-green-600">
                  {users.filter(u => u.accountStatus === 'active').length}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspended</p>
                <p className="text-3xl font-bold text-red-600">
                  {users.filter(u => u.accountStatus === 'suspended').length}
                </p>
              </div>
              <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                Suspended
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
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
            <UserFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        </CardContent>
      </Card>

      {/* User Tabs and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Users</CardTitle>
            {selectedUsers.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {selectedUsers.length} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('suspend')}
                >
                  Suspend
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                >
                  Delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('export')}
                >
                  Export
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">
                All Users ({getTabCount('all')})
              </TabsTrigger>
              <TabsTrigger value="student">
                Students ({getTabCount('student')})
              </TabsTrigger>
              <TabsTrigger value="teacher">
                Teachers ({getTabCount('teacher')})
              </TabsTrigger>
              <TabsTrigger value="parent">
                Parents ({getTabCount('parent')})
              </TabsTrigger>
              <TabsTrigger value="admin">
                Admins ({getTabCount('admin')})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <UserTable
                users={paginatedUsers}
                selectedUsers={selectedUsers}
                onSelectionChange={setSelectedUsers}
                isLoading={isLoading}
              />

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {endIndex} of {totalUsers} users
                  </span>
                  <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="25">25</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-600">per page</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Bulk Action Modal */}
      <BulkActionModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        action={bulkAction}
        selectedCount={selectedUsers.length}
        onConfirm={() => {
          // Handle bulk action
          console.log(`Bulk ${bulkAction}:`, selectedUsers)
          setShowBulkModal(false)
          setSelectedUsers([])
        }}
      />
    </div>
  )
}