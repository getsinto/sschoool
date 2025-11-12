/**
 * Common Types and Interfaces
 * Shared utility types used across the application
 */

import { z } from 'zod'

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Standard API success response
 */
export interface ApiResponse<T = any> {
  success: true
  data: T
  message?: string
  meta?: ResponseMeta
}

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
  meta?: ResponseMeta
}

/**
 * Response metadata
 */
export interface ResponseMeta {
  timestamp: string
  request_id?: string
  version?: string
}

/**
 * Union type for all API responses
 */
export type ApiResult<T = any> = ApiResponse<T> | ApiErrorResponse

// ============================================================================
// PAGINATION TYPES
// ============================================================================

/**
 * Pagination parameters for list requests
 */
export interface PaginationParams {
  page: number
  page_size: number
  total?: number
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    page_size: number
    total_items: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
}

/**
 * Cursor-based pagination parameters
 */
export interface CursorPaginationParams {
  cursor?: string
  limit: number
}

/**
 * Cursor-based paginated response
 */
export interface CursorPaginatedResponse<T> {
  data: T[]
  pagination: {
    next_cursor: string | null
    has_more: boolean
    limit: number
  }
}

// ============================================================================
// FILTER TYPES
// ============================================================================

/**
 * Base filter options
 */
export interface FilterOptions {
  search?: string
  date_from?: string
  date_to?: string
  status?: string | string[]
  category?: string | string[]
}

/**
 * User filter options
 */
export interface UserFilterOptions extends FilterOptions {
  role?: string | string[]
  is_verified?: boolean
  is_active?: boolean
}

/**
 * Course filter options
 */
export interface CourseFilterOptions extends FilterOptions {
  category?: string | string[]
  difficulty?: string | string[]
  payment_model?: string | string[]
  price_min?: number
  price_max?: number
  is_published?: boolean
  created_by?: string
}

/**
 * Enrollment filter options
 */
export interface EnrollmentFilterOptions extends FilterOptions {
  student_id?: string
  course_id?: string
  status?: string | string[]
  completion_min?: number
  completion_max?: number
}

/**
 * Payment filter options
 */
export interface PaymentFilterOptions extends FilterOptions {
  user_id?: string
  course_id?: string
  status?: string | string[]
  payment_gateway?: string | string[]
  amount_min?: number
  amount_max?: number
}

// ============================================================================
// SORT TYPES
// ============================================================================

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc'

/**
 * Sort options
 */
export interface SortOptions {
  sort_by: string
  sort_direction: SortDirection
}

/**
 * Multiple sort options
 */
export interface MultiSortOptions {
  sorts: Array<{
    field: string
    direction: SortDirection
  }>
}

// ============================================================================
// QUERY TYPES
// ============================================================================

/**
 * Complete query parameters combining pagination, filters, and sorting
 */
export interface QueryParams extends PaginationParams, FilterOptions, SortOptions {}

/**
 * Search query parameters
 */
export interface SearchParams {
  query: string
  fields?: string[]
  limit?: number
  offset?: number
}

// ============================================================================
// FILE UPLOAD TYPES
// ============================================================================

/**
 * File upload response
 */
export interface FileUploadResponse {
  file_url: string
  file_name: string
  file_size: number
  file_type: string
  uploaded_at: string
}

/**
 * Multiple file upload response
 */
export interface MultiFileUploadResponse {
  files: FileUploadResponse[]
  total_size: number
}

/**
 * File upload progress
 */
export interface FileUploadProgress {
  file_name: string
  progress: number // 0-100
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
}

// ============================================================================
// DATE RANGE TYPES
// ============================================================================

/**
 * Date range
 */
export interface DateRange {
  start_date: string
  end_date: string
}

/**
 * Predefined date range options
 */
export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | 'last_7_days'
  | 'last_30_days'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'custom'

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Validation error
 */
export interface ValidationError {
  field: string
  message: string
  code?: string
}

/**
 * Validation result
 */
export interface ValidationResult {
  is_valid: boolean
  errors: ValidationError[]
}

// ============================================================================
// SELECTION TYPES
// ============================================================================

/**
 * Select option for dropdowns
 */
export interface SelectOption<T = string> {
  label: string
  value: T
  disabled?: boolean
  icon?: string
}

/**
 * Grouped select options
 */
export interface GroupedSelectOption<T = string> {
  label: string
  options: SelectOption<T>[]
}

// ============================================================================
// TABLE TYPES
// ============================================================================

/**
 * Table column definition
 */
export interface TableColumn<T = any> {
  key: string
  label: string
  sortable?: boolean
  filterable?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: T) => React.ReactNode
}

/**
 * Table action
 */
export interface TableAction<T = any> {
  label: string
  icon?: string
  onClick: (row: T) => void
  disabled?: (row: T) => boolean
  variant?: 'default' | 'danger' | 'success'
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

/**
 * Toast notification
 */
export interface ToastNotification {
  id?: string
  title?: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// ============================================================================
// BREADCRUMB TYPES
// ============================================================================

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: string
  current?: boolean
}

// ============================================================================
// STATISTICS TYPES
// ============================================================================

/**
 * Stat card data
 */
export interface StatCard {
  label: string
  value: string | number
  change?: number // percentage change
  change_type?: 'increase' | 'decrease'
  icon?: string
  color?: string
}

/**
 * Chart data point
 */
export interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

/**
 * Time series data point
 */
export interface TimeSeriesDataPoint {
  date: string
  value: number
  label?: string
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  page_size: z.number().min(1).max(100).default(20),
})

export const sortSchema = z.object({
  sort_by: z.string(),
  sort_direction: z.enum(['asc', 'desc']).default('asc'),
})

export const dateRangeSchema = z.object({
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
})

export const searchSchema = z.object({
  query: z.string().min(1),
  fields: z.array(z.string()).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
})

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Make specific properties required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * Make specific properties optional
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * Nullable type
 */
export type Nullable<T> = T | null

/**
 * Maybe type (nullable or undefined)
 */
export type Maybe<T> = T | null | undefined

/**
 * Extract array element type
 */
export type ArrayElement<T> = T extends (infer U)[] ? U : never

/**
 * Async function type
 */
export type AsyncFunction<T = any> = (...args: any[]) => Promise<T>

/**
 * ID type (UUID string)
 */
export type ID = string

/**
 * Timestamp type (ISO 8601 string)
 */
export type Timestamp = string

/**
 * URL type
 */
export type URL = string

/**
 * Email type
 */
export type Email = string

/**
 * Phone number type
 */
export type PhoneNumber = string

/**
 * Currency amount type
 */
export type CurrencyAmount = number

/**
 * Percentage type (0-100)
 */
export type Percentage = number
