'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Send,
  Save,
  Users,
  Filter,
  X,
  Calendar,
  Paperclip
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Mock students
const mockStudents = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@example.com', avatar: '/avatars/sarah.jpg', course: 'Mathematics' },
  { id: '2', name: 'Michael Chen', email: 'michael@example.com', avatar: '/avatars/michael.jpg', course: 'Mathematics' },
  { id: '3', name: 'Emma Davis', email: 'emma@example.com', avatar: '/avatars/emma.jpg', course: 'Physics' },
  { id: '4', name: 'Alex Thompson', email: 'alex@example.com', avatar: '/avatars/alex.jpg', course: 'Physics' },
  { id: '5', name: 'Jessica Lee', email: 'jessica@example.com', avatar: '/avatars/jessica.jpg', course: 'Chemistry' }
]

// Message templates
const messageTemplates = [
  {
    id: 't1',
    name: 'Assignment Reminder',
    subject: 'Reminder: Upcoming Assignment Due',
    body: 'Hi {{student_name}},\n\nThis is a friendly reminder that your assignment for {{course_name}} is due on {{due_date}}.\n\nPlease make sure to submit it on time.\n\nBest regards,\n{{teacher_name}}'
  },
  {
    id: 't2',
    name: 'Progress Update',
    subject: 'Your Progress in {{course_name}}',
    body: 'Hi {{student_name}},\n\nI wanted to share an update on your progress in {{course_name}}. You\'re currently at {{progress}}% completion.\n\nKeep up the great work!\n\nBest regards,\n{{teacher_name}}'
  },
  {
    id: 't3',
    name: 'Encouragement',
    subject: 'Great Work!',
    body: 'Hi {{student_name}},\n\nI wanted to take a moment to acknowledge your excellent work in {{course_name}}. Your dedication and effort are truly commendable.\n\nKeep it up!\n\nBest regards,\n{{teacher_name}}'
  }
]

export default function ComposeMessagePage() {
  const router = useRouter()
  const [recipientType, setRecipientType] = useState('individual')
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')
  const [sendToParents, setSendToParents] = useState(false)

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([])
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id))
    }
  }

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = messageTemplates.find(t => t.id === templateId)
    if (template) {
      setSubject(template.subject)
      setMessage(template.body)
      setSelectedTemplate(templateId)
    }
  }

  const handleSend = () => {
    // TODO: Send message via API
    router.push('/dashboard/teacher/messages')
  }

  const handleSaveDraft = () => {
    // TODO: Save draft via API
  }

  const filteredStudents = selectedCourse === 'all'
    ? mockStudents
    : mockStudents.filter(s => s.course === selectedCourse)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Compose Message</h1>
            <p className="text-gray-600">Send messages to students or parents</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handleSend} disabled={selectedStudents.length === 0 || !message.trim()}>
            <Send className="w-4 h-4 mr-2" />
            Send Message
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recipients Selection */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recipients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Recipient Type</Label>
                <Select value={recipientType} onValueChange={setRecipientType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual Students</SelectItem>
                    <SelectItem value="course">All Students in Course</SelectItem>
                    <SelectItem value="criteria">Students by Criteria</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {recipientType === 'course' && (
                <div>
                  <Label>Select Course</Label>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {recipientType === 'criteria' && (
                <div className="space-y-3">
                  <div>
                    <Label>Progress Less Than</Label>
                    <Input type="number" placeholder="e.g., 50" />
                  </div>
                  <div>
                    <Label>Grade Less Than</Label>
                    <Input type="number" placeholder="e.g., 70" />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendToParents"
                  checked={sendToParents}
                  onCheckedChange={(checked) => setSendToParents(checked as boolean)}
                />
                <Label htmlFor="sendToParents" className="text-sm">
                  Also send to parents/guardians
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Select Students</CardTitle>
                <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                  {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                    onClick={() => handleSelectStudent(student.id)}
                  >
                    <Checkbox
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => handleSelectStudent(student.id)}
                    />
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{student.name}</p>
                      <p className="text-xs text-gray-600 truncate">{student.email}</p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedStudents.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-2">
                    Selected: {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedStudents.map(id => {
                      const student = mockStudents.find(s => s.id === id)
                      return student ? (
                        <Badge key={id} variant="outline" className="gap-1">
                          {student.name}
                          <X
                            className="w-3 h-3 cursor-pointer"
                            onClick={() => handleSelectStudent(id)}
                          />
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Message Composition */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Message Template</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {messageTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-600 mt-2">
                Templates support variables: {'{'}{'{'} student_name {'}'}{'}'}, {'{'}{'{'} course_name {'}'}{'}'}, {'{'}{'{'} teacher_name {'}'}{'}'}, {'{'}{'{'} progress {'}'}{'}'}, {'{'}{'{'} due_date {'}'}{'}'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compose Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter message subject..."
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={12}
                />
                <p className="text-xs text-gray-600 mt-1">
                  {message.length} characters
                </p>
              </div>

              <div>
                <Label htmlFor="attachments">Attachments</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload or drag and drop files here
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, DOC, DOCX, JPG, PNG (max 10MB)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="sendNow" defaultChecked />
                <Label htmlFor="sendNow">Send immediately</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="scheduleSend" />
                <Label htmlFor="scheduleSend">Schedule for later</Label>
              </div>

              <div>
                <Label htmlFor="scheduleDate">Schedule Date & Time</Label>
                <Input
                  id="scheduleDate"
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="emailCopy" defaultChecked />
                <Label htmlFor="emailCopy">Also send via email</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="mb-3">
                  <p className="text-xs text-gray-600">To:</p>
                  <p className="text-sm font-medium">
                    {selectedStudents.length} recipient{selectedStudents.length !== 1 ? 's' : ''}
                    {sendToParents && ' (+ parents)'}
                  </p>
                </div>
                <div className="mb-3">
                  <p className="text-xs text-gray-600">Subject:</p>
                  <p className="text-sm font-medium">{subject || '(No subject)'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Message:</p>
                  <div className="text-sm whitespace-pre-wrap">
                    {message || '(No message)'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
