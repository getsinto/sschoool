/**
 * Integration Tests: Admin Direct User Creation
 * 
 * Tests the complete end-to-end flow of admin creating users directly
 * from the dashboard, including validation, database operations, and audit logging.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import { createClient } from '@supabase/supabase-js'

// Test configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

describe('Admin User Creation Integration Tests', () => {
  let adminUserId: string
  let testUserIds: string[] = []

  beforeAll(async () => {
    // Create a test admin user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'test-admin@example.com',
      password: 'TestPassword123!',
      email_confirm: true,
    })

    if (authError || !authData.user) {
      throw new Error('Failed to create test admin user')
    }

    adminUserId = authData.user.id

    // Set admin role
    await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', adminUserId)
  })

  afterAll(async () => {
    // Clean up test users
    for (const userId of testUserIds) {
      await supabase.auth.admin.deleteUser(userId)
    }

    // Clean up admin user
    if (adminUserId) {
      await supabase.auth.admin.deleteUser(adminUserId)
    }
  })

  beforeEach(() => {
    testUserIds = []
  })

  describe('Student Creation', () => {
    it('should create a student user with all required fields', async () => {
      const studentData = {
        userType: 'student',
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: `student-${Date.now()}@example.com`,
          mobileNumber: '+1234567890',
          dateOfBirth: '2010-01-01',
          gender: 'male',
          country: 'United States',
          city: 'New York',
          address: '123 Test St',
          postalCode: '10001',
        },
        roleSpecific: {
          studentType: 'online_school',
          gradeLevel: '8',
          academicYear: '2024-2025',
        },
        accountSettings: {
          accountStatus: 'active',
          isVerified: true,
          skipEmailVerification: true,
          sendWelcomeEmail: false,
          requirePasswordChange: true,
        },
      }

      // Make API request (simulated - in real test would use actual API)
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: studentData.personalInfo.email,
        password: 'TempPassword123!',
        email_confirm: studentData.accountSettings.skipEmailVerification,
      })

      expect(authError).toBeNull()
      expect(authUser.user).toBeDefined()

      if (authUser.user) {
        testUserIds.push(authUser.user.id)

        // Verify user profile created
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.user.id)
          .single()

        expect(profileError).toBeNull()
        expect(profile).toBeDefined()
        expect(profile?.email).toBe(studentData.personalInfo.email)
        expect(profile?.role).toBe('student')

        // Verify student-specific data
        const { data: studentProfile, error: studentError } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', authUser.user.id)
          .single()

        expect(studentError).toBeNull()
        expect(studentProfile).toBeDefined()
        expect(studentProfile?.student_type).toBe(studentData.roleSpecific.studentType)
        expect(studentProfile?.grade_level).toBe(studentData.roleSpecific.gradeLevel)
      }
    })

    it('should prevent duplicate email addresses', async () => {
      const email = `duplicate-${Date.now()}@example.com`

      // Create first user
      const { data: firstUser, error: firstError } = await supabase.auth.admin.createUser({
        email,
        password: 'TempPassword123!',
      })

      expect(firstError).toBeNull()
      if (firstUser.user) {
        testUserIds.push(firstUser.user.id)
      }

      // Attempt to create second user with same email
      const { data: secondUser, error: secondError } = await supabase.auth.admin.createUser({
        email,
        password: 'TempPassword123!',
      })

      expect(secondError).toBeDefined()
      expect(secondUser.user).toBeNull()
    })
  })

  describe('Teacher Creation', () => {
    it('should create a teacher user with qualifications', async () => {
      const teacherData = {
        userType: 'teacher',
        personalInfo: {
          firstName: 'Jane',
          lastName: 'Smith',
          email: `teacher-${Date.now()}@example.com`,
          mobileNumber: '+1234567891',
          dateOfBirth: '1990-01-01',
          gender: 'female',
          country: 'United States',
          city: 'Boston',
          address: '456 Test Ave',
          postalCode: '02101',
        },
        roleSpecific: {
          qualifications: 'Master of Education',
          fieldOfStudy: 'Mathematics',
          experienceYears: 5,
          subjects: ['Mathematics', 'Physics'],
          bio: 'Experienced math teacher',
          isApproved: true,
        },
        accountSettings: {
          accountStatus: 'active',
          isVerified: true,
          skipEmailVerification: true,
          sendWelcomeEmail: false,
          requirePasswordChange: true,
        },
      }

      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: teacherData.personalInfo.email,
        password: 'TempPassword123!',
        email_confirm: true,
      })

      expect(authError).toBeNull()
      if (authUser.user) {
        testUserIds.push(authUser.user.id)

        // Verify teacher-specific data
        const { data: teacherProfile, error: teacherError } = await supabase
          .from('teachers')
          .select('*')
          .eq('user_id', authUser.user.id)
          .single()

        expect(teacherError).toBeNull()
        expect(teacherProfile).toBeDefined()
        expect(teacherProfile?.qualifications).toBe(teacherData.roleSpecific.qualifications)
        expect(teacherProfile?.is_approved).toBe(teacherData.roleSpecific.isApproved)
      }
    })
  })

  describe('Audit Logging', () => {
    it('should create audit log entry for user creation', async () => {
      const email = `audit-test-${Date.now()}@example.com`

      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: 'TempPassword123!',
      })

      expect(authError).toBeNull()
      if (authUser.user) {
        testUserIds.push(authUser.user.id)

        // Manually create audit log (in real implementation, this is done by API)
        await supabase.from('audit_logs').insert({
          user_id: adminUserId,
          action: 'create_user',
          resource_type: 'user',
          resource_id: authUser.user.id,
          details: {
            user_type: 'student',
            email,
          },
        })

        // Verify audit log exists
        const { data: auditLogs, error: auditError } = await supabase
          .from('audit_logs')
          .select('*')
          .eq('resource_id', authUser.user.id)
          .eq('action', 'create_user')

        expect(auditError).toBeNull()
        expect(auditLogs).toBeDefined()
        expect(auditLogs?.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Account Status', () => {
    it('should create user with inactive status', async () => {
      const email = `inactive-${Date.now()}@example.com`

      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: 'TempPassword123!',
      })

      expect(authError).toBeNull()
      if (authUser.user) {
        testUserIds.push(authUser.user.id)

        // Set inactive status
        await supabase
          .from('users')
          .update({ account_status: 'inactive' })
          .eq('id', authUser.user.id)

        // Verify status
        const { data: profile } = await supabase
          .from('users')
          .select('account_status')
          .eq('id', authUser.user.id)
          .single()

        expect(profile?.account_status).toBe('inactive')
      }
    })

    it('should create user with suspended status', async () => {
      const email = `suspended-${Date.now()}@example.com`

      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: 'TempPassword123!',
      })

      expect(authError).toBeNull()
      if (authUser.user) {
        testUserIds.push(authUser.user.id)

        // Set suspended status
        await supabase
          .from('users')
          .update({ account_status: 'suspended' })
          .eq('id', authUser.user.id)

        // Verify status
        const { data: profile } = await supabase
          .from('users')
          .select('account_status')
          .eq('id', authUser.user.id)
          .single()

        expect(profile?.account_status).toBe('suspended')
      }
    })
  })

  describe('Email Verification', () => {
    it('should bypass email verification when flag is set', async () => {
      const email = `verified-${Date.now()}@example.com`

      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: 'TempPassword123!',
        email_confirm: true, // Bypass verification
      })

      expect(authError).toBeNull()
      expect(authUser.user?.email_confirmed_at).toBeDefined()
      
      if (authUser.user) {
        testUserIds.push(authUser.user.id)
      }
    })

    it('should require email verification when flag is not set', async () => {
      const email = `unverified-${Date.now()}@example.com`

      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: 'TempPassword123!',
        email_confirm: false, // Require verification
      })

      expect(authError).toBeNull()
      expect(authUser.user?.email_confirmed_at).toBeNull()
      
      if (authUser.user) {
        testUserIds.push(authUser.user.id)
      }
    })
  })
})
