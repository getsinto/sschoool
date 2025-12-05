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

    // Check if FAQ exists
    const { data: existingFAQ } = await supabase
      .from('faqs')
      .select('*')
      .eq('id', id)
      .single()

    if (!existingFAQ) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      )
    }

    // Validate category if provided
    if (body.category) {
      const validCategories = ['admissions', 'courses', 'payments', 'technical', 'general']
      if (!validCategories.includes(body.category)) {
        return NextResponse.json(
          { error: `Category must be one of: ${validCategories.join(', ')}` },
          { status: 400 }
        )
      }
    }

    // Update the FAQ
    const { data: updatedFAQ, error: updateError } = await supabase
      .from('faqs')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating FAQ:', updateError)
      return NextResponse.json(
        { error: 'Failed to update FAQ' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      faq: updatedFAQ
    })

  } catch (error) {
    console.error('Error in FAQ update API:', error)
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
      .from('faqs')
      .update({ is_active: false })
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting FAQ:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete FAQ' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'FAQ deleted successfully'
    })

  } catch (error) {
    console.error('Error in FAQ delete API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
