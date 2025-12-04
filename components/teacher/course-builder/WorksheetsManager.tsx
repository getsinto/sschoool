'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  FileText, 
  Download, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react'
import { 
  Worksheet, 
  WorksheetWithSubmissions,
  DifficultyLevel 
} from '@/types/materials'
import { WorksheetForm } from './WorksheetForm'
import { WorksheetSubmissionsViewer } from './WorksheetSubmissionsViewer'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface WorksheetsManagerProps {
  courseId: string
  moduleId?: string
}

export function WorksheetsManager({ courseId, moduleId }: WorksheetsManagerProps) {
  const [worksheets, setWorksheets] = useState<WorksheetWithSubmissions[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedWorksheet, setSelectedWorksheet] = useState<Worksheet | null>(null)
  const [showSubmissions, setShowSubmissions] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')

  useEffect(() => {
    loadWorksheets()
  }, [courseId, moduleId])

  const loadWorksheets = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ course_id: courseId })
      if (moduleId) params.append('module_id', moduleId)
      
      const response = await fetch(`/api/teacher/courses/${courseId}/worksheets?${params}`)
      if (response.ok) {
        const data = await response.json()
        setWorksheets(data)
      }
    } catch (error) {
      console.error('Failed to load worksheets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedWorksheet(null)
    setShowForm(true)
  }

  const handleEdit = (worksheet: Worksheet) => {
    setSelectedWorksheet(worksheet)
    setShowForm(true)
  }

  const handleDelete = async (worksheetId: string) => {
    if (!confirm('Are you sure you want to delete this worksheet?')) return

    try {
      const response = await fetch(
        `/api/teacher/courses/${courseId}/worksheets/${worksheetId}`,
        { method: 'DELETE' }
      )
      
      if (response.ok) {
        await loadWorksheets()
      }
    } catch (error) {
      console.error('Failed to delete worksheet:', error)
    }
  }

  const handleViewSubmissions = (worksheet: Worksheet) => {
    setSelectedWorksheet(worksheet)
    setShowSubmissions(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setSelectedWorksheet(null)
    loadWorksheets()
  }

  const handleSubmissionsClose = () => {
    setShowSubmissions(false)
    setSelectedWorksheet(null)
    loadWorksheets()
  }

  const getDifficultyColor = (level?: DifficultyLevel | null) => {
    switch (level) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredWorksheets = worksheets.filter(worksheet => {
    const matchesSearch = worksheet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         worksheet.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDifficulty = difficultyFilter === 'all' || worksheet.difficulty_level === difficultyFilter
    return matchesSearch && matchesDifficulty
  })

  if (showForm) {
    return (
      <WorksheetForm
        courseId={courseId}
        moduleId={moduleId}
        worksheet={selectedWorksheet}
        onClose={handleFormClose}
      />
    )
  }

  if (showSubmissions && selectedWorksheet) {
    return (
      <WorksheetSubmissionsViewer
        worksheet={selectedWorksheet}
        onClose={handleSubmissionsClose}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Worksheets</h2>
          <p className="text-gray-600">
            Create and manage practice worksheets for your course
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Create Worksheet
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search worksheets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Worksheets List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading worksheets...</p>
        </div>
      ) : filteredWorksheets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || difficultyFilter !== 'all' ? 'No worksheets found' : 'No worksheets yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || difficultyFilter !== 'all' 
                ? 'Try adjusting your filters'
                : 'Create your first worksheet to get started'}
            </p>
            {!searchQuery && difficultyFilter === 'all' && (
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Create Worksheet
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorksheets.map((worksheet) => (
            <Card key={worksheet.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{worksheet.title}</CardTitle>
                    <div className="flex flex-wrap gap-2">
                      {worksheet.difficulty_level && (
                        <Badge className={getDifficultyColor(worksheet.difficulty_level)}>
                          {worksheet.difficulty_level}
                        </Badge>
                      )}
                      {worksheet.requires_submission && (
                        <Badge variant="outline">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Requires Submission
                        </Badge>
                      )}
                      {worksheet.estimated_minutes && (
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {worksheet.estimated_minutes} min
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {worksheet.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {worksheet.description}
                  </p>
                )}

                {/* Submission Stats */}
                {worksheet.requires_submission && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Submissions:</span>
                      <span className="font-medium">{worksheet.submission_count || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Graded:</span>
                      <span className="font-medium">{worksheet.graded_count || 0}</span>
                    </div>
                    {worksheet.average_grade !== undefined && worksheet.average_grade !== null && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Avg Grade:</span>
                        <span className="font-medium">
                          {worksheet.average_grade.toFixed(1)}%
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(worksheet.worksheet_file_url, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  {worksheet.download_allowed && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = worksheet.worksheet_file_url
                        link.download = `${worksheet.title}.pdf`
                        link.click()
                      }}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  )}
                  {worksheet.requires_submission && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewSubmissions(worksheet)}
                      className="relative"
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Submissions
                      {worksheet.submission_count && worksheet.submission_count > 0 && (
                        <Badge 
                          className="ml-2 bg-blue-600 text-white"
                          variant="secondary"
                        >
                          {worksheet.submission_count}
                        </Badge>
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(worksheet)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(worksheet.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
