'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Lock,
  BookOpen,
  FileText,
  Video,
  HelpCircle,
  StickyNote,
  Download,
  MessageSquare,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import Link from 'next/link'

// Mock data
const mockLessonData = {
  id: 'l5',
  title: 'Special Factoring Patterns',
  type: 'video',
  duration: '15 min',
  videoUrl: '/videos/factoring-patterns.mp4',
  description: 'Learn about special factoring patterns including difference of squares, perfect square trinomials, and sum/difference of cubes.',
  transcript: [
    { time: '0:00', text: 'Welcome to this lesson on special factoring patterns.' },
    { time: '0:15', text: 'Today we\'ll cover three important patterns that make factoring easier.' },
    { time: '0:30', text: 'First, let\'s look at the difference of squares pattern: a² - b² = (a+b)(a-b)' }
  ],
  resources: [
    { id: 'r1', title: 'Factoring Patterns Cheat Sheet', type: 'pdf', url: '/resources/patterns.pdf' },
    { id: 'r2', title: 'Practice Problems', type: 'pdf', url: '/resources/practice.pdf' }
  ],
  notes: [
    { id: 'n1', timestamp: '2:30', content: 'Remember: difference of squares only works with subtraction', createdAt: '2024-01-20' },
    { id: 'n2', timestamp: '5:45', content: 'Perfect square trinomial: a² + 2ab + b² = (a+b)²', createdAt: '2024-01-20' }
  ]
}

const mockCourseData = {
  id: 'c1',
  title: 'Advanced Mathematics - Quadratic Equations',
  sections: [
    {
      id: 's1',
      title: 'Introduction to Quadratic Equations',
      lessons: [
        { id: 'l1', title: 'What are Quadratic Equations?', type: 'video', duration: '15 min', completed: true, locked: false },
        { id: 'l2', title: 'Standard Form vs Vertex Form', type: 'video', duration: '20 min', completed: true, locked: false },
        { id: 'l3', title: 'Practice Problems', type: 'quiz', duration: '10 min', completed: true, locked: false }
      ]
    },
    {
      id: 's2',
      title: 'Factoring Techniques',
      lessons: [
        { id: 'l4', title: 'Factoring by Grouping', type: 'video', duration: '25 min', completed: true, locked: false },
        { id: 'l5', title: 'Special Factoring Patterns', type: 'video', duration: '15 min', completed: false, locked: false, current: true },
        { id: 'l6', title: 'Factoring Assignment', type: 'assignment', duration: '45 min', completed: false, locked: false }
      ]
    },
    {
      id: 's3',
      title: 'The Quadratic Formula',
      lessons: [
        { id: 'l7', title: 'Deriving the Formula', type: 'video', duration: '30 min', completed: false, locked: true },
        { id: 'l8', title: 'Using the Discriminant', type: 'video', duration: '20 min', completed: false, locked: true }
      ]
    }
  ]
}

export default function LessonPage() {
  const params = useParams()
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const courseId = params.courseId as string
  const lessonId = params.lessonId as string
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showControls, setShowControls] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [newNote, setNewNote] = useState('')
  const [notes, setNotes] = useState(mockLessonData.notes)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const lesson = mockLessonData
  const course = mockCourseData

  // Get current lesson index and navigation
  const getAllLessons = () => {
    return course.sections.flatMap(section => section.lessons)
  }

  const allLessons = getAllLessons()
  const currentIndex = allLessons.findIndex(l => l.id === lessonId)
  const previousLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  // Video controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
      setPlaybackRate(rate)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const addNote = () => {
    if (newNote.trim()) {
      const note = {
        id: `n${notes.length + 1}`,
        timestamp: formatTime(currentTime),
        content: newNote,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setNotes([...notes, note])
      setNewNote('')
    }
  }

  const jumpToTimestamp = (timestamp: string) => {
    const [mins, secs] = timestamp.split(':').map(Number)
    const time = mins * 60 + secs
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const markAsComplete = () => {
    // Mark lesson as complete and navigate to next
    if (nextLesson && !nextLesson.locked) {
      router.push(`/dashboard/student/learn/${courseId}/${nextLesson.id}`)
    } else {
      router.push(`/dashboard/student/courses/${courseId}`)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />
      case 'document': return <FileText className="w-4 h-4" />
      case 'quiz': return <HelpCircle className="w-4 h-4" />
      case 'assignment': return <BookOpen className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="border-b bg-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/student/courses/${courseId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
          <div>
            <h1 className="font-semibold text-lg">{lesson.title}</h1>
            <p className="text-sm text-gray-600">{course.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? 'Hide' : 'Show'} Sidebar
          </Button>
          <Button onClick={markAsComplete}>
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark Complete
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Player Area */}
        <div className={`flex-1 flex flex-col bg-black ${sidebarOpen ? 'lg:w-2/3' : 'w-full'}`}>
          {/* Video */}
          <div className="flex-1 relative group">
            <video
              ref={videoRef}
              className="w-full h-full"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onClick={togglePlay}
            >
              <source src={lesson.videoUrl} type="video/mp4" />
            </video>

            {/* Video Controls Overlay */}
            <AnimatePresence>
              {showControls && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
                >
                  {/* Progress Bar */}
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full mb-3 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  />

                  {/* Controls */}
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <button onClick={togglePlay} className="hover:scale-110 transition">
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                      </button>
                      <button onClick={toggleMute} className="hover:scale-110 transition">
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      <span className="text-sm">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <select
                        value={playbackRate}
                        onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                        className="bg-black/50 text-white text-sm rounded px-2 py-1 border border-white/20"
                      >
                        <option value="0.5">0.5x</option>
                        <option value="0.75">0.75x</option>
                        <option value="1">1x</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                      </select>
                      <button className="hover:scale-110 transition">
                        <Settings className="w-5 h-5" />
                      </button>
                      <button className="hover:scale-110 transition">
                        <Maximize className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Lesson Navigation */}
          <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
            <div>
              {previousLesson && !previousLesson.locked ? (
                <Link href={`/dashboard/student/learn/${courseId}/${previousLesson.id}`}>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous: {previousLesson.title}
                  </Button>
                </Link>
              ) : (
                <Button variant="ghost" size="sm" disabled className="text-gray-500">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  No Previous Lesson
                </Button>
              )}
            </div>
            <div>
              {nextLesson && !nextLesson.locked ? (
                <Link href={`/dashboard/student/learn/${courseId}/${nextLesson.id}`}>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    Next: {nextLesson.title}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              ) : (
                <Button variant="ghost" size="sm" disabled className="text-gray-500">
                  {nextLesson ? 'Locked' : 'No More Lessons'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '33.333333%', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l bg-white overflow-hidden"
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="w-full justify-start rounded-none border-b">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="transcript">Transcript</TabsTrigger>
                  <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-hidden">
                  {/* Overview Tab */}
                  <TabsContent value="overview" className="h-full m-0">
                    <ScrollArea className="h-full">
                      <div className="p-4 space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">About this lesson</h3>
                          <p className="text-sm text-gray-700">{lesson.description}</p>
                        </div>

                        <div>
                          <h3 className="font-semibold mb-2">Resources</h3>
                          <div className="space-y-2">
                            {lesson.resources.map(resource => (
                              <div key={resource.id} className="flex items-center justify-between p-2 border rounded">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                  <span className="text-sm">{resource.title}</span>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Notes Tab */}
                  <TabsContent value="notes" className="h-full m-0">
                    <ScrollArea className="h-full">
                      <div className="p-4 space-y-4">
                        {/* Add Note */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-sm">Add Note at {formatTime(currentTime)}</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <textarea
                              value={newNote}
                              onChange={(e) => setNewNote(e.target.value)}
                              placeholder="Write your note here..."
                              className="w-full p-2 border rounded text-sm min-h-[80px]"
                            />
                            <Button onClick={addNote} size="sm" className="w-full">
                              <StickyNote className="w-4 h-4 mr-2" />
                              Save Note
                            </Button>
                          </CardContent>
                        </Card>

                        {/* Notes List */}
                        <div className="space-y-2">
                          {notes.map(note => (
                            <Card key={note.id}>
                              <CardContent className="pt-4">
                                <div className="flex items-start justify-between mb-2">
                                  <button
                                    onClick={() => jumpToTimestamp(note.timestamp)}
                                    className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1"
                                  >
                                    <Clock className="w-3 h-3" />
                                    {note.timestamp}
                                  </button>
                                  <span className="text-xs text-gray-500">{note.createdAt}</span>
                                </div>
                                <p className="text-sm text-gray-700">{note.content}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Transcript Tab */}
                  <TabsContent value="transcript" className="h-full m-0">
                    <ScrollArea className="h-full">
                      <div className="p-4 space-y-3">
                        {lesson.transcript.map((item, index) => (
                          <div key={index} className="flex gap-3">
                            <button
                              onClick={() => jumpToTimestamp(item.time)}
                              className="text-blue-600 hover:underline text-sm font-medium flex-shrink-0"
                            >
                              {item.time}
                            </button>
                            <p className="text-sm text-gray-700">{item.text}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Curriculum Tab */}
                  <TabsContent value="curriculum" className="h-full m-0">
                    <ScrollArea className="h-full">
                      <div className="p-4 space-y-4">
                        {course.sections.map((section, sectionIndex) => (
                          <div key={section.id}>
                            <h3 className="font-semibold text-sm mb-2">
                              Section {sectionIndex + 1}: {section.title}
                            </h3>
                            <div className="space-y-1">
                              {section.lessons.map(l => (
                                <Link
                                  key={l.id}
                                  href={l.locked ? '#' : `/dashboard/student/learn/${courseId}/${l.id}`}
                                  className={`block p-2 rounded text-sm ${
                                    l.id === lessonId
                                      ? 'bg-blue-50 border border-blue-200'
                                      : l.locked
                                      ? 'opacity-50 cursor-not-allowed'
                                      : 'hover:bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    {l.completed ? (
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                    ) : l.locked ? (
                                      <Lock className="w-4 h-4 text-gray-400" />
                                    ) : (
                                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                                    )}
                                    {getTypeIcon(l.type)}
                                    <span className="flex-1">{l.title}</span>
                                    <span className="text-xs text-gray-500">{l.duration}</span>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </div>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
