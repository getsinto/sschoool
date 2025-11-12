import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { Database } from '@/types/database'

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard']
  
  // Auth routes that should redirect if already logged in
  const authRoutes = ['/auth/login', '/auth/register']
  
  // Routes that require email verification
  const verificationRequiredRoutes = ['/dashboard']
  
  // Admin-only routes
  const adminRoutes = ['/admin']

  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )
  const isVerificationRequiredRoute = verificationRequiredRoutes.some(route =>
    req.nextUrl.pathname.startsWith(route)
  )
  const isAdminRoute = adminRoutes.some(route =>
    req.nextUrl.pathname.startsWith(route)
  )

  // Redirect to login if accessing protected route without session
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth/login', req.url)
    redirectUrl.searchParams.set('redirectTo', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is logged in, check additional requirements
  if (session) {
    // Get user role from metadata (simpler approach for now)
    const userRole = session.user.user_metadata?.user_type || session.user.app_metadata?.role

    // Check email verification for routes that require it
    // Skip verification check for test users or if email is already confirmed
    const isEmailConfirmed = session.user.email_confirmed_at || session.user.user_metadata?.email_confirm
    if (isVerificationRequiredRoute && !isEmailConfirmed) {
      const redirectUrl = new URL('/auth/verify-email', req.url)
      redirectUrl.searchParams.set('email', session.user.email || '')
      return NextResponse.redirect(redirectUrl)
    }

    // Check admin access - only admins can access admin routes
    if (isAdminRoute && userRole !== 'admin') {
      // Redirect to user's appropriate dashboard
      if (userRole === 'teacher') {
        return NextResponse.redirect(new URL('/teacher', req.url))
      } else if (userRole === 'parent') {
        return NextResponse.redirect(new URL('/parent', req.url))
      } else {
        // Default to student dashboard
        return NextResponse.redirect(new URL('/student', req.url))
      }
    }
    
    // Check teacher access - only redirect if NOT a teacher or admin
    if (req.nextUrl.pathname.startsWith('/teacher')) {
      if (userRole === 'student') {
        return NextResponse.redirect(new URL('/student', req.url))
      } else if (userRole === 'parent') {
        return NextResponse.redirect(new URL('/parent', req.url))
      } else if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin', req.url))
      }
      // If userRole is 'teacher' or undefined, allow access
    }
    
    // Check student access - only redirect if NOT a student or admin
    if (req.nextUrl.pathname.startsWith('/student')) {
      if (userRole === 'teacher') {
        return NextResponse.redirect(new URL('/teacher', req.url))
      } else if (userRole === 'parent') {
        return NextResponse.redirect(new URL('/parent', req.url))
      } else if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin', req.url))
      }
      // If userRole is 'student' or undefined, allow access
    }
    
    // Check parent access - only redirect if NOT a parent or admin
    if (req.nextUrl.pathname.startsWith('/parent')) {
      if (userRole === 'student') {
        return NextResponse.redirect(new URL('/student', req.url))
      } else if (userRole === 'teacher') {
        return NextResponse.redirect(new URL('/teacher', req.url))
      } else if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin', req.url))
      }
      // If userRole is 'parent' or undefined, allow access
    }

    // Redirect to appropriate dashboard if accessing auth routes
    if (isAuthRoute) {
      let dashboardUrl = '/student' // Default to student
      
      if (userRole === 'student') {
        dashboardUrl = '/student'
      } else if (userRole === 'teacher') {
        dashboardUrl = '/teacher'
      } else if (userRole === 'parent') {
        dashboardUrl = '/parent'
      } else if (userRole === 'admin') {
        dashboardUrl = '/admin'
      }
      
      return NextResponse.redirect(new URL(dashboardUrl, req.url))
    }
    
    // Redirect from /dashboard root to appropriate role dashboard
    if (req.nextUrl.pathname === '/dashboard') {
      let dashboardUrl = '/student' // Default to student
      
      if (userRole === 'teacher') {
        dashboardUrl = '/teacher'
      } else if (userRole === 'parent') {
        dashboardUrl = '/parent'
      } else if (userRole === 'admin') {
        dashboardUrl = '/admin'
      }
      
      return NextResponse.redirect(new URL(dashboardUrl, req.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}