'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Video, FileText, HelpCircle, FileCheck, Calendar, Type, Image as ImageIcon } from 'lucide-react'
import { TextLessonEditor } from './TextLessonEditor'
import { ImageLessonGallery } from './ImageLessonGallery'
import { VideoEnhancementsForm } from './VideoEnhancementsForm'
import { LessonResourcesManager } from './LessonResourcesManager'
import { 
  LessonType, 
  TextLessonContent, 
  ImageLessonContent,
  VideoQualityOptions,
  VideoSubtitle,
  VideoChapter,
  LessonResource,
  CompletionRequirement,
  LessonAccessType
} from '@/types/lesson'

interface LessonModalProps {
  open: boolean
  onClose: () => void
  onSave: (lesson: any) => void
  moduleId: string // Changed from sectionId
  lesson?: any
}

export function LessonModal({ open, onClose, onSave, moduleId, lesson }: LessonModalProps) {
  const [formData, setFormData] = useState({
    title: lesson?.title || '',
    subtitle: lesson?.subtitle || '',
    description: lesson?.description || '',
    type: (lesson?.type || 'video') as LessonType,
    duration: lesson?.duration || '',
    // Content specific
    videoUrl: lesson?.videoUrl || '',
    documentUrl: lesson?.documentUrl || '',
    textContent: lesson?.textContent as TextLessonContent | undefined,
    imageContent: lesson?.imageContent as ImageLessonContent | undefined,
    // Video enhancements
    videoQualityOptions: lesson?.videoQualityOptions as VideoQualityOptions | undefined,
    videoSubtitles: lesson?.videoSubtitles as VideoSubtitle[] | undefined,
    videoChapters: lesson?.videoChapters as VideoChapter[] | undefined,
    // Resources
    resources: lesson?.resources as LessonResource[] | undefined,
    // Settings
    accessType: (lesson?.accessType || 'enrolled_only') as LessonAccessType,
    completionRequirement: (lesson?.completionRequirement || 'manual') as CompletionRequirement,
    downloadAllowed: lesson?.downloadAllowed ?? true,
    printAllowed: lesson?.printAllowed ?? true,
    canAnnotate: lesson?.canAnnotate ?? false,
    enableDiscussion: lesson?.enableDiscussion ?? true,
    scheduledPublishAt: lesson?.scheduledPublishAt || '',
    isPublished: lesson?.isPublished ?? true
  })

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSave = () => {
    onSave({
      ...formData,
      moduleId,
      id: lesson?.id || `lesson-${Date.now()}`
    })
    onClose()
  }

  const renderContentTab = () => {
    switch (formData.type) {
      case 'video':
        return (
          <div className="space-y-6">
            <div>
              <Label>Video URL or Upload</Label>
              <Input
                value={formData.videoUrl}
                onChange={(e) => handleChange('videoUrl', e.target.value)}
                placeholder="YouTube, Vimeo URL or upload video"
              />
              <p className="text-xs text-gray-500 mt-1">
                Paste a video URL or click to upload (MP4, MOV, AVI up to 2GB)
              </p>
            </div>

            {/* Video Enhancements */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">Video Enhancements</h3>
              <VideoEnhancementsForm
                qualityOptions={formData.videoQualityOptions}
                subtitles={formData.videoSubtitles || []}
                chapters={formData.videoChapters || []}
                onQualityChange={(options) => handleChange('videoQualityOptions', options)}
                onSubtitlesChange={(subs) => handleChange('videoSubtitles', subs)}
                onChaptersChange={(chaps) => handleChange('videoChapters', chaps)}
              />
            </div>
          </div>
        )

      case 'document':
        return (
          <div className="space-y-4">
            <div>
              <Label>Document Upload</Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xlsx"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleChange('documentUrl', URL.createObjectURL(file))
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                PDF, DOC, DOCX, PPT, PPTX, XLSX up to 50MB
              </p>
            </div>

            {/* Document Permissions */}
            <div className="border-t pt-4 space-y-4">
              <h3 className="font-medium">Document Permissions</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Download</Label>
                  <p className="text-xs text-gray-500">Students can download this document</p>
                </div>
                <Switch
                  checked={formData.downloadAllowed}
                  onCheckedChange={(checked) => handleChange('downloadAllowed', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Print</Label>
                  <p className="text-xs text-gray-500">Students can print this document</p>
                </div>
                <Switch
                  checked={formData.printAllowed}
                  onCheckedChange={(checked) => handleChange('printAllowed', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Annotations</Label>
                  <p className="text-xs text-gray-500">Students can highlight and annotate</p>
                </div>
                <Switch
                  checked={formData.canAnnotate}
                  onCheckedChange={(checked) => handleChange('canAnnotate', checked)}
                />
              </div>
            </div>
          </div>
        )

      case 'text':
        return (
          <div className="space-y-4">
            <TextLessonEditor
              content={formData.textContent}
              onChange={(content) => handleChange('textContent', content)}
            />
          </div>
        )

      case 'image':
        return (
          <div className="space-y-4">
            <ImageLessonGallery
              content={formData.imageContent}
              onChange={(content) => handleChange('imageContent', content)}
            />
          </div>
        )

      case 'quiz':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Quiz builder will open in a separate interface
            </p>
            {/* TODO: Add QuizBuilder component */}
          </div>
        )

      case 'assignment':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Assignment form will open in a separate interface
            </p>
            {/* TODO: Add AssignmentForm component */}
          </div>
        )

      case 'live_class':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Live class scheduling will open in a separate interface
            </p>
            {/* TODO: Add LiveClassForm component */}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {lesson ? 'Edit Lesson' : 'Create New Lesson'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4">
            <div>
              <Label>
                Lesson Title <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Enter lesson title"
                required
              />
            </div>

            <div>
              <Label>Lesson Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of the lesson"
                rows={3}
              />
            </div>

            <div>
              <Label>Lesson Subtitle (optional)</Label>
              <Input
                value={formData.subtitle}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                placeholder="Short subtitle or tagline"
              />
            </div>

            <div>
              <Label>
                Lesson Type <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value) => handleChange('type', value as LessonType)}
                className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="video" id="video" />
                  <Label htmlFor="video" className="flex items-center gap-2 cursor-pointer">
                    <Video className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">Video</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="document" id="document" />
                  <Label htmlFor="document" className="flex items-center gap-2 cursor-pointer">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Document</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 bg-blue-50">
                  <RadioGroupItem value="text" id="text" />
                  <Label htmlFor="text" className="flex items-center gap-2 cursor-pointer">
                    <Type className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm">Text</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 bg-blue-50">
                  <RadioGroupItem value="image" id="image" />
                  <Label htmlFor="image" className="flex items-center gap-2 cursor-pointer">
                    <ImageIcon className="w-4 h-4 text-pink-600" />
                    <span className="text-sm">Image</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="quiz" id="quiz" />
                  <Label htmlFor="quiz" className="flex items-center gap-2 cursor-pointer">
                    <HelpCircle className="w-4 h-4 text-purple-600" />
                    <span className="text-sm">Quiz</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="assignment" id="assignment" />
                  <Label htmlFor="assignment" className="flex items-center gap-2 cursor-pointer">
                    <FileCheck className="w-4 h-4 text-orange-600" />
                    <span className="text-sm">Assignment</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="live_class" id="live_class" />
                  <Label htmlFor="live_class" className="flex items-center gap-2 cursor-pointer">
                    <Calendar className="w-4 h-4 text-red-600" />
                    <span className="text-sm">Live Class</span>
                  </Label>
                </div>
              </RadioGroup>
              <p className="text-xs text-gray-500 mt-2">
                {formData.type === 'text' && '✨ NEW: Rich text lesson with formatting'}
                {formData.type === 'image' && '✨ NEW: Image gallery with multiple layouts'}
              </p>
            </div>

            <div>
              <Label>
                Estimated Duration (minutes) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                value={formData.duration}
                onChange={(e) => handleChange('duration', e.target.value)}
                placeholder="e.g., 15"
                min="1"
                required
              />
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            {renderContentTab()}
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-4">
            <LessonResourcesManager
              resources={formData.resources || []}
              onChange={(resources) => handleChange('resources', resources)}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div>
              <Label>Access Type</Label>
              <Select
                value={formData.accessType}
                onValueChange={(value: LessonAccessType) => handleChange('accessType', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free_preview">
                    <div>
                      <p className="font-medium">Free Preview</p>
                      <p className="text-xs text-gray-500">Anyone can access</p>
                    </div>
                  </SelectItem>
                  <SelectItem value="enrolled_only">
                    <div>
                      <p className="font-medium">Enrolled Only</p>
                      <p className="text-xs text-gray-500">Requires enrollment</p>
                    </div>
                  </SelectItem>
                  <SelectItem value="prerequisite">
                    <div>
                      <p className="font-medium">Prerequisite Required</p>
                      <p className="text-xs text-gray-500">Previous lessons must be completed</p>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Completion Requirement</Label>
              <Select
                value={formData.completionRequirement}
                onValueChange={(value: CompletionRequirement) => handleChange('completionRequirement', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual - Student marks complete</SelectItem>
                  <SelectItem value="auto_video_80">Auto - Video watched 80%+</SelectItem>
                  <SelectItem value="auto_document">Auto - Document read</SelectItem>
                  <SelectItem value="quiz_pass">Quiz - Must pass to complete</SelectItem>
                  <SelectItem value="assignment_submit">Assignment - Must submit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Discussion</Label>
                <p className="text-sm text-gray-500">
                  Allow students to ask questions and comment
                </p>
              </div>
              <Switch
                checked={formData.enableDiscussion}
                onCheckedChange={(checked) => handleChange('enableDiscussion', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Published</Label>
                <p className="text-sm text-gray-500">
                  Make this lesson visible to students
                </p>
              </div>
              <Switch
                checked={formData.isPublished}
                onCheckedChange={(checked) => handleChange('isPublished', checked)}
              />
            </div>

            <div>
              <Label>Scheduled Publish Date (optional)</Label>
              <Input
                type="datetime-local"
                value={formData.scheduledPublishAt}
                onChange={(e) => handleChange('scheduledPublishAt', e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1">
                Leave empty to publish immediately
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Lesson
          </Button>
          <Button variant="secondary" onClick={() => {
            handleSave()
            // Reset form for next lesson
            setFormData({
              title: '',
              subtitle: '',
              description: '',
              type: 'video',
              duration: '',
              videoUrl: '',
              documentUrl: '',
              textContent: undefined,
              imageContent: undefined,
              videoQualityOptions: undefined,
              videoSubtitles: undefined,
              videoChapters: undefined,
              resources: undefined,
              accessType: 'enrolled_only',
              completionRequirement: 'manual',
              downloadAllowed: true,
              printAllowed: true,
              canAnnotate: false,
              enableDiscussion: true,
              scheduledPublishAt: '',
              isPublished: true
            })
          }}>
            Save & Add Another
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
