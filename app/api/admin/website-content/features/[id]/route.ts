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

    // Check if feature exists
    const { data: existingFeature } = await supabase
      .from('platform_features')
      .select('*')
      .eq('id', id)
      .single()

    if (!existingFeature) {
      return NextResponse.json(
        { error: 'Feature not found' },
        { status: 404 }
      )
    }

    // Validate category if provided
    if (body.category) {
      const validCategories = ['teaching', 'learning', 'platform', 'student_benefits', 'parent_benefits']
      if (!validCategories.includes(body.category)) {
        return NextResponse.json(
          { error: `Category must be one of: ${validCategories.join(', ')}` },
          { status: 400 }
        )
      }
    }

    // Update the feature
    const { data: updatedFeature, error: updateError } = await supabase
      .from('platform_features')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating feature:', updateError)
      return NextResponse.json(
        { error: 'Failed to update feature' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      feature: updatedFeature
    })

  } catch (error) {
    console.error('Error in feature update API:', error)
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
      .from('platform_features')
      .update({ is_active: false })
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting feature:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete feature' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Feature deleted successfully'
    })

  } catch (error) {
    console.error('Error in feature delete API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
