import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const checkEmailSchema = z.object({
  email: z.string().email('Invalid email format'),
})

/**
 * POST /api/admin/users/check-email
 * Checks if an email address is already in use
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated and is an admin
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role
    const { data: adminUser, error: adminError } = await supabase
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .single()

    if (adminError || adminUser?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validationResult = checkEmailSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const { email } = validationResult.data

    // Check if email exists in users table
    const { data: existingUser, error: queryError } = await supabase
      .from('users')
      .select('id, email, full_name, role')
      .eq('email', email)
      .maybeSingle()

    if (queryError) {
      console.error('Error checking email:', queryError)
      return NextResponse.json(
        { error: 'Failed to check email availability' },
        { status: 500 }
      )
    }

    if (existingUser) {
      return NextResponse.json({
        available: false,
        message: 'Email is already in use',
        existingUser: {
          id: existingUser.id,
          email: existingUser.email,
          fullName: existingUser.full_name,
          role: existingUser.role,
        },
      })
    }

    return NextResponse.json({
      available: true,
      message: 'Email is available',
    })
  } catch (error) {
    console.error('Error checking email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
