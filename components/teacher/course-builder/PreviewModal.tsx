'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  X, 
  Play, 
  FileText, 
  Download, 
  Clock, 
  CheckCircle,
  Video,
  HelpCircle,
  FileCheck,
  Calendar
} from 'lucide-react'

interface PreviewModalProps {
  open: boolean
  onClose: () => void
  lesson: any
  courseData?: any
}

export function PreviewModal({ open, onClose, lesson, courseData }: PreviewModalProps) {
  if (!lesson) return null

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-5 h-5 text-blue-600" />
      case 'document': return <FileText className="w-5 h-5 text-green-600" />
      case 'quiz': return <HelpCircle className="w-5 h-5 text-purple-600" />
      case 'assignment': return <FileCheck className="w-5 h-5 text-orange-600" />
      case 'live-class': return <Calendar className="w-5 h-5 text-red-600" />
      default: return <FileText className="w-5 h-5 text-gray-600" />
    }
  }

  const renderLessonContent = () => {
    switch (lesson.type) {
      case 'video':
        return (
          <div className="space-y-4">
            {/* Video Player */}
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
              {lesson.content?.videoUrl ? (
                <video 
                  controls 
                  className="w-full h-full rounded-lg"
                  poster={lesson.content?.thumbnailUrl}
                >
                  <source src={lesson.content.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="text-center text-white">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No video uploaded yet</p>
                </div>
              )}
            </div>

            {/* Video Info */}
            {lesson.content?.videoUrl && (
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{lesson.duration || '00:00'}</span>
                </div>
                {lesson.content?.quality && (
                  <Badge variant="outline">{lesson.content.quality}</Badge>
                )}
                {lesson.content?.subtitles && (
                  <Badge variant="outline">Subtitles Available</Badge>
                )}
              </div>
            )}

            {/* Video Description */}
            {lesson.content?.description && (
              <div>
                <h4 className="font-medium mb-2">About this video</h4>
                <p className="text-gray-600">{lesson.content.description}</p>
              </div>
            )}

            {/* Resources */}
            {lesson.content?.resources && lesson.content.resources.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Resources</h4>
                <div className="space-y-2">
                  {lesson.content.resources.map((resource: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{resource.name}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'document':
        return (
          <div className="space-y-4">
            {/* Document Viewer */}
            <div className="border rounded-lg p-8 bg-gray-50 min-h-[400px]">
              {lesson.content?.documents && lesson.content.documents.length > 0 ? (
                <div className="space-y-4">
                  {lesson.content.documents.map((doc: any, index: number) => (
                    <div key={index} className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-blue-600" />
                          <div>
                            <p className="font-medium">{doc.fileName}</p>
                            <p className="text-sm text-gray-500">
                              {doc.fileSize ? `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No documents uploaded yet</p>
                </div>
              )}
            </div>

            {/* Document Description */}
            {lesson.content?.description && (
              <div>
                <h4 className="font-medium mb-2">About this lesson</h4>
                <p className="text-gray-600">{lesson.content.description}</p>
              </div>
            )}
          </div>
        )

      case 'quiz':
        return (
          <div className="space-y-4">
            {/* Quiz Info */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Questions</p>
                <p className="text-2xl font-bold text-blue-600">
                  {lesson.content?.questions?.length || 0}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Time Limit</p>
                <p className="text-2xl font-bold text-green-600">
                  {lesson.content?.timeLimit || 'No limit'}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Passing Score</p>
                <p className="text-2xl font-bold text-purple-600">
                  {lesson.content?.passingScore || 70}%
                </p>
              </div>
            </div>

            {/* Quiz Settings */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Quiz Settings</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Attempts Allowed</span>
                  <span className="font-medium">
                    {lesson.content?.attemptsAllowed === -1 ? 'Unlimited' : lesson.content?.attemptsAllowed || 1}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Show Correct Answers</span>
                  <span className="font-medium">
                    {lesson.content?.showCorrectAnswers ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Randomize Questions</span>
                  <span className="font-medium">
                    {lesson.content?.randomizeQuestions ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Sample Questions */}
            {lesson.content?.questions && lesson.content.questions.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Sample Questions</h4>
                <div className="space-y-4">
                  {lesson.content.questions.slice(0, 3).map((question: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start gap-2 mb-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <p className="font-medium flex-1">{question.text}</p>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          {question.points} {question.points === 1 ? 'point' : 'points'}
                        </Badge>
                      </div>
                      {question.options && (
                        <div className="space-y-2 ml-8">
                          {question.options.map((option: any, optIndex: number) => (
                            <div 
                              key={optIndex} 
                              className={`p-2 rounded ${option.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}
                            >
                              <div className="flex items-center gap-2">
                                {option.isCorrect && <CheckCircle className="w-4 h-4 text-green-600" />}
                                <span className="text-sm">{option.text}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {lesson.content.questions.length > 3 && (
                    <p className="text-sm text-gray-500 text-center">
                      + {lesson.content.questions.length - 3} more questions
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )

      case 'assignment':
        return (
          <div className="space-y-4">
            {/* Assignment Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="text-lg font-bold text-orange-600">
                  {lesson.content?.dueDate ? new Date(lesson.content.dueDate).toLocaleDateString() : 'No due date'}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Max Points</p>
                <p className="text-lg font-bold text-blue-600">
                  {lesson.content?.maxPoints || 100}
                </p>
              </div>
            </div>

            {/* Assignment Description */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Instructions</h4>
              <p className="text-gray-600 whitespace-pre-wrap">
                {lesson.content?.instructions || 'No instructions provided'}
              </p>
            </div>

            {/* Submission Requirements */}
            {lesson.content?.submissionType && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Submission Requirements</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Submission Type</span>
                    <Badge variant="outline" className="capitalize">
                      {lesson.content.submissionType}
                    </Badge>
                  </div>
                  {lesson.content.allowedFileTypes && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Allowed File Types</span>
                      <span className="font-medium">{lesson.content.allowedFileTypes.join(', ')}</span>
                    </div>
                  )}
                  {lesson.content.maxFileSize && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Max File Size</span>
                      <span className="font-medium">{lesson.content.maxFileSize} MB</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Attachments */}
            {lesson.content?.attachments && lesson.content.attachments.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Assignment Materials</h4>
                <div className="space-y-2">
                  {lesson.content.attachments.map((file: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{file.name}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      case 'live-class':
        return (
          <div className="space-y-4">
            {/* Class Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Scheduled Date</p>
                <p className="text-lg font-bold text-red-600">
                  {lesson.content?.scheduledDate 
                    ? new Date(lesson.content.scheduledDate).toLocaleDateString() 
                    : 'Not scheduled'}
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-lg font-bold text-blue-600">
                  {lesson.content?.duration || lesson.duration || 'TBD'}
                </p>
              </div>
            </div>

            {/* Class Description */}
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">About this class</h4>
              <p className="text-gray-600">
                {lesson.content?.description || 'No description provided'}
              </p>
            </div>

            {/* Meeting Details */}
            {lesson.content?.meetingLink && (
              <div className="border rounded-lg p-4 bg-blue-50">
                <h4 className="font-medium mb-2">Meeting Details</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Platform: </span>
                    <span className="font-medium">{lesson.content.platform || 'Zoom'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Meeting Link: </span>
                    <a href={lesson.content.meetingLink} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                      Join Meeting
                    </a>
                  </div>
                  {lesson.content.meetingId && (
                    <div>
                      <span className="text-gray-600">Meeting ID: </span>
                      <span className="font-mono">{lesson.content.meetingId}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="text-center py-12 text-gray-500">
            <p>No preview available for this lesson type</p>
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              {getLessonIcon(lesson.type)}
              <div>
                <DialogTitle className="text-xl">{lesson.title}</DialogTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="capitalize">{lesson.type.replace('-', ' ')}</Badge>
                  {lesson.isFree && <Badge className="bg-green-100 text-green-800">Free Preview</Badge>}
                  {lesson.status === 'published' ? (
                    <Badge className="bg-blue-100 text-blue-800">Published</Badge>
                  ) : (
                    <Badge variant="outline">Draft</Badge>
                  )}
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="content" className="mt-4">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-4">
            {renderLessonContent()}
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Lesson Settings</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Status</span>
                    <Badge variant={lesson.status === 'published' ? 'default' : 'outline'}>
                      {lesson.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Free Preview</span>
                    <span className="font-medium">{lesson.isFree ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{lesson.duration || 'Not set'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Order</span>
                    <span className="font-medium">#{lesson.order}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
