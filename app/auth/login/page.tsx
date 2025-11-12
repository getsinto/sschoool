'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import SharedLayout from '@/components/layout/SharedLayout'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().default(false),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, user } = useAuth()

  // Simple dashboard URL function
  const getDashboardUrl = () => {
    // Get user role from user metadata
    const userType = user?.user_metadata?.user_type
    
    if (userType === 'student') {
      return '/student'
    } else if (userType === 'teacher') {
      return '/teacher'
    } else if (userType === 'admin') {
      return '/admin'
    } else if (userType === 'parent') {
      return '/parent'
    }
    
    // Default to student dashboard
    return '/student'
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectTo = searchParams.get('redirectTo') || getDashboardUrl()
      router.push(redirectTo)
    }
  }, [user, router, searchParams, getDashboardUrl])

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail')
    if (rememberedEmail) {
      setValue('email', rememberedEmail)
      setValue('rememberMe', true)
    }
  }, [setValue])

  const onSubmit = async (data: LoginForm) => {
    console.log('Form submitted with data:', data)
    setIsLoading(true)
    
    try {
      console.log('Attempting to sign in...')
      const { error } = await signIn(data.email, data.password, data.rememberMe)
      
      console.log('Sign in result:', { error })
      
      if (!error) {
        console.log('Sign in successful, redirecting...')
        // Store email if remember me is checked
        if (data.rememberMe) {
          localStorage.setItem('rememberedEmail', data.email)
        } else {
          localStorage.removeItem('rememberedEmail')
        }

        const redirectTo = searchParams.get('redirectTo') || getDashboardUrl()
        console.log('Redirecting to:', redirectTo)
        router.push(redirectTo)
      } else {
        console.error('Sign in failed:', error)
      }
    } catch (err) {
      console.error('Sign in error:', err)
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <SharedLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/30 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-32 w-24 h-24 bg-purple-200/30 rounded-full blur-lg animate-bounce" />
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-indigo-200/20 rounded-full blur-2xl" />
        <div className="absolute bottom-20 right-20 w-28 h-28 bg-pink-200/30 rounded-full blur-xl animate-pulse" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg">
              <span className="text-white font-bold text-2xl">SH</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
            <p className="text-gray-600">Sign in to continue your learning journey</p>
          </div>

          <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95">
        <CardHeader className="space-y-1 pb-8">
          <CardTitle className="text-2xl font-bold text-center text-gray-900">
            Sign In
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            Access your St Haroon Online School account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" onInvalid={(e) => console.log('Form invalid:', e)}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Debug: Show rememberMe error */}
            {errors.rememberMe && (
              <div className="text-sm text-red-600">
                RememberMe Error: {JSON.stringify(errors.rememberMe)}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  id="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  {...register('rememberMe')}
                />
                <Label htmlFor="rememberMe" className="text-sm">
                  Remember me
                </Label>
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
              disabled={isLoading}
              onClick={(e) => {
                console.log('Button clicked!')
                console.log('Form errors:', errors)
                console.log('Is loading:', isLoading)
                // Don't prevent default, let the form handle it
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In to Your Account'
              )}
            </Button>
          </form>

          {/* Debug test button */}
          <Button
            onClick={async () => {
              console.log('Test button clicked!')
              setIsLoading(true)
              try {
                const result = await signIn('test@example.com', 'password123', false)
                console.log('Test sign in result:', result)
              } catch (error) {
                console.error('Test sign in error:', error)
              } finally {
                setIsLoading(false)
              }
            }}
            variant="outline"
            className="w-full mt-4"
            disabled={isLoading}
          >
            Test Login (test@example.com)
          </Button>

          <div className="text-center text-sm">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
      </div>
    </SharedLayout>
  )
}