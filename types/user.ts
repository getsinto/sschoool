/**
 * User Types and Interfaces
 * Comprehensive type definitions for users, teachers, students, and parents
 */

import { z } from 'zod'

// ============================================================================
// ENUMS
// ============================================================================

export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
  PARENT = 'parent',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum StudentType {
  ONLINE_SCHOOL = 'online_school',
  SPOKEN_ENGLISH = 'spoken_english',
}

export enum EnglishLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum ParentRelationship {
  FATHER = 'father',
  MOTHER = 'mother',
  GUARDIAN = 'guardian',
  OTHER = 'other',
}

export enum AccountStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
}

// ============================================================================
// BASE USER INTERFACE
// ============================================================================

/**
 * Base user interface with all common fields
 */
export interface User {
  id: string
  email: string
  role: UserRole
  full_name: string | null
  last_name: string | null
  date_of_birth: string | null
  gender: Gender | null
  mobile: string | null
  whatsapp: string | null
  country: string | null
  state: string | null
  city: string | null
  address: string | null
  postal_code: string | null
  id_card_type: string | null
  id_card_url: string | null
  profile_pic: string | null
  is_verified: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

// ============================================================================
// TEACHER INTERFACE
// ============================================================================

export interface Teacher {
  id: string
  user_id: string
  qualifications: string | null
  field_of_study: string | null
  experience_years: number
  subjects: string[]
  bio: string | null
  resume_url: string | null
  is_approved: boolean
  approval_date: string | null
  created_at: string
  updated_at: string
}

/**
 * Teacher with user details populated
 */
export interface TeacherWithUser extends Teacher {
  user: User
}

// ============================================================================
// STUDENT INTERFACE
// ============================================================================

export interface Student {
  id: string
  user_id: string
  student_type: StudentType
  previous_school: string | null
  grade_level: string | null
  academic_year: string | null
  english_level: EnglishLevel | null
  purpose: string | null
  learning_schedule: string[]
  parent_id: string | null
  enrollment_date: string
  created_at: string
  updated_at: string
}

/**
 * Student with user details populated
 */
export interface StudentWithUser extends Student {
  user: User
  parent?: ParentWithUser
}

// ============================================================================
// PARENT INTERFACE
// ============================================================================

export interface Parent {
  id: string
  user_id: string
  relationship: ParentRelationship | null
  occupation: string | null
  linked_students: string[]
  created_at: string
  updated_at: string
}

/**
 * Parent with user details populated
 */
export interface ParentWithUser extends Parent {
  user: User
  students?: StudentWithUser[]
}

// ============================================================================
// FORM TYPES (for creating/updating)
// ============================================================================

/**
 * User creation form data
 */
export type CreateUserInput = Omit<User, 'id' | 'created_at' | 'updated_at' | 'is_verified' | 'is_active'> & {
  password: string
}

/**
 * User update form data
 */
export type UpdateUserInput = Partial<Omit<User, 'id' | 'email' | 'role' | 'created_at' | 'updated_at'>>

/**
 * Teacher creation form data
 */
export type CreateTeacherInput = Omit<Teacher, 'id' | 'user_id' | 'is_approved' | 'approval_date' | 'created_at' | 'updated_at'>

/**
 * Teacher update form data
 */
export type UpdateTeacherInput = Partial<Omit<Teacher, 'id' | 'user_id' | 'created_at' | 'updated_at'>>

/**
 * Student creation form data
 */
export type CreateStudentInput = Omit<Student, 'id' | 'user_id' | 'enrollment_date' | 'created_at' | 'updated_at'>

/**
 * Student update form data
 */
export type UpdateStudentInput = Partial<Omit<Student, 'id' | 'user_id' | 'created_at' | 'updated_at'>>

/**
 * Parent creation form data
 */
export type CreateParentInput = Omit<Parent, 'id' | 'user_id' | 'created_at' | 'updated_at'>

/**
 * Parent update form data
 */
export type UpdateParentInput = Partial<Omit<Parent, 'id' | 'user_id' | 'created_at' | 'updated_at'>>

// ============================================================================
// PROFILE TYPES
// ============================================================================

/**
 * Complete user profile with role-specific data
 */
export type UserProfile = User & {
  teacher?: Teacher
  student?: Student
  parent?: Parent
}

/**
 * Public user profile (limited information)
 */
export type PublicUserProfile = Pick<User, 'id' | 'full_name' | 'last_name' | 'profile_pic' | 'role'>

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.nativeEnum(UserRole),
  full_name: z.string().min(2, 'Name must be at least 2 characters').nullable(),
  last_name: z.string().min(2, 'Last name must be at least 2 characters').nullable(),
  date_of_birth: z.string().nullable(),
  gender: z.nativeEnum(Gender).nullable(),
  mobile: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').nullable(),
  whatsapp: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid WhatsApp number').nullable(),
  country: z.string().min(2).nullable(),
  state: z.string().nullable(),
  city: z.string().nullable(),
  address: z.string().nullable(),
  postal_code: z.string().nullable(),
  id_card_type: z.string().nullable(),
  profile_pic: z.string().url().nullable(),
})

export const createUserSchema = userSchema.extend({
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const updateUserSchema = userSchema.partial()

export const teacherSchema = z.object({
  qualifications: z.string().min(10, 'Please provide detailed qualifications').nullable(),
  field_of_study: z.string().min(2).nullable(),
  experience_years: z.number().min(0).max(50),
  subjects: z.array(z.string()).min(1, 'At least one subject is required'),
  bio: z.string().max(1000, 'Bio must be less than 1000 characters').nullable(),
  resume_url: z.string().url().nullable(),
})

export const studentSchema = z.object({
  student_type: z.nativeEnum(StudentType),
  previous_school: z.string().nullable(),
  grade_level: z.string().nullable(),
  academic_year: z.string().nullable(),
  english_level: z.nativeEnum(EnglishLevel).nullable(),
  purpose: z.string().nullable(),
  learning_schedule: z.array(z.string()),
  parent_id: z.string().uuid().nullable(),
})

export const parentSchema = z.object({
  relationship: z.nativeEnum(ParentRelationship).nullable(),
  occupation: z.string().nullable(),
  linked_students: z.array(z.string().uuid()),
})

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * User list item for tables/lists
 */
export type UserListItem = Pick<User, 'id' | 'email' | 'full_name' | 'last_name' | 'role' | 'is_verified' | 'is_active' | 'created_at'>

/**
 * User search result
 */
export interface UserSearchResult {
  id: string
  email: string
  full_name: string | null
  last_name: string | null
  role: UserRole
  profile_pic: string | null
}

/**
 * User statistics
 */
export interface UserStats {
  total_users: number
  active_users: number
  verified_users: number
  by_role: {
    admin: number
    teacher: number
    student: number
    parent: number
  }
  recent_signups: number
}
