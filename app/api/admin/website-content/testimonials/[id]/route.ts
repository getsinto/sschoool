import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication and admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const body = await request.json()
    const { id } = params

    // Check if testimonial exists
    const { data: existingTestimonial } = await supabase
      .from('testimonials')
      .select('*')
      .eq('id', id)
      .single()

    if (!existingTestimonial) {
      return NextResponse.json(
        { error: 'Testimonial not found' },
        { status: 404 }
      )
    }

    // Validate rating if provided
    if (body.rating && (body.rating < 1 || body.rating > 5)) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Update the testimonial
    const { data: updatedTestimonial, error: updateError } = await supabase
      .from('testimonials')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating testimonial:', updateError)
      return NextResponse.json(
        { error: 'Failed to update testimonial' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      testimonial: updatedTestimonial
    })

  } catch (error) {
    console.error('Error in testimonial update API:', error)
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
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication and admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const { id } = params

    // Soft delete by marking as inactive
    const { error: deleteError } = await supabase
      .from('testimonials')
      .update({ status: 'inactive' })
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting testimonial:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete testimonial' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Testimonial deleted successfully'
    })

  } catch (error) {
    console.error('Error in testimonial delete API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
