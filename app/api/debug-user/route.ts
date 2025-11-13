import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.json({
      authenticated: false,
      message: 'No session found'
    })
  }
  
  const userRole = session.user.user_metadata?.user_type || session.user.app_metadata?.role
  
  return NextResponse.json({
    authenticated: true,
    email: session.user.email,
    user_id: session.user.id,
    detected_role: userRole,
    user_metadata: session.user.user_metadata,
    app_metadata: session.user.app_metadata,
    email_confirmed: !!session.user.email_confirmed_at
  })
}
