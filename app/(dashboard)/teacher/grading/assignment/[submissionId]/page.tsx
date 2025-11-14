'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Save,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  Download,
  Eye,
  Calendar,
  MessageSquare,
  Flag,
  RotateCcw,
  FileText,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Mock data
const mockAssignmentSubmission = {
  id: 'sub_456',
  student: {
    name: 'Emma Davis',
    email: 'emma@example.com',
    avatar: '/avatars/emma.jpg'
  },
  assignment: {
    title: 'Physics Lab Report - Pendulum Motion',
    course: 'Grade 9 Physics',
    instructions: 'Conduct the pendulum experiment and write a comprehensive lab report including hypothesis, methodology, data analysis, and conclusions. Include all calculations and graphs.',
    maxPoints: 100,
    passingScore: 70,
    submissionType: 'both',
    rubric: [
      { criterion: 'Hypothesis & Introduction', maxPoints: 20, description: 'Clear hypothesis and background' },
      { criterion: 'Methodology', maxPoints: 20, description: 'Detailed experimental procedure' },
      { criterion: 'Data & Analysis', maxPoints: 30, description: 'Accurate data collection and analysis' },
      { criterion: 'Conclusions', maxPoints: 20, description: 'Valid conclusions based on data' },
      { criterion: 'Presentation', maxPoints: 10, description: 'Professional formatting and clarity' }
    ]
  },
  submission: {
    submittedAt: '2024-01-18T20:15:00',
    dueDate: '2024-01-21T23:59:00',
    isLate: false,
    latePenalty: 0,
    status: 'pending'
  },
  files: [
    {
      id: 'file1',
      name: 'pendulum_lab_report.pdf',
      size: '2.3 MB',
      type: 'pdf',
      url: '/files/pendulum_lab_report.pdf'
    },
    {
      id: 'file2',
      name: 'data_analysis.xlsx',
      size: '156 KB',
      type: 'xlsx',
      url: '/files/data_analysis.xlsx'
    }
  ],
  textSubmission: 'Summary: The experiment confirmed that the period of a pendulum is independent of mass and amplitude (for small angles), and is proportional to the square root of length...',
  wordCount: 1847
}

export default function AssignmentGradingPage() {
  const params = useParams()
  const router = useRouter()
  const [rubricGrades, setRubricGrades] = useState<{[key: string]: {points: number, feedback: string}}>({})
  const [manualGrade, setManualGrade] = useState<number>(0)
  const [overallFeedback, setOverallFeedback] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('files')

  const submissionId = params.submissionId as string
  const hasRubric = mockAssignmentSubmission.assignment.rubric && mockAssignmentSubmission.assignment.rubric.length > 0

  // Calculate total from rubric
  const rubricTotal = hasRubric 
    ? mockAssignmentSubmission.assignment.rubric.reduce((sum, criterion) => {
        const grade = rubricGrades[criterion.criterion]
        return sum + (grade ? grade.points : 0)
      }, 0)
    : manualGrade

  const finalGrade = rubricTotal - mockAssignmentSubmission.submission.latePenalty
  const percentage = Math.round((finalGrade / mockAssignmentSubmission.assignment.maxPoints) * 100)
  const isPassing = percentage >= mockAssignmentSubmission.assignment.passingScore

  const handleRubricGrade = (criterion: string, points: number, feedback: string) => {
    setRubricGrades(prev => ({
      ...prev,
      [criterion]: { points, feedback }
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    // TODO: Save to API
    setTimeout(() => setIsSaving(false), 1000)
  }

  const handleSubmitGrade = async () => {
    setIsSaving(true)
    // TODO: Submit final grade
    setTimeout(() => {
      setIsSaving(false)
      router.push('/dashboard/teacher/grading')
    }, 1000)
  }

  const handleRequestResubmission = () => {
    // TODO: Request resubmission
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Grade Assignment</h1>
            <p className="text-gray-600">{mockAssignmentSubmission.assignment.title}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button variant="outline" onClick={handleRequestResubmission}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Request Resubmission
          </Button>
          <Button onClick={handleSubmitGrade} disabled={isSaving}>
            Submit Grade
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Submission View */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student & Assignment Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={mockAssignmentSubmission.student.avatar} />
                    <AvatarFallback>{mockAssignmentSubmission.student.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{mockAssignmentSubmission.student.name}</h3>
                    <p className="text-sm text-gray-600">{mockAssignmentSubmission.student.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Submitted: {new Date(mockAssignmentSubmission.submission.submittedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Clock className="w-4 h-4" />
                    <span>Due: {new Date(mockAssignmentSubmission.submission.dueDate).toLocaleString()}</span>
                  </div>
                  {mockAssignmentSubmission.submission.isLate && (
                    <Badge variant="destructive" className="mt-2">
                      Late (-{mockAssignmentSubmission.submission.latePenalty} points)
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">Course:</span>
                  <span>{mockAssignmentSubmission.assignment.course}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Instructions:</span>
                  <p className="text-gray-600 mt-1">{mockAssignmentSubmission.assignment.instructions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission Content */}
          <Card>
            <CardHeader>
              <CardTitle>Student Submission</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  {mockAssignmentSubmission.files.length > 0 && (
                    <TabsTrigger value="files">
                      Files ({mockAssignmentSubmission.files.length})
                    </TabsTrigger>
                  )}
                  {mockAssignmentSubmission.textSubmission && (
                    <TabsTrigger value="text">
                      Text Submission
                    </TabsTrigger>
                  )}
                </TabsList>

                {/* Files Tab */}
                <TabsContent value="files" className="space-y-4">
                  {mockAssignmentSubmission.files.map((file) => (
                    <div key={file.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-blue-600" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-gray-600">{file.size}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                {/* Text Tab */}
                <TabsContent value="text" className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-600">
                        Word count: {mockAssignmentSubmission.wordCount}
                      </span>
                    </div>
                    <div className="prose max-w-none">
                      {mockAssignmentSubmission.textSubmission}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Grading Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Score Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Grade Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">
                  {finalGrade}/{mockAssignmentSubmission.assignment.maxPoints}
                </div>
                <div className="text-2xl font-semibold">{percentage}%</div>
                <Progress value={percentage} className="mt-3" />
              </div>

              {mockAssignmentSubmission.submission.latePenalty > 0 && (
                <div className="text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Late penalty: -{mockAssignmentSubmission.submission.latePenalty} points
                </div>
              )}

              <div className="text-center">
                <Badge className={isPassing ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {isPassing ? (
                    <><CheckCircle className="w-4 h-4 mr-1" /> PASS</>
                  ) : (
                    <><XCircle className="w-4 h-4 mr-1" /> FAIL</>
                  )}
                </Badge>
                <p className="text-xs text-gray-600 mt-1">
                  Passing score: {mockAssignmentSubmission.assignment.passingScore}%
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Rubric Grading */}
          {hasRubric ? (
            <Card>
              <CardHeader>
                <CardTitle>Rubric Grading</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockAssignmentSubmission.assignment.rubric.map((criterion) => (
                  <div key={criterion.criterion} className="space-y-2 pb-4 border-b last:border-b-0">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{criterion.criterion}</h4>
                        <p className="text-xs text-gray-600">{criterion.description}</p>
                      </div>
                      <span className="text-xs text-gray-500">/{criterion.maxPoints}</span>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      max={criterion.maxPoints}
                      value={rubricGrades[criterion.criterion]?.points || ''}
                      onChange={(e) => handleRubricGrade(
                        criterion.criterion,
                        parseInt(e.target.value) || 0,
                        rubricGrades[criterion.criterion]?.feedback || ''
                      )}
                      placeholder={`0-${criterion.maxPoints}`}
                      className="h-8"
                    />
                    <Textarea
                      value={rubricGrades[criterion.criterion]?.feedback || ''}
                      onChange={(e) => handleRubricGrade(
                        criterion.criterion,
                        rubricGrades[criterion.criterion]?.points || 0,
                        e.target.value
                      )}
                      placeholder="Feedback..."
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Manual Grading</CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="manual-grade">Points Earned</Label>
                <Input
                  id="manual-grade"
                  type="number"
                  min="0"
                  max={mockAssignmentSubmission.assignment.maxPoints}
                  value={manualGrade || ''}
                  onChange={(e) => setManualGrade(parseInt(e.target.value) || 0)}
                  placeholder={`0-${mockAssignmentSubmission.assignment.maxPoints}`}
                />
                <p className="text-xs text-gray-600 mt-1">
                  Max: {mockAssignmentSubmission.assignment.maxPoints} points
                </p>
              </CardContent>
            </Card>
          )}

          {/* Overall Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={overallFeedback}
                onChange={(e) => setOverallFeedback(e.target.value)}
                placeholder="Provide overall feedback for the student..."
                rows={6}
              />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message Student
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                <Flag className="w-4 h-4 mr-2" />
                Report Issue
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 right-4">
        <Card className="p-3">
          <div className="text-xs text-gray-600 space-y-1">
            <div><kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Ctrl+S</kbd> Save Draft</div>
          </div>
        </Card>
      </div>
    </div>
  )
}
