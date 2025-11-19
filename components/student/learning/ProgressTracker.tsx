'use client'

import { CheckCircle, Circle, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

interface Lesson {
  id: string
  title: string
  type: 'video' | 'document' | 'quiz' | 'assignment' | 'live_class'
  duration?: number
  isCompleted: boolean
  isLocked: boolean
  progress?: number
}

interface Section {
  id: string
  title: string
  lessons: Lesson[]
}

interface ProgressTrackerProps {
  sections: Section[]
  currentLessonId: string
  onLessonSelect: (lessonId: string) => void
}

export default function ProgressTracker({ 
  sections, 
  currentLessonId, 
  onLessonSelect 
}: ProgressTrackerProps) {
  const totalLessons = sections.reduce((acc, section) => acc + section.lessons.length, 0)
  const completedLessons = sections.reduce(
    (acc, section) => acc + section.lessons.filter(l => l.isCompleted).length, 
    0
  )
  const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

  const getLessonIcon = (lesson: Lesson) => {
    if (lesson.isLocked) {
      return <Lock className="w-4 h-4 text-gray-400" />
    }
    if (lesson.isCompleted) {
      return <CheckCircle className="w-4 h-4 text-green-600" />
    }
    return <Circle className="w-4 h-4 text-gray-400" />
  }

  const getLessonTypeLabel = (type: string) => {
    const labels = {
      video: 'Video',
      document: 'Reading',
      quiz: 'Quiz',
      assignment: 'Assignment',
      live_class: 'Live Class'
    }
    return labels[type as keyof typeof labels] || type
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return ''
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="h-full flex flex-col">
      {/* Overall Progress */}
      <Card className="m-4 mb-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Course Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {completedLessons} of {totalLessons} lessons
            </span>
            <span className="font-semibold">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </CardContent>
      </Card>

      {/* Curriculum */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        {sections.map((section, sectionIndex) => {
          const sectionCompleted = section.lessons.filter(l => l.isCompleted).length
          const sectionTotal = section.lessons.length
          const sectionProgress = sectionTotal > 0 
            ? (sectionCompleted / sectionTotal) * 100 
            : 0

          return (
            <div key={section.id} className="space-y-2">
              {/* Section Header */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">
                    Section {sectionIndex + 1}: {section.title}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {sectionCompleted}/{sectionTotal}
                  </span>
                </div>
                <Progress value={sectionProgress} className="h-1" />
              </div>

              {/* Lessons */}
              <div className="space-y-1">
                {section.lessons.map((lesson, lessonIndex) => {
                  const isActive = lesson.id === currentLessonId
                  const canAccess = !lesson.isLocked

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => canAccess && onLessonSelect(lesson.id)}
                      disabled={!canAccess}
                      className={`
                        w-full text-left p-3 rounded-lg border transition-all
                        ${isActive 
                          ? 'bg-blue-50 border-blue-300 shadow-sm' 
                          : 'bg-white border-gray-200 hover:border-gray-300'
                        }
                        ${!canAccess ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getLessonIcon(lesson)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className={`text-sm font-medium ${
                                isActive ? 'text-blue-900' : 'text-gray-900'
                              }`}>
                                {lessonIndex + 1}. {lesson.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs"
                                >
                                  {getLessonTypeLabel(lesson.type)}
                                </Badge>
                                {lesson.duration && (
                                  <span className="text-xs text-gray-500">
                                    {formatDuration(lesson.duration)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Progress bar for in-progress lessons */}
                          {lesson.progress && lesson.progress > 0 && lesson.progress < 100 && (
                            <div className="mt-2">
                              <Progress value={lesson.progress} className="h-1" />
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
