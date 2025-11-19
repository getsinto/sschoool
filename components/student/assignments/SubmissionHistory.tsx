'use client'

import { Clock, FileText, CheckCircle, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Submission {
  id: string
  version: number
  submittedAt: string
  status: 'draft' | 'submitted' | 'graded'
  grade?: number
  feedback?: string
  files: { name: string; url: string }[]
}

interface SubmissionHistoryProps {
  submissions: Submission[]
  maxPoints: number
}

export default function SubmissionHistory({ submissions, maxPoints }: SubmissionHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Submission History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No submissions yet</p>
          ) : (
            submissions.map((submission) => (
              <div
                key={submission.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">Version {submission.version}</h4>
                      <Badge variant={
                        submission.status === 'graded' ? 'default' :
                        submission.status === 'submitted' ? 'secondary' : 'outline'
                      }>
                        {submission.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(submission.submittedAt).toLocaleString()}</span>
                    </div>
                  </div>

                  {submission.grade !== undefined && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {submission.grade}/{maxPoints}
                      </div>
                      <div className="text-sm text-gray-600">
                        {Math.round((submission.grade / maxPoints) * 100)}%
                      </div>
                    </div>
                  )}
                </div>

                {submission.feedback && (
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm font-medium text-blue-900 mb-1">Teacher Feedback:</p>
                    <p className="text-sm text-blue-800">{submission.feedback}</p>
                  </div>
                )}

                {submission.files.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Submitted Files:</p>
                    <div className="space-y-1">
                      {submission.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-600" />
                            <span className="text-sm">{file.name}</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(file.url, '_blank')}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
