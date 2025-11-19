'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, Download, FileText, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'

export default function GradeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const itemId = params.itemId as string
  
  const [gradeDetail, setGradeDetail] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showRegradeForm, setShowRegradeForm] = useState(false)
  const [regradeReason, setRegradeReason] = useState('')
  const [regradeDetails, setRegradeDetails] = useState('')

  useEffect(() => {
    loadGradeDetail()
  }, [itemId])

  const loadGradeDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/student/grades/${itemId}`)
      const data = await response.json()
      
      if (data.success) {
        setGradeDetail(data.data)
      }
    } catch (error) {
      console.error('Failed to load grade details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegradeRequest = async () => {
    try {
      const response = await fetch(`/api/student/assignments/${itemId}/regrade`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: regradeReason,
          details: regradeDetails
        })
      })

      const data = await response.json()
      
      if (data.success) {
        alert('Regrade request submitted successfully')
        setShowRegradeForm(false)
        setRegradeReason('')
        setRegradeDetails('')
      }
    } catch (error) {
      console.error('Failed to submit regrade request:', error)
      alert('Failed to submit regrade request')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading grade details...</p>
        </div>
      </div>
    )
  }

  if (!gradeDetail) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">Grade details not found</p>
          <Button onClick={() => router.push('/student/grades')} className="mt-4">
            Back to Grades
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/student/grades')}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Grades
            </Button>
            <div>
              <h1 className="text-xl font-bold">{gradeDetail.title}</h1>
              <p className="text-sm text-gray-600">{gradeDetail.courseName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Grade Summary */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">
                  {gradeDetail.percentage}%
                </div>
                <div className="text-sm text-gray-600 mt-1">Percentage</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">
                  {gradeDetail.letterGrade}
                </div>
                <div className="text-sm text-gray-600 mt-1">Letter Grade</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">
                  {gradeDetail.score}/{gradeDetail.maxScore}
                </div>
                <div className="text-sm text-gray-600 mt-1">Points</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">
                  #{gradeDetail.classStats.yourRank}
                </div>
                <div className="text-sm text-gray-600 mt-1">Class Rank</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Rubric */}
            <Card>
              <CardHeader>
                <CardTitle>Grading Rubric</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gradeDetail.rubric.map((item: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{item.criterion}</h4>
                        <Badge variant="outline">
                          {item.earned}/{item.maxPoints}
                        </Badge>
                      </div>
                      <Progress 
                        value={(item.earned / item.maxPoints) * 100} 
                        className="h-2 mb-2"
                      />
                      <p className="text-sm text-gray-600">{item.feedback}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Feedback */}
            <Card>
              <CardHeader>
                <CardTitle>Instructor Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Overall Comments</h4>
                    <p className="text-gray-700">{gradeDetail.feedback.overall}</p>
                  </div>
                  
                  {gradeDetail.feedback.strengths && (
                    <div>
                      <h4 className="font-medium mb-2 text-green-600">Strengths</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {gradeDetail.feedback.strengths.map((strength: string, index: number) => (
                          <li key={index} className="text-gray-700">{strength}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {gradeDetail.feedback.improvements && (
                    <div>
                      <h4 className="font-medium mb-2 text-yellow-600">Areas for Improvement</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {gradeDetail.feedback.improvements.map((improvement: string, index: number) => (
                          <li key={index} className="text-gray-700">{improvement}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Regrade Request */}
            {!showRegradeForm ? (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium">Disagree with your grade?</p>
                      <p className="text-sm text-gray-600">
                        You can request a regrade if you believe there was an error
                      </p>
                    </div>
                    <Button onClick={() => setShowRegradeForm(true)}>
                      Request Regrade
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Request Regrade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Reason for Request
                      </label>
                      <select
                        value={regradeReason}
                        onChange={(e) => setRegradeReason(e.target.value)}
                        className="w-full border rounded-lg p-2"
                      >
                        <option value="">Select a reason</option>
                        <option value="grading_error">Grading Error</option>
                        <option value="rubric_misapplication">Rubric Misapplication</option>
                        <option value="missing_credit">Missing Credit</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Details
                      </label>
                      <Textarea
                        value={regradeDetails}
                        onChange={(e) => setRegradeDetails(e.target.value)}
                        placeholder="Please explain your concern in detail..."
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleRegradeRequest}>
                        Submit Request
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowRegradeForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {/* Class Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Class Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Your Score</span>
                    <span className="font-medium">{gradeDetail.score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Class Average</span>
                    <span className="font-medium">{gradeDetail.classStats.average}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Class Median</span>
                    <span className="font-medium">{gradeDetail.classStats.median}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Highest Score</span>
                    <span className="font-medium">{gradeDetail.classStats.highest}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Your Rank</span>
                    <span className="font-medium">
                      {gradeDetail.classStats.yourRank} of {gradeDetail.classStats.totalStudents}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submission Files */}
            {gradeDetail.files && gradeDetail.files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Submitted Files</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {gradeDetail.files.map((file: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-gray-600">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
