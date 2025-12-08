import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSecurePassword, validatePassword } from '@/lib/utils/password-generator'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

// Validation schemas
const personalInfoSchema = z.object({
  email: z.string().email('Invalid email format'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  mobile: z.string().optional(),
  whatsapp: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
})

const studentFieldsSchema = z.object({
  studentType: z.enum(['online_school', 'spoken_english']),
  gradeLevel: z.string().optional(),
  previousSchool: z.string().optional(),
  academicYear: z.string().optional(),
  englishLevel: z.string().optional(),
  purpose: z.string().optional(),
  learningSchedule: z.string().optional(),
})

const teacherFieldsSchema = z.object({
  qualifications: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  experienceYears: z.number().min(0).optional(),
  subjects: z.array(z.string()).optional(),
  bio: z.string().optional(),
  preApproved: z.boolean().optional(),
})

const parentFieldsSchema = z.object({
  relationship: z.string().optional(),
  occupation: z.string().optional(),
  linkedStudents: z.array(z.string()).optional(),
})

const accountSettingsSchema = z.object({
  accountStatus: z.enum(['active', 'inactive', 'suspended']).default('active'),
  bypassVerification: z.boolean().default(false),
  sendWelcomeEmail: z.boolean().default(true),
  requirePasswordChange: z.boolean().default(true),
})

const createUserSchema = z.object({
  userType: z.enum(['student', 'teacher', 'parent', 'admin']),
  personalInfo: personalInfoSchema,
  roleSpecificData: z.union([
    studentFieldsSchema,
    teacherFieldsSchema,
    parentFieldsSchema,
    z.object({}),
  ]).optional(),
  accountSettings: accountSettingsSchema,
})

/**
 * POST /api/admin/users/create
 * Creates a new user account with admin privileges
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
    const validationResult = createUserSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      )
    }

    const { userType, personalInfo, roleSpecificData, accountSettings } = validationResult.data

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', personalInfo.email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }

    // Generate secure temporary password
    const temporaryPassword = generateSecurePassword()

    // Validate generated password (should always pass, but good to verify)
    const passwordValidation = validatePassword(temporaryPassword)
    if (!passwordValidation.isValid) {
      throw new Error('Generated password does not meet requirements')
    }

    // Get client IP for audit logging
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    // Create user in Supabase Auth using admin client
    const { data: newAuthUser, error: createAuthError } = await supabase.auth.admin.createUser({
      email: personalInfo.email,
      password: temporaryPassword,
      email_confirm: accountSettings.bypassVerification,
      user_metadata: {
        full_name: personalInfo.fullName,
        role: userType,
        created_by_admin: true,
        require_password_change: accountSettings.requirePasswordChange,
      },
    })

    if (createAuthError || !newAuthUser.user) {
      // Log failure
      await supabase.rpc('log_user_creation_failure', {
        p_admin_id: authUser.id,
        p_user_type: userType,
        p_email: personalInfo.email,
        p_error_message: createAuthError?.message || 'Unknown error',
        p_ip_address: clientIp,
      })

      return NextResponse.json(
        { error: createAuthError?.message || 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create user profile in database
    const { error: profileError } = await supabase.from('users').insert({
      id: newAuthUser.user.id,
      email: personalInfo.email,
      role: userType,
      full_name: personalInfo.fullName,
      date_of_birth: personalInfo.dateOfBirth || null,
      gender: personalInfo.gender || null,
      mobile: personalInfo.mobile || null,
      whatsapp: personalInfo.whatsapp || null,
      country: personalInfo.country || null,
      state: personalInfo.state || null,
      city: personalInfo.city || null,
      address: personalInfo.address || null,
      postal_code: personalInfo.postalCode || null,
      is_verified: accountSettings.bypassVerification,
      is_active: accountSettings.accountStatus === 'active',
    })

    if (profileError) {
      // Rollback: Delete auth user
      await supabase.auth.admin.deleteUser(newAuthUser.user.id)

      // Log failure
      await supabase.rpc('log_user_creation_failure', {
        p_admin_id: authUser.id,
        p_user_type: userType,
        p_email: personalInfo.email,
        p_error_message: profileError.message,
        p_ip_address: clientIp,
      })

      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      )
    }

    // Create role-specific profile
    let roleProfileError: any = null

    if (userType === 'student' && roleSpecificData) {
      const studentData = roleSpecificData as z.infer<typeof studentFieldsSchema>
      const { error } = await supabase.from('students').insert({
        user_id: newAuthUser.user.id,
        student_type: studentData.studentType,
        grade_level: studentData.gradeLevel || null,
        previous_school: studentData.previousSchool || null,
        academic_year: studentData.academicYear || null,
        english_level: studentData.englishLevel || null,
        purpose: studentData.purpose || null,
        learning_schedule: studentData.learningSchedule || null,
      })
      roleProfileError = error
    } else if (userType === 'teacher' && roleSpecificData) {
      const teacherData = roleSpecificData as z.infer<typeof teacherFieldsSchema>
      const { error } = await supabase.from('teachers').insert({
        user_id: newAuthUser.user.id,
        qualifications: teacherData.qualifications || null,
        field_of_study: teacherData.fieldOfStudy || null,
        experience_years: teacherData.experienceYears || 0,
        subjects: teacherData.subjects || null,
        bio: teacherData.bio || null,
        is_approved: teacherData.preApproved || false,
      })
      roleProfileError = error
    } else if (userType === 'parent' && roleSpecificData) {
      const parentData = roleSpecificData as z.infer<typeof parentFieldsSchema>
      const { error } = await supabase.from('parents').insert({
        user_id: newAuthUser.user.id,
        relationship: parentData.relationship || null,
        occupation: parentData.occupation || null,
        linked_students: parentData.linkedStudents || null,
      })
      roleProfileError = error
    }

    if (roleProfileError) {
      // Rollback: Delete user profile and auth user
      await supabase.from('users').delete().eq('id', newAuthUser.user.id)
      await supabase.auth.admin.deleteUser(newAuthUser.user.id)

      // Log failure
      await supabase.rpc('log_user_creation_failure', {
        p_admin_id: authUser.id,
        p_user_type: userType,
        p_email: personalInfo.email,
        p_error_message: roleProfileError.message,
        p_ip_address: clientIp,
      })

      return NextResponse.json(
        { error: 'Failed to create role-specific profile' },
        { status: 500 }
      )
    }

    // Log successful user creation
    await supabase.rpc('log_user_creation', {
      p_admin_id: authUser.id,
      p_created_user_id: newAuthUser.user.id,
      p_user_type: userType,
      p_ip_address: clientIp,
    })

    // Log password generation
    await supabase.rpc('log_password_generation', {
      p_admin_id: authUser.id,
      p_user_id: newAuthUser.user.id,
      p_ip_address: clientIp,
    })

    // Return success with temporary password
    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        user: {
          id: newAuthUser.user.id,
          email: personalInfo.email,
          fullName: personalInfo.fullName,
          role: userType,
        },
        temporaryPassword,
        requirePasswordChange: accountSettings.requirePasswordChange,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
