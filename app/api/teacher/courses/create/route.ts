/**
 * Teacher Course Creation Endpoint (BLOCKED)
 * Feature: course-assignment-permissions
 * 
 * This endpoint explicitly blocks teachers from creating courses.
 * Teachers can only manage content for courses assigned to them by administrators.
 * 
 * Requirements: 1.2, 1.3
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// ============================================================================
// ERROR RESPONSE HELPER
// ============================================================================

function createForbiddenResponse(method: string = 'POST') {
  return NextResponse.json(
    {
      error: 'Forbidden',
      message: 'Only administrators can create courses',
      code: 'INSUFFICIENT_PERMISSIONS',
      details: 'Teachers can manage content for courses assigned to them by administrators, but cannot create new courses.',
      action: 'Please contact an administrator to create a new course or to be assigned to an existing course.',
      redirect_url: '/teacher/courses',
      required_role: 'admin',
      required_level: 4,
      method_attempted: method
    },
    { 
      status: 403,
      headers: {
        'X-Permission-Required': 'admin',
        'X-Permission-Level': '4'
      }
    }
  );
}

// ============================================================================
// POST HANDLER - Course Creation (BLOCKED)
// ============================================================================

/**
 * POST /api/teacher/courses/create
 * 
 * Blocks teachers from creating courses.
 * Returns 403 Forbidden with helpful error message.
 * 
 * Requirement 1.2: Teachers cannot create courses
 * Requirement 1.3: Non-admin roles rejected with 403
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get current user for logging purposes
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user details
    const { data: userData } = await supabase
      .from('users')
      .select('id, role, role_level, email, full_name')
      .eq('id', user.id)
      .single();

    // Log the attempt for security monitoring
    console.warn('Teacher course creation attempt blocked:', {
      user_id: user.id,
      user_email: userData?.email,
      user_role: userData?.role,
      user_level: userData?.role_level,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
    });

    // Return 403 Forbidden (Requirement 1.2, 1.3)
    return createForbiddenResponse('POST');

  } catch (error) {
    console.error('Error in blocked teacher course creation endpoint:', error);
    
    // Still return 403 even on error to maintain security
    return createForbiddenResponse('POST');
  }
}

// ============================================================================
// GET HANDLER - Form Data (BLOCKED)
// ============================================================================

/**
 * GET /api/teacher/courses/create
 * 
 * Blocks teachers from accessing course creation form data.
 * Returns 403 Forbidden.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Log the attempt
    console.warn('Teacher course creation form access attempt blocked:', {
      user_id: user.id,
      timestamp: new Date().toISOString()
    });

    return createForbiddenResponse('GET');

  } catch (error) {
    console.error('Error in blocked teacher course creation form endpoint:', error);
    return createForbiddenResponse('GET');
  }
}

// ============================================================================
// PUT HANDLER - Update (BLOCKED)
// ============================================================================

/**
 * PUT /api/teacher/courses/create
 * 
 * Returns 405 Method Not Allowed since this endpoint doesn't support PUT.
 * Also includes 403 Forbidden information.
 */
export async function PUT(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Method Not Allowed',
      message: 'PUT method is not supported on this endpoint',
      code: 'METHOD_NOT_ALLOWED',
      details: 'Additionally, teachers cannot create courses. Only administrators can create courses.',
      redirect_url: '/teacher/courses',
      allowed_methods: []
    },
    { 
      status: 405,
      headers: {
        'Allow': '',
        'X-Permission-Required': 'admin'
      }
    }
  );
}

// ============================================================================
// PATCH HANDLER - Partial Update (BLOCKED)
// ============================================================================

/**
 * PATCH /api/teacher/courses/create
 * 
 * Returns 405 Method Not Allowed since this endpoint doesn't support PATCH.
 * Also includes 403 Forbidden information.
 */
export async function PATCH(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Method Not Allowed',
      message: 'PATCH method is not supported on this endpoint',
      code: 'METHOD_NOT_ALLOWED',
      details: 'Additionally, teachers cannot create courses. Only administrators can create courses.',
      redirect_url: '/teacher/courses',
      allowed_methods: []
    },
    { 
      status: 405,
      headers: {
        'Allow': '',
        'X-Permission-Required': 'admin'
      }
    }
  );
}

// ============================================================================
// DELETE HANDLER - Delete (BLOCKED)
// ============================================================================

/**
 * DELETE /api/teacher/courses/create
 * 
 * Returns 405 Method Not Allowed since this endpoint doesn't support DELETE.
 * Also includes 403 Forbidden information.
 */
export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Method Not Allowed',
      message: 'DELETE method is not supported on this endpoint',
      code: 'METHOD_NOT_ALLOWED',
      details: 'Additionally, teachers cannot create courses. Only administrators can create courses.',
      redirect_url: '/teacher/courses',
      allowed_methods: []
    },
    { 
      status: 405,
      headers: {
        'Allow': '',
        'X-Permission-Required': 'admin'
      }
    }
  );
}
