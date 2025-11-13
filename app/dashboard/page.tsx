import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardRoot() {
  const supabase = createClient()
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
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
      redirect('/admin')
    case 'teacher':
      redirect('/teacher')
    case 'parent':
      redirect('/parent')
    case 'student':
    default:
      redirect('/student')
  }
}