'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Download, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  FileText,
  User,
  Calendar
} from 'lucide-react'
import { Worksheet, WorksheetSubmission } from '@/types/materials'
import { WorksheetGrading } from './WorksheetGrading'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface WorksheetSubmissionsViewerProps {
  worksheet: Worksheet
  onClose: () => void
}

export function WorksheetSubmissionsViewer({ worksheet, onClose }: WorksheetSubmissionsViewerProps) {
  const [submissions, setSubmissions] = useState<WorksheetSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<WorksheetSubmission | null>(null)
  const [showGrading, setShowGrading] = useState(false)

  useEffect(() => {
    loadSubmissions()
  }, [worksheet.id])

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/teacher/courses/${worksheet.course_id}/worksheets/${worksheet.id}/submissions`
      )
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data)
      }
    } catch (error) {
      console.error('Failed to load submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGrade = (submission: WorksheetSubmission) => {
    setSelectedSubmission(submission)
    setShowGrading(true)
  }

  const handleGradingClose = () => {
    setShowGrading(false)
    setSelectedSubmission(null)
    loadSubmissions()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'graded':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Graded
          </Badge>
        )
      case 'submitted':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case 'resubmit_requested':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Resubmit Requested
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateStats = () => {
    const total = submissions.length
    const graded = submissions.filter(s => s.status === 'graded').length
    const pending = submissions.filter(s => s.status === 'submitted').length
    const resubmit = submissions.filter(s => s.status === 'resubmit_requested').length
    const late = submissions.filter(s => s.is_late).length
    
    const gradedSubmissions = submissions.filter(s => s.grade !== null && s.grade !== undefined)
    const avgGrade = gradedSubmissions.length > 0
      ? gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions.length
      : 0

    return { total, graded, pending, resubmit, late, avgGrade }
  }

  if (showGrading && selectedSubmission) {
    return (
      <WorksheetGrading
        worksheet={worksheet}
        submission={selectedSubmission}
        onClose={handleGradingClose}
      />
    )
  }

  const stats = calculateStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{worksheet.title}</h2>
          <p className="text-gray-600">Submissions</p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.open(worksheet.worksheet_file_url, '_blank')}
        >
          <Eye className="w-4 h-4 mr-2" />
          View Worksheet
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-sm text-gray-600 mt-1">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.graded}</p>
              <p className="text-sm text-gray-600 mt-1">Graded</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-gray-600 mt-1">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{stats.resubmit}</p>
              <p className="text-sm text-gray-600 mt-1">Resubmit</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{stats.late}</p>
              <p className="text-sm text-gray-600 mt-1">Late</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">
                {stats.avgGrade.toFixed(1)}%
              </p>
              <p className="text-sm text-gray-600 mt-1">Avg Grade</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No submissions yet
              </h3>
              <p className="text-gray-600">
                Students haven't submitted their worksheets yet
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Resubmissions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">
                            {submission.student_id}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(submission.submitted_at)}
                          {submission.is_late && (
                            <Badge variant="destructive" className="ml-2">
                              Late
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(submission.status)}
                      </TableCell>
                      <TableCell>
                        {submission.grade !== null && submission.grade !== undefined ? (
                          <span className="font-medium">
                            {submission.grade} / {submission.max_grade}
                          </span>
                        ) : (
                          <span className="text-gray-400">Not graded</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {submission.resubmission_count > 0 ? (
                          <Badge variant="outline">
                            {submission.resubmission_count}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {submission.submission_file_url && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(submission.submission_file_url!, '_blank')}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const link = document.createElement('a')
                                  link.href = submission.submission_file_url!
                                  link.download = `submission-${submission.id}.pdf`
                                  link.click()
                                }}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleGrade(submission)}
                          >
                            {submission.status === 'graded' ? 'Review' : 'Grade'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
