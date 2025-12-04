/**
 * Lesson completion tracking utilities
 */

import { CompletionRequirement, LessonCompletionStatus, ModuleProgress } from '@/types/lesson'
import { createClient } from '@/lib/supabase/server'

/**
 * Check if a lesson is completed based on its completion requirement
 */
export async function checkLessonCompletion(
  lessonId: string,
  userId: string,
  completionRequirement: CompletionRequirement,
  progressData?: {
    videoWatchPercentage?: number
    documentRead?: boolean
    quizPassed?: boolean
    assignmentSubmitted?: boolean
  }
): Promise<boolean> {
  const supabase = createClient()

  switch (completionRequirement) {
    case 'manual':
      // Check if user manually marked as complete
      const { data: manualCompletion } = await supabase
        .from('lesson_progress')
        .select('is_completed')
        .eq('lesson_id', lessonId)
        .eq('user_id', userId)
        .single()
      
      return manualCompletion?.is_completed || false

    case 'auto_video_80':
      // Check if video watched 80% or more
      return (progressData?.videoWatchPercentage || 0) >= 80

    case 'auto_document':
      // Check if document was read
      return progressData?.documentRead || false

    case 'quiz_pass':
      // Check if quiz was passed
      return progressData?.quizPassed || false

    case 'assignment_submit':
      // Check if assignment was submitted
      return progressData?.assignmentSubmitted || false

    default:
      return false
  }
}

/**
 * Mark a lesson as completed
 */
export async function markLessonComplete(
  lessonId: string,
  userId: string,
  timeSpentMinutes?: number
): Promise<LessonCompletionStatus> {
  const supabase = createClient()

  const completionData = {
    lesson_id: lessonId,
    user_id: userId,
    is_completed: true,
    progress_percentage: 100,
    completed_at: new Date().toISOString(),
    time_spent_minutes: timeSpentMinutes || 0
  }

  const { data, error } = await supabase
    .from('lesson_progress')
    .upsert(completionData, {
      onConflict: 'lesson_id,user_id'
    })
    .select()
    .single()

  if (error) throw error

  return data as LessonCompletionStatus
}

/**
 * Update lesson progress
 */
export async function updateLessonProgress(
  lessonId: string,
  userId: string,
  progressPercentage: number,
  timeSpentMinutes?: number
): Promise<void> {
  const supabase = createClient()

  const progressData = {
    lesson_id: lessonId,
    user_id: userId,
    progress_percentage: Math.min(progressPercentage, 100),
    time_spent_minutes: timeSpentMinutes || 0,
    is_completed: progressPercentage >= 100
  }

  if (progressPercentage >= 100) {
    progressData['completed_at'] = new Date().toISOString()
  }

  await supabase
    .from('lesson_progress')
    .upsert(progressData, {
      onConflict: 'lesson_id,user_id'
    })
}

/**
 * Get lesson completion status
 */
export async function getLessonCompletionStatus(
  lessonId: string,
  userId: string
): Promise<LessonCompletionStatus | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('lesson_id', lessonId)
    .eq('user_id', userId)
    .single()

  if (error) return null

  return data as LessonCompletionStatus
}

/**
 * Calculate module progress for a user
 */
export async function calculateModuleProgress(
  moduleId: string,
  userId: string
): Promise<ModuleProgress> {
  const supabase = createClient()

  // Get all lessons in the module
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, duration_minutes, estimated_duration')
    .eq('module_id', moduleId)

  if (!lessons || lessons.length === 0) {
    return {
      module_id: moduleId,
      total_lessons: 0,
      completed_lessons: 0,
      progress_percentage: 0,
      estimated_time_remaining_minutes: 0
    }
  }

  // Get completion status for all lessons
  const { data: completions } = await supabase
    .from('lesson_progress')
    .select('lesson_id, is_completed')
    .in('lesson_id', lessons.map(l => l.id))
    .eq('user_id', userId)

  const completedLessons = completions?.filter(c => c.is_completed).length || 0
  const totalLessons = lessons.length
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0

  // Calculate remaining time
  const completedLessonIds = new Set(completions?.filter(c => c.is_completed).map(c => c.lesson_id) || [])
  const remainingLessons = lessons.filter(l => !completedLessonIds.has(l.id))
  const estimatedTimeRemaining = remainingLessons.reduce((total, lesson) => {
    return total + (lesson.duration_minutes || lesson.estimated_duration || 0)
  }, 0)

  return {
    module_id: moduleId,
    total_lessons: totalLessons,
    completed_lessons: completedLessons,
    progress_percentage: progressPercentage,
    estimated_time_remaining_minutes: estimatedTimeRemaining
  }
}

/**
 * Check if module prerequisites are met
 */
export async function checkModulePrerequisites(
  moduleId: string,
  userId: string
): Promise<{ met: boolean; missingPrerequisites: string[] }> {
  const supabase = createClient()

  // Get module with prerequisites
  const { data: module } = await supabase
    .from('modules')
    .select('prerequisites')
    .eq('id', moduleId)
    .single()

  if (!module || !module.prerequisites || module.prerequisites.length === 0) {
    return { met: true, missingPrerequisites: [] }
  }

  // Check completion of each prerequisite module
  const missingPrerequisites: string[] = []

  for (const prereqId of module.prerequisites) {
    const progress = await calculateModuleProgress(prereqId, userId)
    if (progress.progress_percentage < 100) {
      missingPrerequisites.push(prereqId)
    }
  }

  return {
    met: missingPrerequisites.length === 0,
    missingPrerequisites
  }
}

/**
 * Get next incomplete lesson in a module
 */
export async function getNextIncompleteLesson(
  moduleId: string,
  userId: string
): Promise<string | null> {
  const supabase = createClient()

  // Get all lessons in order
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id')
    .eq('module_id', moduleId)
    .order('order_index', { ascending: true })

  if (!lessons || lessons.length === 0) return null

  // Check each lesson for completion
  for (const lesson of lessons) {
    const status = await getLessonCompletionStatus(lesson.id, userId)
    if (!status || !status.is_completed) {
      return lesson.id
    }
  }

  return null // All lessons completed
}
