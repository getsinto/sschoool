'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useUser } from '@/hooks/useUser'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'teacher' | 'student' | 'parent'
  requireEmailVerification?: boolean
  requireApproval?: boolean
}

export default function ProtectedRoute({
  children,
  requiredRole,
  requireEmailVerification = true,
  requireApproval = false,
}: ProtectedRouteProps) {
  const { user, loading: authLoading } = useAuth()
  const { profile, loading: profileLoading, isEmailVerified, needsApproval } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (authLoading || profileLoading) return

    // Not authenticated
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Email not verified
    if (requireEmailVerification && !isEmailVerified()) {
      router.push('/auth/verify-email')
      return
    }

    // Profile not found
    if (!profile) {
      router.push('/auth/login')
      return
    }

    // Role mismatch
    if (requiredRole && profile.role !== requiredRole) {
      router.push('/dashboard') // Redirect to appropriate dashboard
      return
    }

    // Teacher needs approval
    if (requireApproval && needsApproval()) {
      router.push('/auth/pending-approval')
      return
    }

    // Account not active
    if (!profile.is_active) {
      router.push('/auth/account-suspended')
      return
    }
  }, [
    user,
    profile,
    authLoading,
    profileLoading,
    requiredRole,
    requireEmailVerification,
    requireApproval,
    router,
    isEmailVerified,
    needsApproval,
  ])

  // Show loading state
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show nothing while redirecting
  if (!user || !profile) {
    return null
  }

  // Email verification required
  if (requireEmailVerification && !isEmailVerified()) {
    return null
  }

  // Role check
  if (requiredRole && profile.role !== requiredRole) {
    return null
  }

  // Approval check
  if (requireApproval && needsApproval()) {
    return null
  }

  // Account suspended
  if (!profile.is_active) {
    return null
  }

  return <>{children}</>
}