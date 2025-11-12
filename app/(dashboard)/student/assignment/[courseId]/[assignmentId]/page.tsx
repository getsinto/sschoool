'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Upload,
  File,
  X,
  Save,
  Send,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  Download,
  Eye
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Mock assignment data
const mockAssignmentData = {
  id: 'a1',
  title: 'Quadratic Equations Problem Set',
  description: 'Complete the following problem set demonstrating your understanding of quadratic equations, factoring techniques, and the quadratic formula. Show all your work and explain your reasoning.',
  courseId: 'c1',
  courseName: 'Advanced Mathematics - Quadratic Equations',
  dueDate: '2024-02-15T23:59:00',
  points: 50,
  instructions: `
## Instructions

1. Solve all 10 problems in the attached worksheet
2. Show all your work for full credit
3. Explain your reasoning for each solution
4. You may submit your work as:
   - A PDF document
   - Scanned images of handwritten work
   - A typed document

## Grading Criteria

- Correct solutions: 40 points
- Work shown: 5 points
- Explanations: 5 points

## Submission Requirements

- Maximum file size: 10MB per file
- Accepted formats: PDF, DOC, DOCX, JPG, PNG
- Multiple files allowed
  `,
  attachments: [
    { id: 'f1', name: 'Problem_Set_Quadratics.pdf', size: '245 KB', url: '/files/problem-set.pdf' },
    { id: 'f2', name: 'Formula_Sheet.pdf', size: '128 KB', url: '/files/formula-sheet.pdf' }
  ],
  submission: {
    status: 'draft', // draft, submitted, graded
    submittedAt: null,
    files: [],
    textContent: '',
    grade: null,
    feedback: null,
    gradedAt: null
  },
  previousSubmissions: [
    {
      id: 's1',
      submittedAt: '2024-02-10T14:30:00',
      files: [
        { name: 'my_solutions_v1.pdf', size: '1.2 MB' }
      ],
      grade: null,
      status: 'draft'
    }
  ]
}

export default function AssignmentPage() {
  const params = useParams()
  const router = useRouter()
  const assignmentId = params.assignmentId as string
  const courseId = params.courseId as string

  const [assignment] = useState(mockAssignmentData)
  const [textContent, setTextContent] = useState(assignment.submission.textContent)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [activeTab, setActiveTab] = useState('instructions')
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)

  const dueDate = new Date(assignment.dueDate)
  const now = new Date()
  const isOverdue = now > dueDate
  const timeUntilDue = dueDate.getTime() - now.getTime()
  const daysUntilDue = Math.floor(timeUntilDue / (1000 * 60 * 60 * 24))
  const hoursUntilDue = Math.floor((timeUntilDue % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setUploadedFiles(prev => [...prev, ...newFiles])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files)
      setUploadedFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleSaveDraft = () => {
    // Save draft logic
    alert('Draft saved successfully!')
  }

  const handleSubmit = () => {
    if (uploadedFiles.length === 0 && !textContent.trim()) {
      alert('Please add files or text content before submitting')
      return
    }
    setShowSubmitConfirm(true)
  }

  const confirmSubmit = () => {
    // Submit logic
    alert('Assignment submitted successfully!')
    setShowSubmitConfirm(false)
    router.push(`/dashboard/student/courses/${courseId}`)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Button>
      </div>

      {/* Assignment Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{assignment.title}</CardTitle>
              <p className="text-gray-600">{assignment.courseName}</p>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              {assignment.points} points
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="font-semibold">{dueDate.toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Time Remaining</p>
                <p className={`font-semibold ${isOverdue ? 'text-red-600' : ''}`}>
                  {isOverdue ? 'Overdue' : `${daysUntilDue}d ${hoursUntilDue}h`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {assignment.submission.status === 'submitted' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-orange-600" />
              )}
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold capitalize">{assignment.submission.status}</p>
              </div>
            </div>
          </div>

          {isOverdue && assignment.submission.status !== 'submitted' && (
            <Alert className="mt-4 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                This assignment is overdue. Late submissions may receive reduced credit.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Instructions & Attachments */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Materials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="instructions" className="flex-1">Instructions</TabsTrigger>
                  <TabsTrigger value="attachments" className="flex-1">Files</TabsTrigger>
                </TabsList>

                <TabsContent value="instructions" className="mt-4">
                  <div className="prose prose-sm max-w-none">
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {assignment.instructions}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="attachments" className="mt-4">
                  <div className="space-y-2">
                    {assignment.attachments.map(file => (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-gray-600">{file.size}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Previous Submissions */}
          {assignment.previousSubmissions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Previous Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {assignment.previousSubmissions.map(sub => (
                    <div key={sub.id} className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{sub.status}</Badge>
                        <span className="text-xs text-gray-600">
                          {new Date(sub.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {sub.files.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <File className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Submission Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drag & Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                  isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-700 mb-2">Drag and drop files here, or</p>
                <label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <Button variant="outline" asChild>
                    <span>Browse Files</span>
                  </Button>
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Accepted: PDF, DOC, DOCX, JPG, PNG (Max 10MB each)
                </p>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Uploaded Files ({uploadedFiles.length})</h4>
                  {uploadedFiles.map((file, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-3 border rounded bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <File className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-gray-600">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Text Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Written Response (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Type your response here... You can include explanations, notes, or additional information."
                className="w-full h-64 p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-2">
                {textContent.length} characters
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              className="flex-1"
              disabled={assignment.submission.status === 'submitted'}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={assignment.submission.status === 'submitted'}
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Assignment
            </Button>
          </div>

          {assignment.submission.status === 'submitted' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Assignment submitted successfully on {new Date(assignment.submission.submittedAt!).toLocaleString()}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-xl font-semibold mb-4">Confirm Submission</h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to submit this assignment? You won't be able to make changes after submission.
            </p>
            <div className="space-y-2 mb-6">
              <p className="text-sm">
                <span className="font-medium">Files:</span> {uploadedFiles.length} file(s)
              </p>
              <p className="text-sm">
                <span className="font-medium">Text content:</span> {textContent.length} characters
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={confirmSubmit} className="flex-1">
                Confirm Submit
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
