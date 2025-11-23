'use client'

import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Track if this is the initial mount to prevent duplicate notifications
    let isInitialMount = true
    
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
      })
      // After initial session is loaded, mark as not initial mount
      setTimeout(() => {
        isInitialMount = false
      }, 100)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
        })

        // Only show notification for actual sign in events, not session refreshes
        // TOKEN_REFRESHED and INITIAL_SESSION events should not trigger notifications
        if (event === 'SIGNED_IN' && !isInitialMount) {
          toast.success('Successfully signed in!')
        } else if (event === 'SIGNED_OUT') {
          toast.success('Successfully signed out!')
          router.push('/auth/login')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router, supabase.auth])

  const signIn = async (email: string, password: string, rememberMe = false) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }))
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Handle specific error cases
        let errorMessage = 'Failed to sign in'
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email address before signing in.'
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please wait a moment and try again.'
        } else {
          errorMessage = error.message
        }
        
        toast.error(errorMessage)
        throw error
      }

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true')
        localStorage.setItem('rememberedEmail', email)
      } else {
        localStorage.removeItem('rememberMe')
        localStorage.removeItem('rememberedEmail')
      }

      return { data, error: null }
    } catch (error: any) {
      return { data: null, error }
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }))
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }))
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/verify-email`,
        },
      })

      if (error) throw error

      toast.success('Registration successful! Please check your email to verify your account.')
      return { data, error: null }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up')
      return { data: null, error }
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }))
    }
  }

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }))
      
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Clear local storage
      localStorage.removeItem('rememberMe')
      localStorage.removeItem('rememberedEmail')
      localStorage.removeItem('registrationDraft')
      
      return { error: null }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out')
      return { error }
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }))
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      toast.success('Password reset email sent! Please check your inbox.')
      return { error: null }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email')
      return { error }
    }
  }

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password })
      
      if (error) throw error

      toast.success('Password updated successfully!')
      return { error: null }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password')
      return { error }
    }
  }



  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  }
}