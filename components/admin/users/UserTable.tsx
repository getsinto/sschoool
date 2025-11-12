'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Eye, 
  Edit, 
  UserX, 
  Trash2, 
  MoreHorizontal,
  Shield,
  ShieldCheck,
  ShieldX,
  User
} from 'lucide-react'

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

interface UserTableProps {
  users: User[]
  selectedUsers: string[]
  onSelectionChange: (selected: string[]) => void
  isLoading: boolean
}

const getRoleBadge = (role: string) => {
  const roleConfig = {
    student: { color: 'bg-blue-100 text-blue-800', label: 'Student' },
    teacher: { color: 'bg-purple-100 text-purple-800', label: 'Teacher' },
    parent: { color: 'bg-green-100 text-green-800', label: 'Parent' },
    admin: { color: 'bg-red-100 text-red-800', label: 'Admin' }
  }
  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.student
  return <Badge className={`${config.color} hover:${config.color}`}>{config.label}</Badge>
}

const getVerificationBadge = (status: string) => {
  const statusConfig = {
    verified: { 
      color: 'bg-green-100 text-green-800', 
      label: 'Verified', 
      icon: ShieldCheck 
    },
    pending: { 
      color: 'bg-orange-100 text-orange-800', 
      label: 'Pending', 
      icon: Shield 
    },
    rejected: { 
      color: 'bg-red-100 text-red-800', 
      label: 'Rejected', 
      icon: ShieldX 
    }
  }
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  const Icon = config.icon
  
  return (
    <Badge className={`${config.color} hover:${config.color} flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  )
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    active: { color: 'bg-green-100 text-green-800', label: 'Active' },
    suspended: { color: 'bg-red-100 text-red-800', label: 'Suspended' },
    inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' }
  }
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive
  return <Badge className={`${config.color} hover:${config.color}`}>{config.label}</Badge>
}

export default function UserTable({ users, selectedUsers, onSelectionChange, isLoading }: UserTableProps) {
  const [sortField, setSortField] = useState<keyof User>('registrationDate')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(users.map(user => user.id))
    } else {
      onSelectionChange([])
    }
  }

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedUsers, userId])
    } else {
      onSelectionChange(selectedUsers.filter(id => id !== userId))
    }
  }

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedUsers = [...users].sort((a, b) => {
    const aValue = a[sortField] || ''
    const bValue = b[sortField] || ''
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="w-20 h-6 bg-gray-200 rounded"></div>
              <div className="w-24 h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left p-4">
              <Checkbox
                checked={selectedUsers.length === users.length && users.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </th>
            <th className="text-left p-4 font-medium text-gray-900">Profile</th>
            <th 
              className="text-left p-4 font-medium text-gray-900 cursor-pointer hover:text-blue-600"
              onClick={() => handleSort('fullName')}
            >
              Full Name
            </th>
            <th 
              className="text-left p-4 font-medium text-gray-900 cursor-pointer hover:text-blue-600"
              onClick={() => handleSort('email')}
            >
              Email
            </th>
            <th 
              className="text-left p-4 font-medium text-gray-900 cursor-pointer hover:text-blue-600"
              onClick={() => handleSort('role')}
            >
              Role
            </th>
            <th 
              className="text-left p-4 font-medium text-gray-900 cursor-pointer hover:text-blue-600"
              onClick={() => handleSort('registrationDate')}
            >
              Registration Date
            </th>
            <th className="text-left p-4 font-medium text-gray-900">Verification</th>
            <th className="text-left p-4 font-medium text-gray-900">Status</th>
            <th className="text-left p-4 font-medium text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user) => (
            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-4">
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                />
              </td>
              <td className="p-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  {user.profilePhoto ? (
                    <img 
                      src={user.profilePhoto} 
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </td>
              <td className="p-4">
                <div>
                  <div className="font-medium text-gray-900">{user.fullName}</div>
                  {user.lastActive && (
                    <div className="text-sm text-gray-500">
                      Last active: {new Date(user.lastActive).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </td>
              <td className="p-4 text-gray-600">{user.email}</td>
              <td className="p-4">{getRoleBadge(user.role)}</td>
              <td className="p-4 text-gray-600">
                {new Date(user.registrationDate).toLocaleDateString()}
              </td>
              <td className="p-4">{getVerificationBadge(user.verificationStatus)}</td>
              <td className="p-4">{getStatusBadge(user.accountStatus)}</td>
              <td className="p-4">
                <div className="flex items-center space-x-2">
                  <Link href={`/dashboard/admin/users/${user.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  {user.accountStatus === 'active' ? (
                    <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700">
                      <UserX className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                      <Shield className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {users.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  )
}