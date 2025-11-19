'use client'

import { useState } from 'react'
import { X, Download, FileText, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'

interface GradeDetailsModalProps {
  grade: {
    id: string
    title: string
    courseName: string
    score: number
    maxScore: number
    percentage: number
    letterGrade: string
    submittedAt?: string
    gradedAt?: string
    feedback?: {
      overall: string
      strengths?: string[]
      improvements?: string[]
    }
    rubric?: Array<{
      criterion: string
      maxPoints: number
      earned: number
      feedback: string
    }>
    classStats?: {
      average: number
      median: number
      highest: number
      lowest: number
      yourRank: number
      totalStudents: number
    }
    files?: Array<{
      name: string
      url: string
      size: number
    }>
  }
  onClose: () => void
  onRegradeRequest?: (reason: string, details: string) => void
}

export default function GradeDetailsModal({ grade, onClose, onRegradeRequest }: GradeDetailsModalProps) {
  const [showRegradeForm, setShowRegradeForm] = useState(false)
  const [regradeReason, setRegradeReason] = useState('')
  const [regradeDetails, setRegradeDetails] = useState('')

  const handleRegradeSubmit = () => {
    if (onRegradeRequest && regradeReason && regradeDetails) {
      onRegradeRequest(regradeReason, regradeDetails)
      setShowRegradeForm(false)
      setRegradeReason('')
      setRegradeDetails('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">{grade.title}</h2>
            <p className="text-gray-600">{grade.courseName}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Grade Summary */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{grade.percentage}%</div>
              <div className="text-sm text-gray-600">Percentage</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{grade.letterGrade}</div>
              <div className="text-sm text-gray-600">Letter Grade</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold">{grade.score}/{grade.maxScore}</div>
              <div className="text-sm text-gray-600">Points</div>
            </div>
            {grade.classStats && (
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-3xl font-bold text-yellow-600">#{grade.classStats.yourRank}</div>
                <div className="text-sm text-gray-600">Class Rank</div>
              </div>
            )}
          </div>

          {/* Rubric */}
          {grade.rubric && grade.rubric.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">Grading Rubric</h3>
              <div className="space-y-3">
                {grade.rubric.map((item, index) => (
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
            </div>
          )}

          {/* Feedback */}
          {grade.feedback && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">Instructor Feedback</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700">{grade.feedback.overall}</p>
                </div>
                
                {grade.feedback.strengths && grade.feedback.strengths.length > 0 && (
                  <div>
                    <h4 className="font-medium text-green-600 mb-2">Strengths</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {grade.feedback.strengths.map((strength, index) => (
                        <li key={index} className="text-gray-700">{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {grade.feedback.improvements && grade.feedback.improvements.length > 0 && (
                  <div>
                    <h4 className="font-medium text-yellow-600 mb-2">Areas for Improvement</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {grade.feedback.improvements.map((improvement, index) => (
                        <li key={index} className="text-gray-700">{improvement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Class Statistics */}
          {grade.classStats && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">Class Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-gray-600">Your Score</div>
                  <div className="text-xl font-bold">{grade.score}</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-gray-600">Class Average</div>
                  <div className="text-xl font-bold">{grade.classStats.average}</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-gray-600">Highest Score</div>
                  <div className="text-xl font-bold text-green-600">{grade.classStats.highest}</div>
                </div>
                <div className="p-3 border rounded-lg">
                  <div className="text-sm text-gray-600">Your Rank</div>
                  <div className="text-xl font-bold">
                    {grade.classStats.yourRank} of {grade.classStats.totalStudents}
                  </div>
                </div>
              </div>
              
              {/* Comparison */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Performance Comparison</span>
                </div>
                <p className="text-sm text-gray-700">
                  You scored {grade.score - grade.classStats.average > 0 ? 
                    `${(grade.score - grade.classStats.average).toFixed(1)} points above` : 
                    `${Math.abs(grade.score - grade.classStats.average).toFixed(1)} points below`
                  } the class average.
                </p>
              </div>
            </div>
          )}

          {/* Files */}
          {grade.files && grade.files.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">Submitted Files</h3>
              <div className="space-y-2">
                {grade.files.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <FileText className="w-5 h-5 text-gray-500" />
                    <div className="flex-1">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-600">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regrade Request */}
          {!showRegradeForm ? (
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Disagree with your grade?</p>
                  <p className="text-sm text-gray-600">
                    You can request a regrade if you believe there was an error
                  </p>
                </div>
                <Button onClick={() => setShowRegradeForm(true)}>
                  Request Regrade
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 border rounded-lg">
              <h3 className="font-bold mb-3">Request Regrade</h3>
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
                  <Button onClick={handleRegradeSubmit}>
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
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
