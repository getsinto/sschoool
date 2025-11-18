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
import { Video, FileText, HelpCircle, FileCheck, Calendar } from 'lucide-react'

interface LessonModalProps {
  open: boolean
  onClose: () => void
  onSave: (lesson: any) => void
  sectionId: string
  lesson?: any
}

type LessonType = 'video' | 'document' | 'quiz' | 'assignment' | 'live-class'

export function LessonModal({ open, onClose, onSave, sectionId, lesson }: LessonModalProps) {
  const [formData, setFormData] = useState({
    title: lesson?.title || '',
    description: lesson?.description || '',
    type: (lesson?.type || 'video') as LessonType,
    duration: lesson?.duration || '',
    // Content specific
    videoUrl: lesson?.videoUrl || '',
    documentUrl: lesson?.documentUrl || '',
    // Settings
    freePreview: lesson?.freePreview || false,
    requiredToComplete: lesson?.requiredToComplete || true,
    allowDownload: lesson?.allowDownload || false,
    dripDays: lesson?.dripDays || 0
  })

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
  }

  const handleSave = () => {
    onSave({
      ...formData,
      sectionId,
      id: lesson?.id || `lesson-${Date.now()}`
    })
    onClose()
  }

  const renderContentTab = () => {
    switch (formData.type) {
      case 'video':
        return (
          <div className="space-y-4">
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
            {/* TODO: Add full VideoUploader component */}
          </div>
        )

      case 'document':
        return (
          <div className="space-y-4">
            <div>
              <Label>Document Upload</Label>
              <Input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleChange('documentUrl', URL.createObjectURL(file))
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                PDF, DOC, DOCX, PPT, PPTX up to 50MB
              </p>
            </div>
            {/* TODO: Add full DocumentUploader component */}
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

      case 'live-class':
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
              <Label>
                Lesson Type <span className="text-red-500">*</span>
              </Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value) => handleChange('type', value as LessonType)}
                className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="video" id="video" />
                  <Label htmlFor="video" className="flex items-center gap-2 cursor-pointer">
                    <Video className="w-5 h-5 text-blue-600" />
                    Video Lesson
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="document" id="document" />
                  <Label htmlFor="document" className="flex items-center gap-2 cursor-pointer">
                    <FileText className="w-5 h-5 text-green-600" />
                    Document
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="quiz" id="quiz" />
                  <Label htmlFor="quiz" className="flex items-center gap-2 cursor-pointer">
                    <HelpCircle className="w-5 h-5 text-purple-600" />
                    Quiz
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="assignment" id="assignment" />
                  <Label htmlFor="assignment" className="flex items-center gap-2 cursor-pointer">
                    <FileCheck className="w-5 h-5 text-orange-600" />
                    Assignment
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="live-class" id="live-class" />
                  <Label htmlFor="live-class" className="flex items-center gap-2 cursor-pointer">
                    <Calendar className="w-5 h-5 text-red-600" />
                    Live Class
                  </Label>
                </div>
              </RadioGroup>
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
            <div>
              <Label>Additional Resources</Label>
              <p className="text-sm text-gray-600 mb-4">
                Upload supplementary files, add links, or embed content
              </p>
              {/* TODO: Add resources uploader */}
              <Button variant="outline" size="sm">
                Add Resource
              </Button>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Free Preview</Label>
                <p className="text-sm text-gray-500">
                  Make this lesson accessible without enrollment
                </p>
              </div>
              <Switch
                checked={formData.freePreview}
                onCheckedChange={(checked) => handleChange('freePreview', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Required to Complete</Label>
                <p className="text-sm text-gray-500">
                  Students must complete this lesson to proceed
                </p>
              </div>
              <Switch
                checked={formData.requiredToComplete}
                onCheckedChange={(checked) => handleChange('requiredToComplete', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Allow Download</Label>
                <p className="text-sm text-gray-500">
                  Allow students to download lesson content
                </p>
              </div>
              <Switch
                checked={formData.allowDownload}
                onCheckedChange={(checked) => handleChange('allowDownload', checked)}
              />
            </div>

            <div>
              <Label>Drip Content (Days from Enrollment)</Label>
              <Input
                type="number"
                value={formData.dripDays}
                onChange={(e) => handleChange('dripDays', parseInt(e.target.value) || 0)}
                placeholder="0"
                min="0"
              />
              <p className="text-sm text-gray-500 mt-1">
                0 = Available immediately. Set days to delay access.
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
              description: '',
              type: 'video',
              duration: '',
              videoUrl: '',
              documentUrl: '',
              freePreview: false,
              requiredToComplete: true,
              allowDownload: false,
              dripDays: 0
            })
          }}>
            Save & Add Another
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
