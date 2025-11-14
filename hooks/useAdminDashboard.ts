'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface DashboardStats {
  totalUsers: {
    total: number
    students: number
    teachers: number
    parents: number
    change: number
    trend: 'up' | 'down'
  }
  totalRevenue: {
    current: number
    previous: number
    change: number
    trend: 'up' | 'down'
  }
  activeCourses: {
    total: number
    change: number
    trend: 'up' | 'down'
  }
  pendingApprovals: {
    total: number
    change: number
    trend: 'up' | 'down'
  }
  newRegistrations: {
    total: number
    change: number
    trend: 'up' | 'down'
  }
  liveClassesToday: {
    total: number
    change: number
    trend: 'up' | 'down'
  }
  supportTickets: {
    total: number
    change: number
    trend: 'up' | 'down'
  }
  platformUsage: {
    total: number
    change: number
    trend: 'up' | 'down'
  }
}

export interface DashboardData {
  stats: DashboardStats | null
  revenueData: Array<{ month: string; revenue: number }>
  userGrowthData: Array<{ month: string; users: number }>
  courseEnrollmentData: Array<{ course: string; enrollments: number }>
  recentActivities: Array<{
    id: number
    type: string
    message: string
    time: string
    icon: string
    color: string
  }>
}

export function useAdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      if (!response.ok) throw new Error('Failed to fetch dashboard data')
      
      const dashboardData = await response.json()
      setData(dashboardData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  // Setup real-time subscriptions
  useEffect(() => {
    fetchDashboardData()

    // Subscribe to profiles changes (new users, registrations)
    const profilesChannel = supabase
      .channel('dashboard-profiles')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profile change detected:', payload)
          fetchDashboardData()
        }
      )
      .subscribe()

    // Subscribe to payments changes
    const paymentsChannel = supabase
      .channel('dashboard-payments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'payments'
        },
        (payload) => {
          console.log('Payment received:', payload)
          fetchDashboardData()
        }
      )
      .subscribe()

    // Subscribe to enrollments changes
    const enrollmentsChannel = supabase
      .channel('dashboard-enrollments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'enrollments'
        },
        (payload) => {
          console.log('New enrollment:', payload)
          fetchDashboardData()
        }
      )
      .subscribe()

    // Subscribe to support tickets changes
    const ticketsChannel = supabase
      .channel('dashboard-tickets')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_tickets'
        },
        (payload) => {
          console.log('Ticket update:', payload)
          fetchDashboardData()
        }
      )
      .subscribe()

    // Subscribe to courses changes
    const coursesChannel = supabase
      .channel('dashboard-courses')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'courses'
        },
        (payload) => {
          console.log('Course update:', payload)
          fetchDashboardData()
        }
      )
      .subscribe()

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(profilesChannel)
      supabase.removeChannel(paymentsChannel)
      supabase.removeChannel(enrollmentsChannel)
      supabase.removeChannel(ticketsChannel)
      supabase.removeChannel(coursesChannel)
    }
  }, [fetchDashboardData, supabase])

  const refresh = useCallback(() => {
    setLoading(true)
    fetchDashboardData()
  }, [fetchDashboardData])

  return {
    data,
    loading,
    error,
    refresh
  }
}
