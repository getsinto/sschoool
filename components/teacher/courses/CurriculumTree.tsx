'use client'

import { useState } from 'react'
import { 
  ChevronDown,
  ChevronRight,
  GripVertical,
  Plus,
  Edit,
  Trash2,
  Video,
  FileText,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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
  isExpanded?: boolean
  order: number
}

interface CurriculumTreeProps {
  sections: Section[]
  onAddSection?: () => void
  onAddLesson?: (sectionId: string) => void
  onEditSection?: (sectionId: string) => void
  onEditLesson?: (lessonId: string) => void
  onDeleteSection?: (sectionId: string) => void
  onDeleteLesson?: (lessonId: string) => void
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
      case 'text': return <FileText className="w-4 h-4 text-green-600" />
      case 'quiz': return <CheckCircle className="w-4 h-4 text-purple-600" />
      case 'assignment': return <FileText className="w-4 h-4 text-orange-600" />
      default: return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'published' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800'
  }

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Course Structure</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Preview as Student
          </Button>
          <Button size="sm" onClick={onAddSection}>
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map((section, sectionIndex) => (
          <Card key={section.id}>
            <CardContent className="p-0">
              {/* Section Header */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 border-b hover:bg-gray-100 transition-colors">
                <button
                  className="cursor-move text-gray-400 hover:text-gray-600"
                  draggable
                >
                  <GripVertical className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => toggleSection(section.id)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  {section.isExpanded ? (
                    <ChevronDown className="w-5 h-5" />
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </button>

                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    Section {sectionIndex + 1}: {section.title}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {section.lessons.length} lessons
                  </p>
                </div>

                <div className="flex gap-2">
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
                <div className="divide-y">
                  {section.lessons.map((lesson, lessonIndex) => (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                    >
                      <button
                        className="cursor-move text-gray-400 hover:text-gray-600 ml-8"
                        draggable
                      >
                        <GripVertical className="w-4 h-4" />
                      </button>

                      {getLessonIcon(lesson.type)}

                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {sectionIndex + 1}.{lessonIndex + 1} {lesson.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {lesson.duration}
                          </span>
                          <Badge className={`text-xs ${getStatusColor(lesson.status)}`}>
                            {lesson.status}
                          </Badge>
                          <span className="text-xs text-gray-500 capitalize">
                            {lesson.type}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditLesson?.(lesson.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteLesson?.(lesson.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {section.lessons.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <p className="mb-3">No lessons in this section yet</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAddLesson?.(section.id)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Lesson
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {sections.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 mb-4">No sections created yet</p>
              <Button onClick={onAddSection}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Section
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
