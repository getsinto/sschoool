'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DashboardRoot() {
  const router = useRouter()
  
  useEffect(() => {
    const redirectUser = async () => {
      const supabase = createClient()
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      // Get user profile to determine role
      const { data: profile } = await supabase
        .from('users')
        .select('user_type')
        .eq('id', user.id)
        .single()
      
      // Redirect based on user role
      const userType = profile?.user_type || 'student'
      
      switch (userType) {
        case 'admin':
          router.push('/admin')
          break
        case 'teacher':
          router.push('/teacher')
          break
        case 'parent':
          router.push('/parent')
          break
        case 'student':
        default:
          router.push('/student')
          break
      }
    }
    
    redirectUser()
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}