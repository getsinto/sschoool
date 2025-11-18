'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, Eye, FileText, AlertCircle } from 'lucide-react'

interface AssignmentFile {
  id: string
  name: string
  size: string
  type: string
  url: string
}

interface AssignmentReviewerProps {
  title: string
  instructions: string
  submittedAt: string
  dueDate: string
  isLate: boolean
  latePenalty: number
  files?: AssignmentFile[]
  textSubmission?: string
  wordCount?: number
  onDownload?: (fileId: string) => void
  onPreview?: (fileId: string) => void
}

export default function AssignmentReviewer({
  title,
  instructions,
  submittedAt,
  dueDate,
  isLate,
  latePenalty,
  files = [],
  textSubmission,
  wordCount,
  onDownload,
  onPreview
}: AssignmentReviewerProps) {
  return (
    <div className="space-y-4">
      {/* Assignment Details */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{title}</CardTitle>
              <p className="text-sm text-gray-600 mt-2">{instructions}</p>
            </div>
            {isLate && (
              <Badge variant="destructive">
                <AlertCircle className="w-3 h-3 mr-1" />
                Late (-{latePenalty} points)
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Submitted:</span>
              <p className="font-medium">{new Date(submittedAt).toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-600">Due Date:</span>
              <p className="font-medium">{new Date(dueDate).toLocaleString()}</p>
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
          <Tabs defaultValue={files.length > 0 ? 'files' : 'text'}>
            {files.length > 0 && textSubmission && (
              <TabsList>
                <TabsTrigger value="files">Files ({files.length})</TabsTrigger>
                <TabsTrigger value="text">Text Submission</TabsTrigger>
              </TabsList>
            )}

            {files.length > 0 && (
              <TabsContent value="files" className="space-y-3">
                {files.map((file) => (
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
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onPreview?.(file.id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onDownload?.(file.id)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
            )}

            {textSubmission && (
              <TabsContent value="text">
                <div className="bg-gray-50 rounded-lg p-4">
                  {wordCount && (
                    <div className="flex justify-between items-center mb-3 pb-3 border-b">
                      <span className="text-sm text-gray-600">Word count: {wordCount}</span>
                    </div>
                  )}
                  <div className="prose max-w-none whitespace-pre-wrap">
                    {textSubmission}
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
