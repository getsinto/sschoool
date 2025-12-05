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

    // Check if brochure exists
    const { data: existingBrochure } = await supabase
      .from('brochures')
      .select('*')
      .eq('id', id)
      .single()

    if (!existingBrochure) {
      return NextResponse.json(
        { error: 'Brochure not found' },
        { status: 404 }
      )
    }

    // If marking as current, unmark other brochures of same type
    if (body.is_current && body.brochure_type) {
      await supabase
        .from('brochures')
        .update({ is_current: false })
        .eq('brochure_type', body.brochure_type)
        .neq('id', id)
    }

    // Update the brochure
    const { data: updatedBrochure, error: updateError } = await supabase
      .from('brochures')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating brochure:', updateError)
      return NextResponse.json(
        { error: 'Failed to update brochure' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      brochure: updatedBrochure
    })

  } catch (error) {
    console.error('Error in brochure update API:', error)
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
      .from('brochures')
      .update({ is_active: false })
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting brochure:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete brochure' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Brochure deleted successfully'
    })

  } catch (error) {
    console.error('Error in brochure delete API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
