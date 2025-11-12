'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Filter, X } from 'lucide-react'

interface Filters {
  role: string
  status: string
  verification: string
  dateRange: string
}

interface UserFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
}

export default function UserFilters({ filters, onFiltersChange }: UserFiltersProps) {
  const updateFilter = (key: keyof Filters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      role: 'all',
      status: 'all',
      verification: 'all',
      dateRange: 'all'
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== 'all')

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Role Filter */}
      <Select value={filters.role} onValueChange={(value) => updateFilter('role', value)}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="student">Student</SelectItem>
          <SelectItem value="teacher">Teacher</SelectItem>
          <SelectItem value="parent">Parent</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="suspended">Suspended</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      {/* Verification Filter */}
      <Select value={filters.verification} onValueChange={(value) => updateFilter('verification', value)}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Verification" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Verification</SelectItem>
          <SelectItem value="verified">Verified</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>

      {/* Date Range Filter */}
      <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Date Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="quarter">This Quarter</SelectItem>
          <SelectItem value="year">This Year</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={clearFilters}>
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      )}

      {/* Filter Indicator */}
      <div className="flex items-center text-sm text-gray-500">
        <Filter className="w-4 h-4 mr-1" />
        {hasActiveFilters ? 'Filters applied' : 'No filters'}
      </div>
    </div>
  )
}