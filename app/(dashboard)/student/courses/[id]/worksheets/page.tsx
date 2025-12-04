'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { WorksheetCard } from '@/components/student/worksheets/WorksheetCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Filter, Download, CheckCircle, Clock, XCircle } from 'lucide-react'
import type { Worksheet } from '@/types/materials'

interface WorksheetWithSubmission extends Omit<Worksheet, 'answer_key_url' | 'answer_key_file_type'> {
  my_submission?: {
    id: string
    status: 'pending' | 'graded' | 'resubmit'
    grade?: number
    submitted_at: string
    graded_at?: string
    teacher_feedback?: string
  } | null
}

export default function StudentWorksheetsPage() {
  const params = useParams()
  const courseId = params.id as string

  const [worksheets, setWorksheets] = useState<WorksheetWithSubmission[]>([])
  const [filteredWorksheets, setFilteredWorksheets] = useState<WorksheetWithSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchWorksheets()
  }, [courseId])

  useEffect(() => {
    filterWorksheets()
  }, [worksheets, searchQuery, difficultyFilter, statusFilter])

  const fetchWorksheets = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/student/courses/${courseId}/worksheets`)
      if (!response.ok) throw new Error('Failed to fetch worksheets')
      const data = await response.json()
      setWorksheets(data)
    } catch (error) {
      console.error('Error fetching worksheets:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterWorksheets = () => {
    let filtered = [...worksheets]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (w) =>
          w.title.toLowerCase().includes(query) ||
          w.description?.toLowerCase().includes(query) ||
          w.tags?.some((tag) => tag.toLowerCase().includes(query))
      )
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter((w) => w.difficulty_level === difficultyFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((w) => {
        const submission = w.my_submission
        if (statusFilter === 'not_submitted') return !submission
        if (statusFilter === 'pending') return submission?.status === 'pending'
        if (statusFilter === 'graded') return submission?.status === 'graded'
        if (statusFilter === 'resubmit') return submission?.status === 'resubmit'
        return true
      })
    }

    setFilteredWorksheets(filtered)
  }

  const getStats = () => {
    const total = worksheets.length
    const submitted = worksheets.filter((w) => w.my_submission).length
    const graded = worksheets.filter((w) => w.my_submission?.status === 'graded').length
    const pending = worksheets.filter((w) => w.my_submission?.status === 'pending').length
    const needResubmit = worksheets.filter((w) => w.my_submission?.status === 'resubmit').length

    return { total, submitted, graded, pending, needResubmit }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Course Worksheets</h1>
        <p className="text-gray-600">
          Practice exercises and assignments for this course
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Download className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Submitted</p>
              <p className="text-2xl font-bold">{stats.submitted}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Graded</p>
              <p className="text-2xl font-bold">{stats.graded}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resubmit</p>
              <p className="text-2xl font-bold">{stats.needResubmit}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search worksheets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="not_submitted">Not Submitted</SelectItem>
              <SelectItem value="pending">Pending Review</SelectItem>
              <SelectItem value="graded">Graded</SelectItem>
              <SelectItem value="resubmit">Need Resubmit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Worksheets Grid */}
      {filteredWorksheets.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <Download className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No worksheets found</h3>
          <p className="text-gray-600">
            {searchQuery || difficultyFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'No worksheets have been added to this course yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorksheets.map((worksheet) => (
            <WorksheetCard
              key={worksheet.id}
              worksheet={worksheet}
              onSubmit={fetchWorksheets}
            />
          ))}
        </div>
      )}
    </div>
  )
}
