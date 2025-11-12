/**
 * Authentication & Authorization Type Definitions
 * Comprehensive types for auth system with Supabase
 */

import { User as SupabaseUser, Session } from '@supabase/supabase-js'

// ============================================================================
// USER & SESSION TYPES
// ============================================================================

export interface AuthUser extends SupabaseUser {
  role?: 'admin' | 'teacher' | 'student' | 'parent'
  full_name?: string
  profile_photo_url?: string
}

export interface AuthSession {
  user: AuthUser | null
  session: Session | null
  loading: boolean
}

// ============================================================================
// LOGIN & REGISTRATION
// ============================================================================

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  userType: 'student' | 'teacher' | 'parent' | 'spoken_english'
  termsAccepted: boolean
  privacyAccepted: boolean
}

// ============================================================================
// PASSWORD MANAGEMENT
// ============================================================================

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetData {
  password: string
  confirmPassword: string
  token: string
}

export interface PasswordUpdateData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// ============================================================================
// EMAIL VERIFICATION
// ============================================================================

export interface EmailVerification {
  token: string
  email: string
  expiresAt: Date
}

export interface ResendVerificationRequest {
  email: string
}

// ============================================================================
// ROLE-BASED ACCESS CONTROL
// ============================================================================

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent'

export interface RolePermissions {
  canRead: string[]
  canWrite: string[]
  canDelete: string[]
  canManage: string[]
}

export interface AccessControl {
  role: UserRole
  permissions: RolePermissions
  hasPermission: (action: string, resource: string) => boolean
}

// ============================================================================
// AUTH RESPONSES
// ============================================================================

export interface AuthResponse<T = any> {
  data?: T
  error?: AuthError | null
  success: boolean
}

export interface LoginResponse extends AuthResponse {
  data?: {
    user: AuthUser
    session: Session
    redirectUrl: string
  }
}

export interface RegisterResponse extends AuthResponse {
  data?: {
    userId: string
    userType: string
    requiresVerification: boolean
    requiresApproval: boolean
  }
}

// ============================================================================
// AUTH ERRORS
// ============================================================================

export interface AuthError {
  code: string
  message: string
  details?: any
}

export type AuthErrorCode =
  | 'invalid_credentials'
  | 'user_not_found'
  | 'email_already_exists'
  | 'weak_password'
  | 'invalid_token'
  | 'token_expired'
  | 'email_not_verified'
  | 'account_suspended'
  | 'account_pending_approval'
  | 'rate_limit_exceeded'
  | 'server_error'
  | 'unauthorized'

// ============================================================================
// AUTH HOOKS RETURN TYPES
// ============================================================================

export interface UseAuthReturn {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResponse>
  signUp: (email: string, password: string, metadata?: any) => Promise<AuthResponse>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<AuthResponse>
  updatePassword: (password: string) => Promise<AuthResponse>
  resendVerification: () => Promise<AuthResponse>
  refreshSession: () => Promise<void>
}

export interface UseUserReturn {
  user: AuthUser | null
  profile: any | null
  teacherProfile: any | null
  studentProfile: any | null
  parentProfile: any | null
  loading: boolean
  error: string | null
  updateProfile: (data: any) => Promise<{ data: any; error: string | null }>
  updateTeacherProfile: (data: any) => Promise<{ data: any; error: string | null }>
  updateStudentProfile: (data: any) => Promise<{ data: any; error: string | null }>
  updateParentProfile: (data: any) => Promise<{ data: any; error: string | null }>
  getDashboardUrl: () => string
  isEmailVerified: () => boolean
  isProfileComplete: () => boolean
  needsApproval: () => boolean
}

// ============================================================================
// SOCIAL AUTH
// ============================================================================

export type SocialProvider = 'google' | 'facebook' | 'github' | 'twitter'

export interface SocialAuthOptions {
  provider: SocialProvider
  redirectTo?: string
  scopes?: string
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

export interface SessionData {
  userId: string
  email: string
  role: UserRole
  expiresAt: Date
  refreshToken?: string
}

export interface SessionOptions {
  maxAge?: number
  persistent?: boolean
  secure?: boolean
}

// ============================================================================
// RATE LIMITING
// ============================================================================

export interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
  blockDurationMs?: number
}

export interface RateLimitStatus {
  remaining: number
  resetAt: Date
  blocked: boolean
}

// ============================================================================
// AUTH MIDDLEWARE
// ============================================================================

export interface AuthMiddlewareOptions {
  requireAuth?: boolean
  requireRole?: UserRole | UserRole[]
  requireEmailVerification?: boolean
  requireApproval?: boolean
  redirectTo?: string
}

export interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  requireEmailVerification?: boolean
  requireApproval?: boolean
  fallback?: React.ReactNode
}

// ============================================================================
// AUTH EVENTS
// ============================================================================

export type AuthEvent =
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'USER_UPDATED'
  | 'PASSWORD_RECOVERY'
  | 'TOKEN_REFRESHED'
  | 'USER_DELETED'

export interface AuthEventHandler {
  (event: AuthEvent, session: Session | null): void | Promise<void>
}

// ============================================================================
// ACCOUNT STATUS
// ============================================================================

export type AccountStatus =
  | 'active'
  | 'pending_verification'
  | 'pending_approval'
  | 'suspended'
  | 'deleted'

export interface AccountStatusInfo {
  status: AccountStatus
  reason?: string
  canLogin: boolean
  requiresAction: boolean
  actionMessage?: string
}

// ============================================================================
// TWO-FACTOR AUTHENTICATION (Future Enhancement)
// ============================================================================

export interface TwoFactorSetup {
  secret: string
  qrCode: string
  backupCodes: string[]
}

export interface TwoFactorVerification {
  code: string
  rememberDevice?: boolean
}

// ============================================================================
// AUDIT LOG
// ============================================================================

export interface AuthAuditLog {
  id: string
  userId: string
  action: string
  ipAddress?: string
  userAgent?: string
  success: boolean
  errorMessage?: string
  timestamp: Date
}

// ============================================================================
// VALIDATION SCHEMAS (Zod compatible)
// ============================================================================

export interface ValidationSchema {
  email: RegExp
  password: {
    minLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumber: boolean
    requireSpecialChar: boolean
  }
}

export const AUTH_VALIDATION: ValidationSchema = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: false,
  },
}

// ============================================================================
// CONSTANTS
// ============================================================================

export const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  PENDING_APPROVAL: '/auth/pending-approval',
  ACCOUNT_SUSPENDED: '/auth/account-suspended',
} as const

export const DASHBOARD_ROUTES: Record<UserRole, string> = {
  admin: '/admin',
  teacher: '/teacher',
  student: '/student',
  parent: '/parent',
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 4,
  teacher: 3,
  parent: 2,
  student: 1,
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type AuthLoadingState =
  | 'idle'
  | 'signing_in'
  | 'signing_up'
  | 'signing_out'
  | 'resetting_password'
  | 'verifying_email'
  | 'refreshing_session'

export type AuthAction =
  | { type: 'SIGN_IN_START' }
  | { type: 'SIGN_IN_SUCCESS'; payload: { user: AuthUser; session: Session } }
  | { type: 'SIGN_IN_ERROR'; payload: { error: AuthError } }
  | { type: 'SIGN_OUT' }
  | { type: 'UPDATE_USER'; payload: { user: AuthUser } }
  | { type: 'SET_LOADING'; payload: { loading: boolean } }
