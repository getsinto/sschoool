'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ChevronDown, 
  ChevronRight, 
  GripVertical, 
  Plus, 
  Edit, 
  Trash2, 
  Copy,
  Video,
  FileText,
  HelpCircle,
  FileCheck,
  Calendar,
  Eye
} from 'lucide-react'

interface Lesson {
  id: string
  title: string
  type: 'video' | 'document' | 'quiz' | 'assignment' | 'live-class'
  duration: string
  status: 'published' | 'draft'
  order: number
}

interface Section {
  id: string
  title: string
  description?: string
  isExpanded: boolean
  lessons: Lesson[]
  order: number
}

interface DragDropCurriculumProps {
  sections: Section[]
  onUpdateSections: (sections: Section[]) => void
  onAddSection: () => void
  onEditSection: (sectionId: string) => void
  onDeleteSection: (sectionId: string) => void
  onDuplicateSection: (sectionId: string) => void
  onAddLesson: (sectionId: string) => void
  onEditLesson: (sectionId: string, lessonId: string) => void
  onDeleteLesson: (sectionId: string, lessonId: string) => void
  onDuplicateLesson: (sectionId: string, lessonId: string) => void
  onPreviewLesson: (sectionId: string, lessonId: string) => void
}

export function DragDropCurriculum({
  sections,
  onUpdateSections,
  onAddSection,
  onEditSection,
  onDeleteSection,
  onDuplicateSection,
  onAddLesson,
  onEditLesson,
  onDeleteLesson,
  onDuplicateLesson,
  onPreviewLesson
}: DragDropCurriculumProps) {
  const [draggedItem, setDraggedItem] = useState<{
    type: 'section' | 'lesson'
    id: string
    sectionId?: string
  } | null>(null)

  const toggleSection = (sectionId: string) => {
    const updated = sections.map(section =>
      section.id === sectionId
        ? { ...section, isExpanded: !section.isExpanded }
        : section
    )
    onUpdateSections(updated)
  }

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-blue-600" />
      case 'document': return <FileText className="w-4 h-4 text-green-600" />
      case 'quiz': return <HelpCircle className="w-4 h-4 text-purple-600" />
      case 'assignment': return <FileCheck className="w-4 h-4 text-orange-600" />
      case 'live-class': return <Calendar className="w-4 h-4 text-red-600" />
      default: return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    return status === 'published' ? (
      <Badge className="bg-green-100 text-green-800 text-xs">Published</Badge>
    ) : (
      <Badge variant="outline" className="text-xs">Draft</Badge>
    )
  }

  const handleDragStart = (e: React.DragEvent, type: 'section' | 'lesson', id: string, sectionId?: string) => {
    setDraggedItem({ type, id, sectionId })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetType: 'section' | 'lesson', targetId: string, targetSectionId?: string) => {
    e.preventDefault()
    if (!draggedItem) return

    if (draggedItem.type === 'section' && targetType === 'section') {
      const dragIndex = sections.findIndex(s => s.id === draggedItem.id)
      const dropIndex = sections.findIndex(s => s.id === targetId)
      
      if (dragIndex !== -1 && dropIndex !== -1 && dragIndex !== dropIndex) {
        const newSections = [...sections]
        const [draggedSection] = newSections.splice(dragIndex, 1)
        newSections.splice(dropIndex, 0, draggedSection)
        onUpdateSections(newSections)
      }
    } else if (draggedItem.type === 'lesson' && targetType === 'lesson') {
      const sourceSectionId = draggedItem.sectionId!
      const targetSectionId = targetSectionId!
      
      const newSections = sections.map(section => {
        if (section.id === sourceSectionId) {
          return {
            ...section,
            lessons: section.lessons.filter(l => l.id !== draggedItem.id)
          }
        }
        return section
      })

      const draggedLesson = sections
        .find(s => s.id === sourceSectionId)
        ?.lessons.find(l => l.id === draggedItem.id)

      if (draggedLesson) {
        const finalSections = newSections.map(section => {
          if (section.id === targetSectionId) {
            const targetIndex = section.lessons.findIndex(l => l.id === targetId)
            const newLessons = [...section.lessons]
            newLessons.splice(targetIndex, 0, draggedLesson)
            return { ...section, lessons: newLessons }
          }
          return section
        })
        onUpdateSections(finalSections)
      }
    }
    
    setDraggedItem(null)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Course Curriculum</CardTitle>
          <Button onClick={onAddSection}>
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {sections.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No sections added yet</p>
            <p className="text-sm mt-1">Click "Add Section" to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section, sectionIndex) => (
              <div
                key={section.id}
                className="border rounded-lg overflow-hidden"
                draggable
                onDragStart={(e) => handleDragStart(e, 'section', section.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'section', section.id)}
              >
                <div className="bg-gray-50 p-4 border-b">
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSection(section.id)}
                      className="p-0 h-auto"
                    >
                      {section.isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        Section {sectionIndex + 1}: {section.title || 'Untitled Section'}
                      </h3>
                      {section.description && (
                        <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {section.lessons.length} lesson{section.lessons.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditSection(section.id)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDuplicateSection(section.id)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteSection(section.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {section.isExpanded && (
                  <div className="p-4">
                    {section.lessons.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-sm">No lessons in this section</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAddLesson(section.id)}
                          className="mt-2"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add First Lesson
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {section.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:bg-gray-50 group"
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'lesson', lesson.id, section.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, 'lesson', lesson.id, section.id)}
                          >
                            <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                            <div className="flex items-center gap-2">
                              {getLessonIcon(lesson.type)}
                              <span className="text-sm font-medium text-gray-700">
                                {lessonIndex + 1}.
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {lesson.title || 'Untitled Lesson'}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500 capitalize">
                                  {lesson.type.replace('-', ' ')}
                                </span>
                                {lesson.duration && (
                                  <>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-500">{lesson.duration}</span>
                                  </>
                                )}
                                <span className="text-xs text-gray-400">•</span>
                                {getStatusBadge(lesson.status)}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onPreviewLesson(section.id, lesson.id)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEditLesson(section.id, lesson.id)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDuplicateLesson(section.id, lesson.id)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDeleteLesson(section.id, lesson.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAddLesson(section.id)}
                          className="w-full mt-2"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Lesson
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
