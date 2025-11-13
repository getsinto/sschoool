'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { useAuth } from './useAuth'

type UserProfile = Database['public']['Tables']['users']['Row']
type TeacherProfile = Database['public']['Tables']['teachers']['Row']
type StudentProfile = Database['public']['Tables']['students']['Row']
type ParentProfile = Database['public']['Tables']['parents']['Row']

interface UserData {
  profile: UserProfile | null
  teacherProfile: TeacherProfile | null
  studentProfile: StudentProfile | null
  parentProfile: ParentProfile | null
  loading: boolean
  error: string | null
}

export function useUser() {
  const { user, session } = useAuth()
  const [userData, setUserData] = useState<UserData>({
    profile: null,
    teacherProfile: null,
    studentProfile: null,
    parentProfile: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!user) {
      setUserData({
        profile: null,
        teacherProfile: null,
        studentProfile: null,
        parentProfile: null,
        loading: false,
        error: null,
      })
      return
    }

    const fetchUserData = async () => {
      try {
        setUserData(prev => ({ ...prev, loading: true, error: null }))

        // Fetch user profile via API route
        const response = await fetch('/api/user/profile')
        
        if (!response.ok) {
          throw new Error('Failed to fetch user profile')
        }

        const data = await response.json()
        
        let teacherProfile = null
        let studentProfile = null
        let parentProfile = null

        // Assign role-specific profile
        const userType = data.userType || data.profile?.user_type || data.profile?.role
        if (userType === 'teacher') {
          teacherProfile = data.roleProfile
        } else if (userType === 'student') {
          studentProfile = data.roleProfile
        } else if (userType === 'parent') {
          parentProfile = data.roleProfile
        }

        setUserData({
          profile: data.profile,
          teacherProfile,
          studentProfile,
          parentProfile,
          loading: false,
          error: null,
        })
      } catch (error: any) {
        console.error('User data fetch error:', error)
        setUserData(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to fetch user data',
        }))
      }
    }

    fetchUserData()
  }, [user])

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: 'No user logged in' }

    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      setUserData(prev => ({ ...prev, profile: data }))
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  }

  const updateTeacherProfile = async (updates: Partial<TeacherProfile>) => {
    if (!user || userData.profile?.role !== 'teacher') {
      return { error: 'Not authorized' }
    }

    try {
      const { data, error } = await supabase
        .from('teachers')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setUserData(prev => ({ ...prev, teacherProfile: data }))
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  }

  const updateStudentProfile = async (updates: Partial<StudentProfile>) => {
    if (!user || userData.profile?.role !== 'student') {
      return { error: 'Not authorized' }
    }

    try {
      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setUserData(prev => ({ ...prev, studentProfile: data }))
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  }

  const updateParentProfile = async (updates: Partial<ParentProfile>) => {
    if (!user || userData.profile?.role !== 'parent') {
      return { error: 'Not authorized' }
    }

    try {
      const { data, error } = await supabase
        .from('parents')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      setUserData(prev => ({ ...prev, parentProfile: data }))
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  }

  const getDashboardUrl = () => {
    if (!userData.profile) return '/auth/login'
    
    switch (userData.profile.role) {
      case 'admin':
        return '/admin'
      case 'teacher':
        return '/teacher'
      case 'student':
        return '/student'
      case 'parent':
        return '/parent'
      default:
        return '/dashboard'
    }
  }

  const isEmailVerified = () => {
    return user?.email_confirmed_at !== null
  }

  const isProfileComplete = () => {
    if (!userData.profile) return false
    
    const requiredFields = ['full_name', 'mobile', 'country']
    return requiredFields.every(field => userData.profile![field as keyof UserProfile])
  }

  const needsApproval = () => {
    return userData.profile?.role === 'teacher' && !userData.teacherProfile?.is_approved
  }

  return {
    ...userData,
    user,
    session,
    updateProfile,
    updateTeacherProfile,
    updateStudentProfile,
    updateParentProfile,
    getDashboardUrl,
    isEmailVerified,
    isProfileComplete,
    needsApproval,
  }
}