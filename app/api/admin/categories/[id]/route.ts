/**
 * API routes for individual course category management
 * Admin-only endpoints for updating and deleting specific categories
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * PATCH /api/admin/categories/[id]
 * Update an existing course category
 * 
 * Request Body (FormData):
 * - name: string (optional) - Category name
 * - description: string (optional) - Category description
 * - color: string (optional) - Hex color code
 * - icon: File (optional) - Category icon image
 * - display_order: number (optional) - Display order
 * 
 * Returns:
 * - 200: Updated category
 * - 400: Validation error
 * - 401: Unauthorized
 * - 403: Forbidden (not admin)
 * - 404: Category not found
 * - 409: Duplicate category name
 * - 500: Server error
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const categoryId = params.id
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (userError || !userData || (userData as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }
    
    // Check if category exists
    const { data: existingCategory, error: fetchError } = await supabase
      .from('course_categories')
      .select('*')
      .eq('id', categoryId)
      .single()
    
    if (fetchError || !existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }
    
    // Parse form data
    const formData = await request.formData()
    const name = formData.get('name') as string | null
    const description = formData.get('description') as string | null
    const color = formData.get('color') as string | null
    const icon = formData.get('icon') as File | null
    const displayOrderStr = formData.get('display_order') as string | null
    
    // Build update object
    const updates: any = {}
    
    // Validate and add name if provided
    if (name !== null) {
      if (name.trim().length < 2) {
        return NextResponse.json(
          { error: 'Category name must be at least 2 characters' },
          { status: 400 }
        )
      }
      
      // Check for duplicate name (excluding current category)
      const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
      
      const { data: duplicate } = await supabase
        .from('course_categories')
        .select('id')
        .neq('id', categoryId)
        .or(`name.ilike.${name},slug.eq.${slug}`)
        .limit(1)
      
      if (duplicate && duplicate.length > 0) {
        return NextResponse.json(
          { error: 'A category with this name already exists' },
          { status: 409 }
        )
      }
      
      updates.name = name.trim()
      updates.slug = slug
    }
    
    // Validate and add color if provided
    if (color !== null) {
      if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
        return NextResponse.json(
          { error: 'Valid hex color code is required (e.g., #3B82F6)' },
          { status: 400 }
        )
      }
      updates.color = color
    }
    
    // Add description if provided
    if (description !== null) {
      updates.description = description.trim() || null
    }
    
    // Add display_order if provided
    if (displayOrderStr !== null) {
      const displayOrder = parseInt(displayOrderStr, 10)
      if (!isNaN(displayOrder) && displayOrder >= 0) {
        updates.display_order = displayOrder
      }
    }
    
    // Handle icon upload if provided
    if (icon && icon.size > 0) {
      // Validate icon file
      if (icon.size > 1024 * 1024) {
        return NextResponse.json(
          { error: 'Icon file must be less than 1MB' },
          { status: 400 }
        )
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
      if (!allowedTypes.includes(icon.type)) {
        return NextResponse.json(
          { error: 'Icon must be a JPEG, PNG, SVG, or WebP image' },
          { status: 400 }
        )
      }
      
      // Delete old icon if exists
      if ((existingCategory as any).icon_url) {
        try {
          const oldPath = (existingCategory as any).icon_url.split('/').pop()
          if (oldPath) {
            await supabase.storage
              .from('course-assets')
              .remove([`category-icons/${oldPath}`])
          }
        } catch (error) {
          console.error('Error deleting old icon:', error)
          // Continue even if deletion fails
        }
      }
      
      // Upload new icon
      const fileExt = icon.name.split('.').pop()
      const slug = updates.slug || (existingCategory as any).slug
      const fileName = `${slug}-${Date.now()}.${fileExt}`
      const filePath = `category-icons/${fileName}`
      
      const { error: uploadError } = await supabase.storage
        .from('course-assets')
        .upload(filePath, icon, {
          contentType: icon.type,
          upsert: false
        })
      
      if (uploadError) {
        console.error('Error uploading icon:', uploadError)
        return NextResponse.json(
          { error: 'Failed to upload icon' },
          { status: 500 }
        )
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('course-assets')
        .getPublicUrl(filePath)
      
      updates.icon_url = urlData.publicUrl
    }
    
    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }
    
    // Update category
    const { data: category, error: updateError } = await supabase
      .from('course_categories')
      // @ts-expect-error - Supabase type inference issue with dynamic updates
      .update(updates)
      .eq('id', categoryId)
      .select()
      .single()
    
    if (updateError) {
      console.error('Error updating category:', updateError)
      return NextResponse.json(
        { error: 'Failed to update category' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      category,
      message: 'Category updated successfully'
    })
    
  } catch (error) {
    console.error('Unexpected error in PATCH /api/admin/categories/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/categories/[id]
 * Soft-delete a course category
 * 
 * Returns:
 * - 200: Category soft-deleted successfully
 * - 401: Unauthorized
 * - 403: Forbidden (not admin)
 * - 404: Category not found
 * - 409: Category is in use by courses
 * - 500: Server error
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const categoryId = params.id
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (userError || !userData || (userData as any).role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      )
    }
    
    // Check if category exists
    const { data: existingCategory, error: fetchError } = await supabase
      .from('course_categories')
      .select('slug')
      .eq('id', categoryId)
      .single()
    
    if (fetchError || !existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }
    
    // Check if category is in use by any courses
    const { data: coursesUsingCategory, error: coursesError } = await supabase
      .from('courses')
      .select('id')
      .eq('category', (existingCategory as any).slug)
      .limit(1)
    
    if (coursesError) {
      console.error('Error checking category usage:', coursesError)
      return NextResponse.json(
        { error: 'Failed to check category usage' },
        { status: 500 }
      )
    }
    
    if (coursesUsingCategory && coursesUsingCategory.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete category that is in use by courses',
          message: 'This category is currently assigned to one or more courses. Please reassign those courses before deleting this category.'
        },
        { status: 409 }
      )
    }
    
    // Soft-delete category by setting is_active to false
    const { error: deleteError } = await supabase
      .from('course_categories')
      // @ts-expect-error - Supabase type inference issue
      .update({ is_active: false })
      .eq('id', categoryId)
    
    if (deleteError) {
      console.error('Error soft-deleting category:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete category' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    })
    
  } catch (error) {
    console.error('Unexpected error in DELETE /api/admin/categories/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
