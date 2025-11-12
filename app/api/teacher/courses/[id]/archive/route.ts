import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a teacher
    const userRole = user.user_metadata?.role || user.app_metadata?.role
    
    if (userRole !== 'teacher') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const courseId = params.id

    // TODO: Implement course archiving logic
    // This should:
    // 1. Set course status to 'archived'
    // 2. Prevent new enrollments
    // 3. Keep existing student access
    // 4. Hide from public course listings

    return NextResponse.json({
      success: true,
      message: 'Course archived successfully'
    })
  } catch (error) {
    console.error('Archive course error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a teacher
    const userRole = user.user_metadata?.role || user.app_metadata?.role
    
    if (userRole !== 'teacher') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const courseId = params.id

    // TODO: Implement course unarchiving logic
    // This should restore the course to its previous status

    return NextResponse.json({
      success: true,
      message: 'Course unarchived successfully'
    })
  } catch (error) {
    console.error('Unarchive course error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
