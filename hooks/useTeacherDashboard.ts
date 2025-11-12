'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'

interface TeacherStats {
  totalCourses: number
  totalStudents: number
  upcomingClasses: number
  pendingGrading: number
  averageRating: number
  teachingHours: number
  monthlyEarnings: number
  activeEnrollments: number
}

interface CoursePerformance {
  id: string
  title: string
  students: number
  completion: number
  rating: number
  revenue: number
}

interface UpcomingClass {
  id: number
  title: string
  course: string
  dateTime: string
  duration: number
  studentsCount: number
  canJoin: boolean
  meetingLink: string
}

interface RecentActivity {
  id: number
  type: string
  message: string
  time: string
  icon: any
  color: string
}

interface StudentAtRisk {
  id: number
  name: string
  avatar: string
  course: string
  issue: string
  lastActive: string
  riskLevel: string
  completionRate: number
}

export function useTeacherDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<TeacherStats | null>(null)
  const [coursePerformance, setCoursePerformance] = useState<CoursePerformance[]>([])
  const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [studentsAtRisk, setStudentsAtRisk] = useState<StudentAtRisk[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTeacherStats = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Use the teacher dashboard API endpoint
      const response = await fetch('/api/teacher/dashboard')
      
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats || null)
        setCoursePerformance(data.courses || [])
        setUpcomingClasses(data.upcomingClasses || [])
        setRecentActivity(data.recentActivity || [])
        setStudentsAtRisk(data.studentsAtRisk || [])
      } else {
        setError('Failed to load dashboard data')
      }
    } catch (err) {
      console.error('Error fetching teacher stats:', err)
      setError('An error occurred while loading dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeacherStats()
  }, [user])

  return {
    stats,
    coursePerformance,
    upcomingClasses,
    recentActivity,
    studentsAtRisk,
    loading,
    error,
    refetch: fetchTeacherStats
  }
}