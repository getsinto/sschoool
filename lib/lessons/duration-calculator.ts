/**
 * Duration calculation utilities for lessons and modules
 */

import { DurationCalculation, ReadingTimeCalculation } from '@/types/lesson'

/**
 * Calculate total duration from minutes
 */
export function calculateDuration(totalMinutes: number): DurationCalculation {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  let formatted = ''
  if (hours > 0) {
    formatted = `${hours} hour${hours > 1 ? 's' : ''}`
    if (minutes > 0) {
      formatted += ` ${minutes} minute${minutes > 1 ? 's' : ''}`
    }
  } else {
    formatted = `${minutes} minute${minutes > 1 ? 's' : ''}`
  }

  return {
    total_minutes: totalMinutes,
    hours,
    minutes,
    formatted
  }
}

/**
 * Calculate reading time from text content
 * Average reading speed: 200 words per minute
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 200): ReadingTimeCalculation {
  // Remove HTML tags if present
  const plainText = text.replace(/<[^>]*>/g, '')
  
  // Count words
  const words = plainText.trim().split(/\s+/)
  const wordCount = words.filter(word => word.length > 0).length
  
  // Calculate reading time
  const readingTimeMinutes = Math.ceil(wordCount / wordsPerMinute)
  
  let formatted = ''
  if (readingTimeMinutes < 1) {
    formatted = 'Less than 1 min read'
  } else if (readingTimeMinutes === 1) {
    formatted = '1 min read'
  } else {
    formatted = `${readingTimeMinutes} min read`
  }

  return {
    word_count: wordCount,
    reading_time_minutes: readingTimeMinutes,
    formatted
  }
}

/**
 * Estimate video duration from URL or file
 * This is a placeholder - actual implementation would need video metadata
 */
export function estimateVideoDuration(videoUrl: string): number {
  // TODO: Implement actual video duration extraction
  // For now, return a default value
  return 10 // 10 minutes default
}

/**
 * Estimate document reading time based on page count
 * Average: 2 minutes per page
 */
export function estimateDocumentDuration(pageCount: number, minutesPerPage: number = 2): number {
  return pageCount * minutesPerPage
}

/**
 * Calculate module duration from all lessons
 */
export function calculateModuleDuration(lessons: Array<{ duration_minutes?: number | null; estimated_duration?: number | null }>): number {
  return lessons.reduce((total, lesson) => {
    const duration = lesson.duration_minutes || lesson.estimated_duration || 0
    return total + duration
  }, 0)
}

/**
 * Calculate course duration from all modules
 */
export function calculateCourseDuration(modules: Array<{ duration_minutes?: number | null }>): number {
  return modules.reduce((total, module) => {
    return total + (module.duration_minutes || 0)
  }, 0)
}

/**
 * Format duration for display
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${remainingMinutes}m`
}

/**
 * Parse duration string to minutes
 * Supports formats: "1h 30m", "90m", "1.5h"
 */
export function parseDuration(durationString: string): number {
  const hourMatch = durationString.match(/(\d+(?:\.\d+)?)\s*h/)
  const minuteMatch = durationString.match(/(\d+)\s*m/)
  
  let totalMinutes = 0
  
  if (hourMatch) {
    totalMinutes += parseFloat(hourMatch[1]) * 60
  }
  
  if (minuteMatch) {
    totalMinutes += parseInt(minuteMatch[1])
  }
  
  return Math.round(totalMinutes)
}
