'use client'

import { File, Clock, CheckCircle, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Submission {
  id: string
  submittedAt: string
  files: Array<{ name: string; size: string }>
  grade: number | null
  feedback: string | null
  status: 'submitted' | 'graded'
}

interface SubmissionHistoryProps {
  submissions: Submission[]
}

export default function SubmissionHistory({ submissions }: SubmissionHistoryProps) {
  return (
    <div className="space-y-4">
      {submissions.map((submission, index) => (
        <Card key={submission.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">
                  Submission {submissions.length - index}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(submission.submittedAt).toLocaleString()}
                </p>
              </div>
              <Badge variant={submission.status === 'graded' ? 'default' : 'secondary'}>
                {submission.status === 'graded' ? 'Graded' : 'Awaiting Grade'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Files */}
            <div>
              <h4 className="font-semibold mb-2">Submitted Files</h4>
              <div className="space-y-2">
                {submission.files.map((file, fileIndex) => (
                  <div
                    key={fileIndex}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <File className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-gray-600">{file.size}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Grade */}
            {submission.grade !== null && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold">Grade</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {submission.grade}
                  </span>
                </div>
              </div>
            )}

            {/* Feedback */}
            {submission.feedback && (
              <div>
                <h4 className="font-semibold mb-2">Feedback</h4>
                <p className="text-sm text-gray-700">{submission.feedback}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
