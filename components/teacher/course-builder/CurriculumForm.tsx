'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, GripVertical, Video, FileText, HelpCircle, FileCheck } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Section {
  id: string
  title: string
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  type: 'video' | 'text' | 'quiz' | 'assignment'
  duration: string
}

interface CurriculumFormProps {
  data: any
  onUpdate: (data: any) => void
  onNext: () => void
  onPrevious: () => void
}

export function CurriculumForm({ data, onUpdate, onNext, onPrevious }: CurriculumFormProps) {
  const [sections, setSections] = useState<Section[]>(data.sections || [])

  const addSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: '',
      lessons: []
    }
    setSections([...sections, newSection])
  }

  const removeSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId))
  }

  const updateSection = (sectionId: string, title: string) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, title } : s))
  }

  const addLesson = (sectionId: string) => {
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: '',
      type: 'video',
      duration: ''
    }
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, lessons: [...s.lessons, newLesson] } : s
    ))
  }

  const removeLesson = (sectionId: string, lessonId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, lessons: s.lessons.filter(l => l.id !== lessonId) } : s
    ))
  }

  const updateLesson = (sectionId: string, lessonId: string, field: string, value: any) => {
    setSections(sections.map(s => 
      s.id === sectionId ? {
        ...s,
        lessons: s.lessons.map(l => 
          l.id === lessonId ? { ...l, [field]: value } : l
        )
      } : s
    ))
  }

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />
      case 'text': return <FileText className="w-4 h-4" />
      case 'quiz': return <HelpCircle className="w-4 h-4" />
      case 'assignment': return <FileCheck className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const handleNext = () => {
    onUpdate({ sections })
    onNext()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Curriculum</h2>
        <p className="text-gray-600">Add sections and lessons to structure your course content</p>
      </div>

      <div className="space-y-4">
        {sections.map((section, sectionIndex) => (
          <Card key={section.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                <div className="flex-1">
                  <Input
                    placeholder={`Section ${sectionIndex + 1} title`}
                    value={section.title}
                    onChange={(e) => updateSection(section.id, e.target.value)}
                    className="font-semibold"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSection(section.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {section.lessons.map((lesson, lessonIndex) => (
                <div key={lesson.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      placeholder={`Lesson ${lessonIndex + 1} title`}
                      value={lesson.title}
                      onChange={(e) => updateLesson(section.id, lesson.id, 'title', e.target.value)}
                    />
                    <Select
                      value={lesson.type}
                      onValueChange={(value) => updateLesson(section.id, lesson.id, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4" />
                            Video
                          </div>
                        </SelectItem>
                        <SelectItem value="text">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Text
                          </div>
                        </SelectItem>
                        <SelectItem value="quiz">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4" />
                            Quiz
                          </div>
                        </SelectItem>
                        <SelectItem value="assignment">
                          <div className="flex items-center gap-2">
                            <FileCheck className="w-4 h-4" />
                            Assignment
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Duration (e.g., 15 min)"
                      value={lesson.duration}
                      onChange={(e) => updateLesson(section.id, lesson.id, 'duration', e.target.value)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLesson(section.id, lesson.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addLesson(section.id)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Lesson
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={addSection}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Section
      </Button>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  )
}
