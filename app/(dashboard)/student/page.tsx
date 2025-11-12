'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Award,
  Clock,
  TrendingUp,
  Calendar,
  Bell,
  Flame,
  Target,
  PlayCircle,
  CheckCircle,
  AlertCircle,
  Trophy,
  Star,
  ArrowRight,
  Video,
  FileText,
  MessageSquare
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'

// Mock data
const mockDashboardData = {
  student: {
    name: 'Sarah Johnson',
    streak: 7,
    totalLearningHours: 45,
    enrolledCourses: 4,
    coursesInProgress: 3,
    coursesCompleted: 1,
    certificatesEarned: 1
  },
  lastAccessedCourse: {
    id: 'c1',
    title: 'Advanced Mathematics',
    thumbnail: '/courses/math.jpg',
    progress: 75,
    nextLesson: 'Lesson 16: Quadratic Equations',
    lastPosition: '15:30'
  },
  upcomingLiveClass: {
    id: 'lc1',
    title: 'Physics Review Session',
    course: 'Physics Fundamentals',
    date: '2024-01-25T14:00:00',
    duration: 60,
    instructor: 'Dr. Smith',
    canJoin: false
  },
  upcomingAssignments: [
    {
      id: 'a1',
      title: 'Math Problem Set 5',
      course: 'Advanced Mathematics',
      dueDate: '2024-01-26T23:59:00',
      status: 'not_started',
      urgency: 'high'
    },
    {
      id: 'a2',
      title: 'Physics Lab Report',
      course: 'Physics Fundamentals',
      dueDate: '2024-01-28T23:59:00',
      status: 'in_progress',
      urgency: 'medium'
    }
  ],
  enrolledCourses: [
    {
      id: 'c1',
      title: 'Advanced Mathematics',
      thumbnail: '/courses/math.jpg',
      progress: 75,
      nextLesson: 'Lesson 16',
      instructor: 'Prof. Anderson'
    },
    {
      id: 'c2',
      title: 'Physics Fundamentals',
      thumbnail: '/courses/physics.jpg',
      progress: 60,
      nextLesson: 'Lesson 12',
      instructor: 'Dr. Smith'
    },
    {
      id: 'c3',
      title: 'Chemistry Basics',
      thumbnail: '/courses/chemistry.jpg',
      progress: 45,
      nextLesson: 'Lesson 9',
      instructor: 'Dr. Johnson'
    }
  ],
  recentBadges: [
    { id: 'b1', name: 'Quick Learner', icon: '⚡', earnedDate: '2024-01-20' },
    { id: 'b2', name: '7 Day Streak', icon: '🔥', earnedDate: '2024-01-22' },
    { id: 'b3', name: 'Perfect Score', icon: '💯', earnedDate: '2024-01-18' }
  ],
  announcements: [
    {
      id: 'an1',
      title: 'New Course Available: Data Science Fundamentals',
      priority: 'high',
      date: '2024-01-22',
      read: false
    },
    {
      id: 'an2',
      title: 'System Maintenance Scheduled',
      priority: 'medium',
      date: '2024-01-21',
      read: false
    },
    {
      id: 'an3',
      title: 'Congratulations on completing Advanced Mathematics!',
      priority: 'low',
      date: '2024-01-20',
      read: true
    }
  ],
  performance: {
    averageQuizScore: 88,
    assignmentCompletionRate: 92,
    attendanceRate: 95
  },
  recommendedCourses: [
    {
      id: 'rc1',
      title: 'Calculus I',
      thumbnail: '/courses/calculus.jpg',
      rating: 4.8,
      students: 1250
    },
    {
      id: 'rc2',
      title: 'Advanced Physics',
      thumbnail: '/courses/advanced-physics.jpg',
      rating: 4.7,
      students: 980
    }
  ]
}

const motivationalQuotes = [
  "Every expert was once a beginner. Keep learning!",
  "The beautiful thing about learning is that no one can take it away from you.",
  "Education is the passport to the future.",
  "Learning is a treasure that will follow its owner everywhere.",
  "The more that you read, the more things you will know."
]

export default function StudentDashboard() {
  // Use first quote to avoid hydration mismatch
  const [quote] = useState(motivationalQuotes[0])
  const data = mockDashboardData

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTimeUntil = (date: string) => {
    const now = new Date()
    const target = new Date(date)
    const diff = target.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h`
    return 'Soon'
  }

  return (
    <div className="space-y-8">
      {/* Hero Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-8 text-white"
      >
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {data.student.name}! 👋
          </h1>
          <p className="text-lg opacity-90 mb-4">{quote}</p>
          
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
              <Flame className="w-5 h-5 text-orange-300" />
              <span className="font-semibold">{data.student.streak} Day Streak!</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">{data.student.totalLearningHours}h Learning Time</span>
            </div>
          </div>

          <Link href={`/dashboard/student/courses/${data.lastAccessedCourse.id}/learn`}>
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              <PlayCircle className="w-5 h-5 mr-2" />
              Continue Learning
            </Button>
          </Link>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
      </motion.div>

      {/* Progress Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold">{data.student.enrolledCourses}</div>
              <p className="text-sm text-gray-600">Enrolled Courses</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Target className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-2xl font-bold">{data.student.coursesInProgress}</div>
              <p className="text-sm text-gray-600">In Progress</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold">{data.student.coursesCompleted}</div>
              <p className="text-sm text-gray-600">Completed</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-2xl font-bold">{data.student.totalLearningHours}h</div>
              <p className="text-sm text-gray-600">Learning Hours</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Flame className="w-8 h-8 text-red-600" />
              </div>
              <div className="text-2xl font-bold">{data.student.streak}</div>
              <p className="text-sm text-gray-600">Day Streak</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold">{data.student.certificatesEarned}</div>
              <p className="text-sm text-gray-600">Certificates</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-2"
        >
          <Card className="hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-blue-600" />
                Continue Learning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{data.lastAccessedCourse.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Next: {data.lastAccessedCourse.nextLesson}
                  </p>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold">{data.lastAccessedCourse.progress}%</span>
                    </div>
                    <Progress value={data.lastAccessedCourse.progress} className="h-2" />
                  </div>
                  <Link href={`/dashboard/student/courses/${data.lastAccessedCourse.id}/learn`}>
                    <Button className="w-full">
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Resume at {data.lastAccessedCourse.lastPosition}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-6"
        >
          {/* Next Live Class */}
          <Card className="border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Video className="w-5 h-5 text-red-600" />
                Next Live Class
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold">{data.upcomingLiveClass.title}</h4>
                <p className="text-sm text-gray-600">{data.upcomingLiveClass.course}</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>{new Date(data.upcomingLiveClass.date).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>In {getTimeUntil(data.upcomingLiveClass.date)}</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  disabled={!data.upcomingLiveClass.canJoin}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Join Class
                </Button>
                <Button variant="outline" size="icon">
                  <Calendar className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Assignments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Upcoming Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.upcomingAssignments.map((assignment) => (
                <div key={assignment.id} className="border-l-2 border-blue-500 pl-3">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-sm">{assignment.title}</h4>
                    <Badge className={getUrgencyColor(assignment.urgency)} variant="outline">
                      {assignment.urgency}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{assignment.course}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                    <Link href={`/dashboard/student/assignments/${assignment.id}`}>
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        Start
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              <Link href="/dashboard/student/assignments">
                <Button variant="outline" size="sm" className="w-full">
                  View All Tasks
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* My Courses Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">My Courses</h2>
          <Link href="/dashboard/student/courses">
            <Button variant="outline">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.enrolledCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
            >
              <Card className="hover:shadow-xl transition-all hover:-translate-y-1">
                <CardContent className="p-0">
                  <div className="h-40 bg-gradient-to-br from-blue-400 to-purple-500 rounded-t-lg" />
                  <div className="p-4">
                    <h3 className="font-bold mb-1">{course.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{course.instructor}</p>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold">{course.progress}%</span>
                      </div>
                      <div className="relative">
                        <Progress value={course.progress} className="h-2" />
                        <div 
                          className="absolute top-0 left-0 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-3">Next: {course.nextLesson}</p>
                    
                    <Link href={`/dashboard/student/courses/${course.id}/learn`}>
                      <Button className="w-full">
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Continue
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Achievements & Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.recentBadges.map((badge) => (
                <div key={badge.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                  <div className="text-3xl">{badge.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{badge.name}</h4>
                    <p className="text-xs text-gray-600">
                      {new Date(badge.earnedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              <Link href="/dashboard/student/achievements">
                <Button variant="outline" size="sm" className="w-full">
                  View All Achievements
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Performance Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Average Quiz Score</span>
                  <span className="font-semibold">{data.performance.averageQuizScore}%</span>
                </div>
                <Progress value={data.performance.averageQuizScore} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Assignment Completion</span>
                  <span className="font-semibold">{data.performance.assignmentCompletionRate}%</span>
                </div>
                <Progress value={data.performance.assignmentCompletionRate} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Attendance Rate</span>
                  <span className="font-semibold">{data.performance.attendanceRate}%</span>
                </div>
                <Progress value={data.performance.attendanceRate} className="h-2" />
              </div>

              <Link href="/dashboard/student/grades">
                <Button variant="outline" size="sm" className="w-full">
                  View Detailed Report
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Announcements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.announcements.slice(0, 3).map((announcement) => (
                <div 
                  key={announcement.id} 
                  className={`p-3 rounded-lg border ${
                    announcement.read ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!announcement.read && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{announcement.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(announcement.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <Link href="/dashboard/student/announcements">
                <Button variant="outline" size="sm" className="w-full">
                  View All Announcements
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recommended Courses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Recommended for You</h2>
          <Link href="/dashboard/student/browse">
            <Button variant="outline">
              Browse All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.recommendedCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-xl transition-all hover:-translate-y-1">
              <CardContent className="p-0">
                <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 rounded-t-lg" />
                <div className="p-4">
                  <h3 className="font-bold mb-2">{course.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{course.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{course.students} students</span>
                    </div>
                  </div>
                  <Link href={`/dashboard/student/courses/${course.id}`}>
                    <Button variant="outline" className="w-full">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
