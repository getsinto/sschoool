'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Award,
  Clock,
  Target,
  BookOpen,
  Video,
  FileText,
  CheckCircle,
  Trophy,
  Flame,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Mock data
const mockProgressData = {
  overview: {
    totalCourses: 5,
    activeCourses: 3,
    completedCourses: 2,
    totalLessons: 45,
    completedLessons: 32,
    totalStudyTime: '48h 30m',
    currentStreak: 7,
    longestStreak: 14,
    averageScore: 87
  },
  courses: [
    {
      id: 'c1',
      title: 'Advanced Mathematics',
      progress: 75,
      grade: 92,
      lessonsCompleted: 12,
      totalLessons: 16,
      timeSpent: '18h 45m',
      lastAccessed: '2024-01-22',
      status: 'in_progress'
    },
    {
      id: 'c2',
      title: 'Physics Fundamentals',
      progress: 60,
      grade: 85,
      lessonsCompleted: 9,
      totalLessons: 15,
      timeSpent: '14h 20m',
      lastAccessed: '2024-01-21',
      status: 'in_progress'
    },
    {
      id: 'c3',
      title: 'English Literature',
      progress: 45,
      grade: 88,
      lessonsCompleted: 7,
      totalLessons: 14,
      timeSpent: '10h 15m',
      lastAccessed: '2024-01-20',
      status: 'in_progress'
    },
    {
      id: 'c4',
      title: 'World History',
      progress: 100,
      grade: 94,
      lessonsCompleted: 12,
      totalLessons: 12,
      timeSpent: '16h 30m',
      lastAccessed: '2024-01-15',
      status: 'completed',
      certificate: true
    },
    {
      id: 'c5',
      title: 'Chemistry Basics',
      progress: 100,
      grade: 90,
      lessonsCompleted: 10,
      totalLessons: 10,
      timeSpent: '12h 40m',
      lastAccessed: '2024-01-10',
      status: 'completed',
      certificate: true
    }
  ],
  weeklyActivity: [
    { day: 'Mon', hours: 2.5, lessons: 3 },
    { day: 'Tue', hours: 3.0, lessons: 4 },
    { day: 'Wed', hours: 1.5, lessons: 2 },
    { day: 'Thu', hours: 2.0, lessons: 3 },
    { day: 'Fri', hours: 3.5, lessons: 5 },
    { day: 'Sat', hours: 4.0, lessons: 6 },
    { day: 'Sun', hours: 2.5, lessons: 3 }
  ],
  achievements: [
    {
      id: 'a1',
      title: 'First Course Completed',
      description: 'Complete your first course',
      icon: '🎓',
      earned: true,
      earnedDate: '2024-01-10'
    },
    {
      id: 'a2',
      title: 'Week Warrior',
      description: 'Study for 7 consecutive days',
      icon: '🔥',
      earned: true,
      earnedDate: '2024-01-18'
    },
    {
      id: 'a3',
      title: 'Perfect Score',
      description: 'Get 100% on a quiz',
      icon: '💯',
      earned: true,
      earnedDate: '2024-01-15'
    },
    {
      id: 'a4',
      title: 'Speed Learner',
      description: 'Complete 10 lessons in one day',
      icon: '⚡',
      earned: false
    },
    {
      id: 'a5',
      title: 'Marathon Runner',
      description: 'Study for 30 consecutive days',
      icon: '🏃',
      earned: false
    },
    {
      id: 'a6',
      title: 'Honor Roll',
      description: 'Maintain 90%+ average across all courses',
      icon: '🏆',
      earned: false
    }
  ],
  recentActivity: [
    {
      id: 'r1',
      type: 'lesson_completed',
      title: 'Completed "Special Factoring Patterns"',
      course: 'Advanced Mathematics',
      timestamp: '2024-01-22T14:30:00',
      icon: CheckCircle
    },
    {
      id: 'r2',
      type: 'quiz_completed',
      title: 'Scored 94% on Mid-term Quiz',
      course: 'Advanced Mathematics',
      timestamp: '2024-01-22T13:15:00',
      icon: Award
    },
    {
      id: 'r3',
      type: 'assignment_submitted',
      title: 'Submitted Problem Set Assignment',
      course: 'Physics Fundamentals',
      timestamp: '2024-01-21T16:45:00',
      icon: FileText
    },
    {
      id: 'r4',
      type: 'lesson_completed',
      title: 'Completed "Newton\'s Laws of Motion"',
      course: 'Physics Fundamentals',
      timestamp: '2024-01-21T15:20:00',
      icon: CheckCircle
    }
  ],
  goals: [
    {
      id: 'g1',
      title: 'Complete Advanced Mathematics',
      target: 16,
      current: 12,
      type: 'lessons',
      deadline: '2024-02-15'
    },
    {
      id: 'g2',
      title: 'Maintain 90%+ Average',
      target: 90,
      current: 87,
      type: 'grade',
      deadline: '2024-03-01'
    },
    {
      id: 'g3',
      title: 'Study 20 hours this month',
      target: 20,
      current: 15.5,
      type: 'hours',
      deadline: '2024-01-31'
    }
  ]
}

export default function ProgressPage() {
  const [data] = useState(mockProgressData)
  const [activeTab, setActiveTab] = useState('overview')

  const maxHours = Math.max(...data.weeklyActivity.map(d => d.hours))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">My Progress</h1>
        <p className="text-gray-600">Track your learning journey and achievements</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Courses</p>
                <p className="text-3xl font-bold">{data.overview.activeCourses}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {data.overview.completedCourses} completed
                </p>
              </div>
              <BookOpen className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Study Time</p>
                <p className="text-3xl font-bold">{data.overview.totalStudyTime}</p>
                <p className="text-xs text-gray-500 mt-1">Total hours</p>
              </div>
              <Clock className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Streak</p>
                <p className="text-3xl font-bold flex items-center gap-2">
                  {data.overview.currentStreak}
                  <Flame className="w-6 h-6 text-orange-500" />
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Best: {data.overview.longestStreak} days
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Score</p>
                <p className="text-3xl font-bold">{data.overview.averageScore}%</p>
                <p className="text-xs text-gray-500 mt-1">Across all courses</p>
              </div>
              <Award className="w-12 h-12 text-yellow-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Weekly Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.weeklyActivity.map((day, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{day.day}</span>
                        <span className="text-gray-600">{day.hours}h • {day.lessons} lessons</span>
                      </div>
                      <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(day.hours / maxHours) * 100}%` }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.recentActivity.map((activity) => {
                    const Icon = activity.icon
                    return (
                      <div key={activity.id} className="flex gap-3">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{activity.title}</p>
                          <p className="text-xs text-gray-600">{activity.course}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Overall Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Lessons Completed</span>
                    <span className="font-semibold">
                      {data.overview.completedLessons}/{data.overview.totalLessons}
                    </span>
                  </div>
                  <Progress 
                    value={(data.overview.completedLessons / data.overview.totalLessons) * 100} 
                    className="h-3"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Courses Completed</span>
                    <span className="font-semibold">
                      {data.overview.completedCourses}/{data.overview.totalCourses}
                    </span>
                  </div>
                  <Progress 
                    value={(data.overview.completedCourses / data.overview.totalCourses) * 100} 
                    className="h-3"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Average Performance</span>
                    <span className="font-semibold">{data.overview.averageScore}%</span>
                  </div>
                  <Progress value={data.overview.averageScore} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          {data.courses.map((course) => (
            <Card key={course.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{course.title}</h3>
                      <Badge variant={course.status === 'completed' ? 'default' : 'outline'}>
                        {course.status === 'completed' ? 'Completed' : 'In Progress'}
                      </Badge>
                      {course.certificate && (
                        <Badge variant="secondary">
                          <Award className="w-3 h-3 mr-1" />
                          Certificate
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">{course.grade}%</div>
                    <p className="text-xs text-gray-600">Current Grade</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Progress</p>
                    <p className="font-semibold">{course.progress}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Lessons</p>
                    <p className="font-semibold">
                      {course.lessonsCompleted}/{course.totalLessons}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time Spent</p>
                    <p className="font-semibold">{course.timeSpent}</p>
                  </div>
                </div>

                <Progress value={course.progress} className="h-2" />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card className={achievement.earned ? 'border-yellow-200 bg-yellow-50' : 'opacity-60'}>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-5xl mb-3">{achievement.icon}</div>
                      <h3 className="font-semibold mb-1">{achievement.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                      {achievement.earned ? (
                        <Badge variant="default">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Earned {new Date(achievement.earnedDate!).toLocaleDateString()}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Locked</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          {data.goals.map((goal) => {
            const progress = (goal.current / goal.target) * 100
            const daysUntilDeadline = Math.ceil(
              (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            )

            return (
              <Card key={goal.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{goal.title}</h3>
                      <p className="text-sm text-gray-600">
                        Deadline: {new Date(goal.deadline).toLocaleDateString()} ({daysUntilDeadline} days left)
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-semibold">
                        {goal.current} / {goal.target} {goal.type}
                      </span>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <p className="text-xs text-gray-600">
                      {progress >= 100 ? '🎉 Goal achieved!' : `${(100 - progress).toFixed(0)}% remaining`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>
      </Tabs>
    </div>
  )
}
