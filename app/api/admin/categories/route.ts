/**
 * API routes for course category management
 * Admin-only endpoints for creating and managing course categories
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/categories
 * Retrieve all course categories
 * 
 * Query Parameters:
 * - include_inactive: boolean (default: false) - Include inactive categories
 * 
 * Returns:
 * - 200: Array of categories ordered by display_order and name
 * - 401: Unauthorized
 * - 403: Forbidden (not admin)
 * - 500: Server error
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
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
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const includeInactive = searchParams.get('include_inactive') === 'true'
    
    // Build query
    let query = supabase
      .from('course_categories')
      .select('*')
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })
    
    // Filter by active status if needed
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }
    
    const { data: categories, error: categoriesError } = await query
    
    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      categories: categories || [],
      count: categories?.length || 0
    })
    
  } catch (error) {
    console.error('Unexpected error in GET /api/admin/categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/categories
 * Create a new course category
 * 
 * Request Body (FormData):
 * - name: string (required) - Category name
 * - description: string (optional) - Category description
 * - color: string (required) - Hex color code
 * - icon: File (optional) - Category icon image
 * 
 * Returns:
 * - 201: Created category
 * - 400: Validation error
 * - 401: Unauthorized
 * - 403: Forbidden (not admin)
 * - 409: Duplicate category name
 * - 500: Server error
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
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
    
    // Parse form data
    const formData = await request.formData()
    const name = formData.get('name') as string
    const description = formData.get('description') as string | null
    const color = formData.get('color') as string
    const icon = formData.get('icon') as File | null
    
    // Validate required fields
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Category name must be at least 2 characters' },
        { status: 400 }
      )
    }
    
    if (!color || !/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return NextResponse.json(
        { error: 'Valid hex color code is required (e.g., #3B82F6)' },
        { status: 400 }
      )
    }
    
    // Generate slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
    
    // Check for duplicate name or slug
    const { data: existing, error: checkError } = await supabase
      .from('course_categories')
      .select('id, name')
      .or(`name.ilike.${name},slug.eq.${slug}`)
      .limit(1)
    
    if (checkError) {
      console.error('Error checking for duplicate category:', checkError)
      return NextResponse.json(
        { error: 'Failed to validate category name' },
        { status: 500 }
      )
    }
    
    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: 'A category with this name already exists' },
        { status: 409 }
      )
    }
    
    // Handle icon upload if provided
    let iconUrl: string | null = null
    
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
      
      // Upload icon to storage
      const fileExt = icon.name.split('.').pop()
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
      
      iconUrl = urlData.publicUrl
    }
    
    // Get the highest display_order
    const { data: maxOrderData } = await supabase
      .from('course_categories')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
    
    const nextOrder = (maxOrderData && maxOrderData.length > 0 && maxOrderData[0]) 
      ? ((maxOrderData[0] as any).display_order || 0) + 1 
      : 0
    
    // Create category
    const { data: category, error: createError } = await supabase
      .from('course_categories')
      .insert({
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        color,
        icon_url: iconUrl,
        is_active: true,
        display_order: nextOrder
      } as any)
      .select()
      .single()
    
    if (createError) {
      console.error('Error creating category:', createError)
      return NextResponse.json(
        { error: 'Failed to create category' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { 
        category,
        message: 'Category created successfully'
      },
      { status: 201 }
    )
    
  } catch (error) {
    console.error('Unexpected error in POST /api/admin/categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
