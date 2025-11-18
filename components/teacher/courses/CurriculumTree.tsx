'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Plus, Edit, Trash2, GripVertical, Video, FileText, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface Lesson {
  id: string
  title: string
  type: 'video' | 'text' | 'quiz' | 'assignment'
  duration: string
  status: 'published' | 'draft'
  order: number
}

interface Section {
  id: string
  title: string
  lessons: Lesson[]
  isExpanded: boolean
  order: number
}

interface CurriculumTreeProps {
  sections: Section[]
  onAddSection?: () => void
  onAddLesson?: (sectionId: string) => void
  onEditSection?: (sectionId: string) => void
  onEditLesson?: (sectionId: string, lessonId: string) => void
  onDeleteSection?: (sectionId: string) => void
  onDeleteLesson?: (sectionId: string, lessonId: string) => void
  onReorder?: (sections: Section[]) => void
}

export function CurriculumTree({
  sections: initialSections,
  onAddSection,
  onAddLesson,
  onEditSection,
  onEditLesson,
  onDeleteSection,
  onDeleteLesson,
  onReorder
}: CurriculumTreeProps) {
  const [sections, setSections] = useState<Section[]>(initialSections)

  const toggleSection = (sectionId: string) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? { ...section, isExpanded: !section.isExpanded }
        : section
    ))
  }

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-blue-600" />
      case 'text': return <FileText className="w-4 h-4 text-gray-600" />
      case 'quiz': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'assignment': return <FileText className="w-4 h-4 text-purple-600" />
      default: return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    return status === 'published' ? (
      <Badge className="bg-green-100 text-green-800 text-xs">Published</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800 text-xs">Draft</Badge>
    )
  }

  return (
    <div className="space-y-4">
      {/* Add Section Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Course Structure</h3>
        <Button onClick={onAddSection} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map((section, sectionIndex) => (
          <Card key={section.id} className="overflow-hidden">
            {/* Section Header */}
            <div className="bg-gray-50 p-4 flex items-center justify-between border-b">
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="hover:bg-gray-200 p-1 rounded"
                >
                  {section.isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  )}
                </button>
                <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    Section {sectionIndex + 1}: {section.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {section.lessons.length} lessons
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddLesson?.(section.id)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Lesson
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditSection?.(section.id)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteSection?.(section.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Lessons */}
            {section.isExpanded && (
              <div className="p-4 space-y-2">
                {section.lessons.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">
                    No lessons yet. Click "Add Lesson" to get started.
                  </p>
                ) : (
                  section.lessons.map((lesson, lessonIndex) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                        {getLessonIcon(lesson.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {lessonIndex + 1}. {lesson.title}
                            </span>
                            {getStatusBadge(lesson.status)}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lesson.duration}
                            </span>
                            <span className="text-xs text-gray-500 capitalize">
                              {lesson.type}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditLesson?.(section.id, lesson.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteLesson?.(section.id, lesson.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>
        ))}

        {sections.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-gray-500 mb-4">No sections yet. Start building your course curriculum.</p>
            <Button onClick={onAddSection}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Section
            </Button>
          </Card>
        )}
      </div>

      {/* Preview Button */}
      {sections.length > 0 && (
        <div className="flex justify-end">
          <Button variant="outline">
            <Video className="w-4 h-4 mr-2" />
            Preview as Student
          </Button>
        </div>
      )}
    </div>
  )
}
