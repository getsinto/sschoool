/**
 * Validation schemas for course creation and updates
 */

import { z } from 'zod'
import { 
  AVAILABLE_LANGUAGES, 
  AGE_GROUPS, 
  STUDENT_TYPES,
  DIFFICULTY_LEVELS,
  HIGHLIGHT_ICONS
} from '@/types/course'

/**
 * Course highlight validation schema
 */
export const courseHighlightSchema = z.object({
  text: z.string()
    .min(1, 'Highlight text is required')
    .max(100, 'Highlight text must be 100 characters or less'),
  icon: z.enum(HIGHLIGHT_ICONS).optional()
})

/**
 * Enhanced course basic info validation schema
 */
export const enhancedCourseBasicInfoSchema = z.object({
  // Existing fields
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be 200 characters or less'),
  
  description: z.string()
    .min(50, 'Description must be at least 50 characters')
    .max(5000, 'Description must be 5000 characters or less'),
  
  category: z.string()
    .min(1, 'Category is required'),
  
  grade_level: z.string()
    .min(1, 'Grade level is required'),
  
  subject: z.string()
    .min(1, 'Subject is required'),
  
  thumbnail_url: z.string()
    .url('Invalid thumbnail URL')
    .nullable(),
  
  intro_video_url: z.string()
    .url('Invalid video URL')
    .optional()
    .or(z.literal('')),
  
  difficulty: z.enum(DIFFICULTY_LEVELS, {
    errorMap: () => ({ message: 'Please select a difficulty level' })
  }),
  
  learning_objectives: z.array(z.string().min(1))
    .min(1, 'At least one learning objective is required')
    .max(15, 'Maximum 15 learning objectives allowed'),
  
  prerequisites: z.array(z.string().min(1))
    .max(10, 'Maximum 10 prerequisites allowed')
    .optional()
    .default([]),
  
  // New fields
  subtitle: z.string()
    .min(10, 'Subtitle must be at least 10 characters')
    .max(150, 'Subtitle must be 150 characters or less'),
  
  language: z.enum([...AVAILABLE_LANGUAGES, ''] as any, {
    errorMap: () => ({ message: 'Please select a language' })
  }).refine(val => val !== '', 'Language is required'),
  
  age_groups: z.array(z.enum(AGE_GROUPS))
    .min(1, 'At least one age group must be selected')
    .max(6, 'Maximum 6 age groups can be selected'),
  
  student_types: z.array(z.enum(STUDENT_TYPES))
    .min(1, 'At least one student type must be selected')
    .max(3, 'Maximum 3 student types can be selected'),
  
  highlights: z.array(courseHighlightSchema)
    .min(3, 'At least 3 course highlights are required')
    .max(10, 'Maximum 10 course highlights allowed'),
  
  outcomes: z.array(z.string().min(1))
    .min(3, 'At least 3 course outcomes are required')
    .max(8, 'Maximum 8 course outcomes allowed')
})

/**
 * Category creation validation schema
 */
export const categoryCreationSchema = z.object({
  name: z.string()
    .min(2, 'Category name must be at least 2 characters')
    .max(50, 'Category name must be 50 characters or less')
    .regex(/^[a-zA-Z0-9\s-]+$/, 'Category name can only contain letters, numbers, spaces, and hyphens'),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .or(z.literal('')),
  
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code (e.g., #3B82F6)')
    .default('#3B82F6'),
  
  icon: z.instanceof(File)
    .refine(file => file.size <= 1024 * 1024, 'Icon file must be less than 1MB')
    .refine(
      file => ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'].includes(file.type),
      'Icon must be a JPEG, PNG, SVG, or WebP image'
    )
    .nullable()
    .optional()
})

/**
 * Category update validation schema
 */
export const categoryUpdateSchema = z.object({
  name: z.string()
    .min(2, 'Category name must be at least 2 characters')
    .max(50, 'Category name must be 50 characters or less')
    .regex(/^[a-zA-Z0-9\s-]+$/, 'Category name can only contain letters, numbers, spaces, and hyphens')
    .optional(),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be 500 characters or less')
    .optional(),
  
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code (e.g., #3B82F6)')
    .optional(),
  
  icon: z.instanceof(File)
    .refine(file => file.size <= 1024 * 1024, 'Icon file must be less than 1MB')
    .refine(
      file => ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'].includes(file.type),
      'Icon must be a JPEG, PNG, SVG, or WebP image'
    )
    .nullable()
    .optional(),
  
  display_order: z.number()
    .int()
    .min(0)
    .optional()
})

/**
 * Type exports for use in components
 */
export type EnhancedCourseBasicInfo = z.infer<typeof enhancedCourseBasicInfoSchema>
export type CategoryCreation = z.infer<typeof categoryCreationSchema>
export type CategoryUpdate = z.infer<typeof categoryUpdateSchema>
export type CourseHighlight = z.infer<typeof courseHighlightSchema>
