import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { RegistrationData } from '@/types/registration'

export const dynamic = 'force-dynamic'

const registerSchema = z.object({
  userType: z.enum(['student', 'teacher', 'parent', 'spoken_english']),
  personalInfo: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    mobileNumber: z.string().min(1, 'Mobile number is required'),
    whatsappNumber: z.string().optional(),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  }),
  addressInfo: z.object({
    country: z.string().min(1, 'Country is required'),
    state: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    address: z.string().min(1, 'Address is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
  }),
  categorySpecific: z.any(), // Will be validated based on user type
  idVerification: z.object({
    idType: z.string().min(1, 'ID type is required'),
    idNumber: z.string().min(1, 'ID number is required'),
    idFrontUrl: z.string().min(1, 'ID front image is required'),
    idBackUrl: z.string().optional(),
    profilePhotoUrl: z.string().optional(),
    selfieWithIdUrl: z.string().optional(),
  }),
  consents: z.object({
    termsAccepted: z.boolean().refine(val => val === true, 'Terms must be accepted'),
    privacyAccepted: z.boolean().refine(val => val === true, 'Privacy policy must be accepted'),
    gdprConsent: z.boolean().optional(),
    coppaConsent: z.boolean().optional(),
    emailNotifications: z.boolean(),
    smsNotifications: z.boolean(),
    whatsappNotifications: z.boolean(),
    dataSharing: z.boolean().refine(val => val === true, 'Data sharing consent is required'),
  }),
})

export async function POST(request: NextRequest) {
  try {
    const body: RegistrationData = await request.json()
    
    // Validate input
    const validatedData = registerSchema.parse(body)
    
    const adminClient = await createAdminClient()
    
    // Create user with Supabase Auth
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: validatedData.personalInfo.email.toLowerCase(),
      password: validatedData.personalInfo.password,
      email_confirm: false, // We'll handle email verification separately
      user_metadata: {
        first_name: validatedData.personalInfo.firstName,
        last_name: validatedData.personalInfo.lastName,
        user_type: validatedData.userType,
        mobile_number: validatedData.personalInfo.mobileNumber,
        whatsapp_number: validatedData.personalInfo.whatsappNumber,
        date_of_birth: validatedData.personalInfo.dateOfBirth,
        gender: validatedData.personalInfo.gender,
        profile_photo_url: validatedData.idVerification.profilePhotoUrl
      }
    })
    
    if (authError) {
      console.error('Auth user creation error:', authError)
      return NextResponse.json(
        { error: authError.message || 'Failed to create user account' },
        { status: 500 }
      )
    }
    
    const user = authData.user
    if (!user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    
    // Create user profile in users table
    const { data: profile, error: profileError} = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        full_name: validatedData.personalInfo.firstName,
        last_name: validatedData.personalInfo.lastName,
        role: validatedData.userType,
        mobile: validatedData.personalInfo.mobileNumber,
        whatsapp: validatedData.personalInfo.whatsappNumber,
        date_of_birth: validatedData.personalInfo.dateOfBirth,
        gender: validatedData.personalInfo.gender,
        country: validatedData.addressInfo.country,
        state: validatedData.addressInfo.state,
        city: validatedData.addressInfo.city,
        address: validatedData.addressInfo.address,
        postal_code: validatedData.addressInfo.postalCode,
        id_card_type: validatedData.idVerification.idType,
        id_card_url: validatedData.idVerification.idFrontUrl,
        profile_pic: validatedData.idVerification.profilePhotoUrl,
        account_status: validatedData.userType === 'teacher' ? 'pending_review' : 'pending_verification',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Continue with registration even if profile creation fails
    }
    
    // Generate verification token
    const verificationToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
    // Store verification token
    const { error: tokenError } = await supabase
      .from('users')
      .update({
        verification_token: verificationToken,
        token_expires_at: expiresAt.toISOString(),
      })
      .eq('id', user.id)
    
    if (tokenError) {
      console.error('Token storage error:', tokenError)
      // Continue anyway, user can request new verification
    }
    
    // Send verification email based on user type
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${verificationToken}`
    
    try {
      const { sendEmail } = await import('@/lib/email/resend')
      
      if (validatedData.userType === 'teacher') {
        // Send teacher pending review email
        await sendEmail({
          to: validatedData.personalInfo.email,
          subject: 'Teacher Application Received - St Haroon School',
          template: 'TeacherRegistrationPending',
          data: {
            firstName: validatedData.personalInfo.firstName,
            lastName: validatedData.personalInfo.lastName,
            submittedAt: new Date().toLocaleDateString()
          }
        })
      } else {
        // Send standard verification email
        await sendEmail({
          to: validatedData.personalInfo.email,
          subject: 'Verify your email - St Haroon School',
          template: 'RegistrationVerification',
          data: {
            firstName: validatedData.personalInfo.firstName,
            verificationUrl,
            expiresIn: '24 hours'
          }
        })
      }
    } catch (emailError) {
      console.error('Error sending verification email:', emailError)
      // Don't fail registration if email fails
    }
    
    const message = validatedData.userType === 'teacher' 
      ? 'Registration successful. Your application is under review and you will be notified within 24-48 hours.'
      : 'Registration successful. Please check your email for verification instructions.'
    
    return NextResponse.json({
      message,
      userId: user.id,
      userType: validatedData.userType,
      requiresReview: validatedData.userType === 'teacher'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}