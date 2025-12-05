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

    const labelId = params.id
    const body = await request.json()

    // Check if label exists
    const { data: existingLabel, error: fetchError } = await supabase
      .from('course_labels')
      .select('*')
      .eq('id', labelId)
      .single()

    if (fetchError || !existingLabel) {
      return NextResponse.json({ error: 'Label not found' }, { status: 404 })
    }

    // Prepare update data
    const updateData: any = {}

    if (body.name !== undefined) {
      // Check if new name conflicts with another label
      if (body.name !== existingLabel.name) {
        const { data: conflictLabel } = await supabase
          .from('course_labels')
          .select('id')
          .eq('name', body.name)
          .neq('id', labelId)
          .single()

        if (conflictLabel) {
          return NextResponse.json(
            { error: 'A label with this name already exists' },
            { status: 409 }
          )
        }
      }
      updateData.name = body.name
    }

    if (body.description !== undefined) {
      updateData.description = body.description
    }

    if (body.color !== undefined) {
      updateData.color = body.color
    }

    if (body.icon !== undefined) {
      updateData.icon = body.icon
    }

    if (body.is_active !== undefined) {
      updateData.is_active = body.is_active
    }

    if (body.display_order !== undefined) {
      updateData.display_order = body.display_order
    }

    // Update the label
    const { data: updatedLabel, error: updateError } = await supabase
      .from('course_labels')
      .update(updateData)
      .eq('id', labelId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating label:', updateError)
      return NextResponse.json(
        { error: 'Failed to update label' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      label: updatedLabel
    })

  } catch (error) {
    console.error('Error in label update API:', error)
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

    const labelId = params.id

    // Soft delete by setting is_active to false
    const { error: deleteError } = await supabase
      .from('course_labels')
      .update({ is_active: false })
      .eq('id', labelId)

    if (deleteError) {
      console.error('Error deleting label:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete label' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Label deleted successfully'
    })

  } catch (error) {
    console.error('Error in label delete API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
