'use client'

import { useState, useEffect } from 'react'
import { FileText, Clock, CheckCircle, Award } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import StatCard from '@/components/student/shared/StatCard'
import FilterBar from '@/components/student/shared/FilterBar'
import AssignmentCard from '@/components/student/assignments/AssignmentCard'

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCourse, setFilterCourse] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('dueDate')

  useEffect(() => {
    loadAssignments()
  }, [filterCourse, filterStatus, sortBy])

  const loadAssignments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        ...(filterCourse !== 'all' && { courseId: filterCourse }),
        ...(filterStatus !== 'all' && { status: filterStatus }),
        sort: sortBy
      })

      const response = await fetch(`/api/student/assignments?${params}`)
      const data = await response.json()

      if (data.success) {
        setAssignments(data.data.assignments)
      }
    } catch (error) {
      console.error('Failed to load assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const summary = {
    pending: assignments.filter(a => a.status === 'not_started' || a.status === 'draft').length,
    submitted: assignments.filter(a => a.status === 'submitted').length,
    graded: assignments.filter(a => a.status === 'graded').length,
    averageGrade: assignments
      .filter(a => a.grade !== undefined)
      .reduce((acc, a) => acc + (a.grade / a.maxPoints) * 100, 0) / 
      assignments.filter(a => a.grade !== undefined).length || 0
  }

  const filteredAssignments = assignments
    .filter(a => {
      const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTab = 
        activeTab === 'all' ||
        (activeTab === 'upcoming' && (a.status === 'not_started' || a.status === 'draft')) ||
        (activeTab === 'submitted' && a.status === 'submitted') ||
        (activeTab === 'graded' && a.status === 'graded')
      return matchesSearch && matchesTab
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Assignments</h1>
        <p className="text-gray-600 mt-1">Track and manage your assignments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending"
          value={summary.pending}
          icon={Clock}
          color="yellow"
          description="Not started or draft"
        />
        <StatCard
          title="Submitted"
          value={summary.submitted}
          icon={FileText}
          color="blue"
          description="Awaiting grading"
        />
        <StatCard
          title="Graded"
          value={summary.graded}
          icon={CheckCircle}
          color="green"
          description="Completed"
        />
        <StatCard
          title="Average Grade"
          value={`${Math.round(summary.averageGrade)}%`}
          icon={Award}
          color="purple"
          description="Overall performance"
        />
      </div>

      {/* Tabs and Filters */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="all">All ({assignments.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({summary.pending})</TabsTrigger>
            <TabsTrigger value="submitted">Submitted ({summary.submitted})</TabsTrigger>
            <TabsTrigger value="graded">Graded ({summary.graded})</TabsTrigger>
          </TabsList>
        </div>

        <FilterBar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          filterOptions={[
            {
              label: 'Course',
              value: filterCourse,
              options: [
                { label: 'All Courses', value: 'all' },
                { label: 'Mathematics', value: 'math' },
                { label: 'Science', value: 'science' }
              ],
              onChange: setFilterCourse
            },
            {
              label: 'Status',
              value: filterStatus,
              options: [
                { label: 'All Status', value: 'all' },
                { label: 'Not Started', value: 'not_started' },
                { label: 'Draft', value: 'draft' },
                { label: 'Submitted', value: 'submitted' },
                { label: 'Graded', value: 'graded' }
              ],
              onChange: setFilterStatus
            }
          ]}
          sortOptions={{
            value: sortBy,
            options: [
              { label: 'Due Date', value: 'dueDate' },
              { label: 'Course', value: 'course' },
              { label: 'Grade', value: 'grade' },
              { label: 'Title', value: 'title' }
            ],
            onChange: setSortBy
          }}
          onReset={() => {
            setSearchQuery('')
            setFilterCourse('all')
            setFilterStatus('all')
            setSortBy('dueDate')
          }}
        />

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading assignments...</p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No assignments found</h3>
              <p className="text-gray-600">
                {searchQuery ? 'Try adjusting your search or filters' : 'You have no assignments in this category'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
