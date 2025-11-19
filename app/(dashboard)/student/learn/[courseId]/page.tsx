'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ChevronLeft, BookOpen, FileText, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import VideoPlayer from '@/components/student/learning/VideoPlayer'
import PDFViewer from '@/components/student/learning/PDFViewer'
import QuizInterface from '@/components/student/learning/QuizInterface'
import AssignmentSubmission from '@/components/student/learning/AssignmentSubmission'
import LiveClassCard from '@/components/student/learning/LiveClassCard'
import NotesPanel from '@/components/student/learning/NotesPanel'
import QAPanel from '@/components/student/learning/QAPanel'
import ProgressTracker from '@/components/student/learning/ProgressTracker'
import CertificateDisplay from '@/components/student/learning/CertificateDisplay'

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  progress: number
  isCompleted: boolean
  certificate?: any
}

interface Lesson {
  id: string
  title: string
  type: 'video' | 'document' | 'quiz' | 'assignment' | 'live_class'
  content: any
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

export default function LearningPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    loadCourse()
  }, [courseId])

  const loadCourse = async () => {
    try {
      setLoading(true)
      
      // Load course details
      const courseResponse = await fetch(`/api/student/courses/${courseId}`)
      const courseData = await courseResponse.json()
      
      if (courseData.success) {
        setCourse(courseData.data)
      }

      // Load curriculum
      const curriculumResponse = await fetch(`/api/student/courses/${courseId}/curriculum`)
      const curriculumData = await curriculumResponse.json()
      
      if (curriculumData.success) {
        setSections(curriculumData.data)
        
        // Find first incomplete lesson or first lesson
        const firstIncomplete = curriculumData.data
          .flatMap((s: Section) => s.lessons)
          .find((l: Lesson) => !l.isCompleted && !l.isLocked)
        
        if (firstIncomplete) {
          loadLesson(firstIncomplete.id)
        } else if (curriculumData.data[0]?.lessons[0]) {
          loadLesson(curriculumData.data[0].lessons[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to load course:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadLesson = async (lessonId: string) => {
    try {
      const response = await fetch(`/api/student/learn/${lessonId}`)
      const data = await response.json()
      
      if (data.success) {
        setCurrentLesson(data.data)
      }
    } catch (error) {
      console.error('Failed to load lesson:', error)
    }
  }

  const handleLessonComplete = async () => {
    if (!currentLesson) return

    try {
      await fetch(`/api/student/learn/${currentLesson.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true })
      })

      // Reload course to update progress
      loadCourse()

      // Move to next lesson
      const allLessons = sections.flatMap(s => s.lessons)
      const currentIndex = allLessons.findIndex(l => l.id === currentLesson.id)
      const nextLesson = allLessons[currentIndex + 1]

      if (nextLesson && !nextLesson.isLocked) {
        loadLesson(nextLesson.id)
      }
    } catch (error) {
      console.error('Failed to mark lesson complete:', error)
    }
  }

  const handleProgressUpdate = async (progress: number) => {
    if (!currentLesson) return

    try {
      await fetch(`/api/student/learn/${currentLesson.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress })
      })
    } catch (error) {
      console.error('Failed to update progress:', error)
    }
  }

  const renderLessonContent = () => {
    if (!currentLesson) return null

    switch (currentLesson.type) {
      case 'video':
        return (
          <VideoPlayer
            videoUrl={currentLesson.content.videoUrl}
            lessonId={currentLesson.id}
            onProgressUpdate={handleProgressUpdate}
            onComplete={handleLessonComplete}
          />
        )

      case 'document':
        return (
          <PDFViewer
            documents={currentLesson.content.documents || [{
              id: currentLesson.id,
              title: currentLesson.title,
              url: currentLesson.content.documentUrl,
              pages: currentLesson.content.pages || 1
            }]}
            lessonId={currentLesson.id}
            onComplete={handleLessonComplete}
          />
        )

      case 'quiz':
        return (
          <QuizInterface
            quizId={currentLesson.content.id || currentLesson.id}
            lessonId={currentLesson.id}
            onComplete={handleLessonComplete}
          />
        )

      case 'assignment':
        return (
          <AssignmentSubmission
            assignment={currentLesson.content}
            lessonId={currentLesson.id}
            onComplete={handleLessonComplete}
          />
        )

      case 'live_class':
        return (
          <LiveClassCard
            liveClass={currentLesson.content}
            lessonId={currentLesson.id}
            onComplete={handleLessonComplete}
          />
        )

      default:
        return <div>Unsupported lesson type</div>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course || !currentLesson) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600">Course not found</p>
          <Button onClick={() => router.push('/student/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  // Show certificate if course is completed
  if (course.isCompleted && course.certificate) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b px-6 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/student/dashboard')}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <CertificateDisplay certificate={course.certificate} />
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/student/dashboard')}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold">{course.title}</h1>
            <p className="text-sm text-gray-600">by {course.instructor}</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? 'Hide' : 'Show'} Curriculum
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Progress Tracker */}
        {sidebarOpen && (
          <div className="w-80 bg-white border-r overflow-hidden">
            <ProgressTracker
              sections={sections}
              currentLessonId={currentLesson.id}
              onLessonSelect={loadLesson}
            />
          </div>
        )}

        {/* Center - Lesson Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto p-6">
            {/* Lesson Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{currentLesson.title}</h2>
              {currentLesson.isCompleted && (
                <div className="flex items-center gap-2 text-green-600">
                  <Award className="w-5 h-5" />
                  <span className="font-medium">Completed</span>
                </div>
              )}
            </div>

            {/* Lesson Content */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {renderLessonContent()}
            </div>

            {/* Lesson Description */}
            {currentLesson.content.description && (
              <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  About this lesson
                </h3>
                <p className="text-gray-700">{currentLesson.content.description}</p>
              </div>
            )}

            {/* Resources */}
            {currentLesson.content.resources && currentLesson.content.resources.length > 0 && (
              <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Resources
                </h3>
                <div className="space-y-2">
                  {currentLesson.content.resources.map((resource: any, index: number) => (
                    <a
                      key={index}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline"
                    >
                      <FileText className="w-4 h-4" />
                      {resource.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Notes & Q&A */}
        <div className="w-96 bg-white border-l">
          <Tabs defaultValue="notes" className="h-full flex flex-col">
            <TabsList className="w-full rounded-none border-b">
              <TabsTrigger value="notes" className="flex-1">Notes</TabsTrigger>
              <TabsTrigger value="qa" className="flex-1">Q&A</TabsTrigger>
            </TabsList>
            <TabsContent value="notes" className="flex-1 overflow-hidden m-0">
              <NotesPanel
                lessonId={currentLesson.id}
                lessonType={currentLesson.type}
                currentTime={undefined}
              />
            </TabsContent>
            <TabsContent value="qa" className="flex-1 overflow-hidden m-0">
              <QAPanel lessonId={currentLesson.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
