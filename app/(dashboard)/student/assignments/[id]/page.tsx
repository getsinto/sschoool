'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  Award,
  Clock,
  FileText,
  CheckCircle,
  BookOpen,
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import SubmissionHistory from '@/components/student/assignments/SubmissionHistory'

// Mock data
const mockAssignment = {
  id: 'a4',
  title: 'World War II Timeline',
  courseId: 'c4',
  courseName: 'World History',
  dueDate: '2024-01-20T23:59:00',
  maxPoints: 60,
  status: 'graded',
  grade: 56,
  percentage: 93.3,
  submittedAt: '2024-01-19T16:45:00',
  gradedAt: '2024-01-21T10:30:00',
  feedback: 'Excellent work! Your timeline is very detailed and well-organized. You clearly understand the sequence of major events and their significance. Minor deduction for missing one key battle date.',
  rubric: [
    { criterion: 'Completeness', points: 15, maxPoints: 15, feedback: 'All major events included' },
    { criterion: 'Accuracy', points: 14, maxPoints: 15, feedback: 'One minor date error' },
    { criterion: 'Organization', points: 15, maxPoints: 15, feedback: 'Excellent chronological structure' },
    { criterion: 'Analysis', points: 12, maxPoints: 15, feedback: 'Good analysis, could be deeper' }
  ],
  description: 'Create a comprehensive timeline of World War II, including major battles, political events, and turning points. Include dates, locations, and brief descriptions of significance.',
  instructions: `
## Requirements:
1. Include at least 20 major events
2. Provide dates and locations
3. Explain the significance of each event
4. Use proper formatting and citations

## Submission Format:
- PDF or Word document
- Include a title page
- Use chronological order
- Include a bibliography
  `,
  relatedLessons: [
    { id: 'l1', title: 'Causes of World War II', completed: true },
    { id: 'l2', title: 'Major Battles and Campaigns', completed: true },
    { id: 'l3', title: 'The Holocaust', completed: true },
    { id: 'l4', title: 'End of the War', completed: false }
  ],
  submissions: [
    {
      id: 's1',
      submittedAt: '2024-01-19T16:45:00',
      files: [
        { name: 'WWII_Timeline_Final.pdf', size: '2.3 MB' }
      ],
      grade: 56,
      feedback: 'Excellent work! Your timeline is very detailed and well-organized.',
      status: 'graded'
    }
  ]
}

export default function AssignmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const assignmentId = params.id as string
  
  const [assignment] = useState(mockAssignment)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Assignments
        </Button>
      </div>

      {/* Assignment Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{assignment.title}</h1>
                <Badge variant={assignment.status === 'graded' ? 'default' : 'secondary'}>
                  {assignment.status === 'graded' ? 'Graded' : 'Submitted'}
                </Badge>
              </div>
              <p className="text-gray-600 mb-4">{assignment.courseName}</p>
            </div>

            {assignment.grade !== null && (
              <div className="text-right">
                <div className="text-4xl font-bold text-green-600">
                  {assignment.grade}/{assignment.maxPoints}
                </div>
                <div className="text-lg text-gray-600">{assignment.percentage.toFixed(1)}%</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-gray-600" />
              <div>
                <p className="text-gray-600">Due Date</p>
                <p className="font-semibold">{new Date(assignment.dueDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-600" />
              <div>
                <p className="text-gray-600">Submitted</p>
                <p className="font-semibold">{new Date(assignment.submittedAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-gray-600" />
              <div>
                <p className="text-gray-600">Graded</p>
                <p className="font-semibold">{new Date(assignment.gradedAt!).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Award className="w-4 h-4 text-gray-600" />
              <div>
                <p className="text-gray-600">Max Points</p>
                <p className="font-semibold">{assignment.maxPoints}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="feedback">
        <TabsList>
          <TabsTrigger value="feedback">Feedback & Grade</TabsTrigger>
          <TabsTrigger value="submission">My Submission</TabsTrigger>
          <TabsTrigger value="details">Assignment Details</TabsTrigger>
          <TabsTrigger value="related">Related Lessons</TabsTrigger>
        </TabsList>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-6">
          {/* Overall Feedback */}
          <Card>
            <CardHeader>
              <CardTitle>Teacher Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{assignment.feedback}</p>
            </CardContent>
          </Card>

          {/* Rubric Breakdown */}
          {assignment.rubric && (
            <Card>
              <CardHeader>
                <CardTitle>Grade Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignment.rubric.map((item, index) => (
                    <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{item.criterion}</h4>
                        <span className="text-lg font-bold">
                          {item.points}/{item.maxPoints}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{item.feedback}</p>
                    </div>
                  ))}
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-2xl font-bold text-green-600">
                        {assignment.grade}/{assignment.maxPoints}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Submission Tab */}
        <TabsContent value="submission">
          <SubmissionHistory submissions={assignment.submissions} />
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{assignment.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700">{assignment.instructions}</pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Related Lessons Tab */}
        <TabsContent value="related">
          <Card>
            <CardHeader>
              <CardTitle>Related Course Lessons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {assignment.relatedLessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {lesson.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                      )}
                      <span className="font-medium">{lesson.title}</span>
                    </div>
                    <Link href={`/dashboard/student/learn/${assignment.courseId}/${lesson.id}`}>
                      <Button variant="outline" size="sm">
                        {lesson.completed ? 'Review' : 'Start'}
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href={`/dashboard/student/courses/${assignment.courseId}`}>
          <Button variant="outline">
            <BookOpen className="w-4 h-4 mr-2" />
            View Course
          </Button>
        </Link>
        <Button variant="outline">
          <FileText className="w-4 h-4 mr-2" />
          Download Submission
        </Button>
      </div>
    </div>
  )
}
