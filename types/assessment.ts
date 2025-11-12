/**
 * Assessment Types and Interfaces
 * Comprehensive type definitions for quizzes, questions, assignments, and submissions
 */

import { z } from 'zod'

// ============================================================================
// ENUMS
// ============================================================================

export enum QuestionType {
  MCQ = 'mcq',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
}

export enum SubmissionType {
  FILE = 'file',
  TEXT = 'text',
  BOTH = 'both',
}

export enum SubmissionStatus {
  PENDING = 'pending',
  GRADED = 'graded',
  LATE = 'late',
}

// ============================================================================
// QUIZ INTERFACES
// ============================================================================

export interface Quiz {
  id: string
  lesson_id: string
  title: string
  description: string | null
  duration_minutes: number
  passing_score: number
  max_attempts: number
  allow_retake: boolean
  shuffle_questions: boolean
  created_at: string
  updated_at: string
}

/**
 * Quiz with questions
 */
export interface QuizWithQuestions extends Quiz {
  questions: QuizQuestion[]
}

// ============================================================================
// QUIZ QUESTION INTERFACES
// ============================================================================

/**
 * MCQ Option structure
 */
export interface MCQOption {
  id: string
  text: string
  is_correct?: boolean // Only included in teacher view
}

/**
 * Quiz question base interface
 */
export interface QuizQuestion {
  id: string
  quiz_id: string
  question_text: string
  question_type: QuestionType
  options: MCQOption[] | null // For MCQ questions
  correct_answer: string
  points: number
  explanation: string | null
  order_index: number
  created_at: string
}

/**
 * Quiz question for students (without correct answers)
 */
export type StudentQuizQuestion = Omit<QuizQuestion, 'correct_answer'> & {
  options: Omit<MCQOption, 'is_correct'>[] | null
}

// ============================================================================
// QUIZ ATTEMPT INTERFACES
// ============================================================================

/**
 * Student answer structure
 */
export interface QuizAnswer {
  question_id: string
  answer: string | string[] // string for text, array for MCQ
  time_spent_seconds?: number
}

export interface QuizAttempt {
  id: string
  quiz_id: string
  student_id: string
  answers: Record<string, QuizAnswer>
  score: number
  percentage: number
  passed: boolean
  attempt_number: number
  time_taken_seconds: number | null
  completed_at: string
  created_at: string
}

/**
 * Quiz attempt with quiz details
 */
export interface QuizAttemptWithQuiz extends QuizAttempt {
  quiz: Quiz
}

/**
 * Quiz attempt with detailed results
 */
export interface QuizAttemptWithResults extends QuizAttempt {
  quiz: QuizWithQuestions
  results: Array<{
    question: QuizQuestion
    student_answer: string | string[]
    is_correct: boolean
    points_earned: number
    explanation: string | null
  }>
}

// ============================================================================
// ASSIGNMENT INTERFACES
// ============================================================================

export interface Assignment {
  id: string
  lesson_id: string
  title: string
  instructions: string | null
  due_date: string | null
  max_points: number
  submission_type: SubmissionType
  allowed_file_types: string[]
  created_at: string
  updated_at: string
}

/**
 * Assignment with submission count
 */
export interface AssignmentWithStats extends Assignment {
  total_submissions: number
  graded_submissions: number
  pending_submissions: number
  avg_score: number | null
}

// ============================================================================
// ASSIGNMENT SUBMISSION INTERFACES
// ============================================================================

export interface AssignmentSubmission {
  id: string
  assignment_id: string
  student_id: string
  submission_file_url: string | null
  submission_text: string | null
  grade: number | null
  teacher_feedback: string | null
  status: SubmissionStatus
  submitted_at: string
  graded_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Assignment submission with assignment details
 */
export interface AssignmentSubmissionWithAssignment extends AssignmentSubmission {
  assignment: Assignment
}

/**
 * Assignment submission with student details
 */
export interface AssignmentSubmissionWithStudent extends AssignmentSubmission {
  student: {
    id: string
    user_id: string
    user: {
      full_name: string | null
      email: string
      profile_pic: string | null
    }
  }
}

// ============================================================================
// FORM TYPES (for creating/updating)
// ============================================================================

/**
 * Quiz creation form data
 */
export type CreateQuizInput = Omit<Quiz, 'id' | 'created_at' | 'updated_at'>

/**
 * Quiz update form data
 */
export type UpdateQuizInput = Partial<Omit<Quiz, 'id' | 'lesson_id' | 'created_at' | 'updated_at'>>

/**
 * Quiz question creation form data
 */
export type CreateQuizQuestionInput = Omit<QuizQuestion, 'id' | 'created_at'>

/**
 * Quiz question update form data
 */
export type UpdateQuizQuestionInput = Partial<Omit<QuizQuestion, 'id' | 'quiz_id' | 'created_at'>>

/**
 * Quiz attempt submission data
 */
export type SubmitQuizAttemptInput = {
  quiz_id: string
  student_id: string
  answers: Record<string, QuizAnswer>
  time_taken_seconds: number
}

/**
 * Assignment creation form data
 */
export type CreateAssignmentInput = Omit<Assignment, 'id' | 'created_at' | 'updated_at'>

/**
 * Assignment update form data
 */
export type UpdateAssignmentInput = Partial<
  Omit<Assignment, 'id' | 'lesson_id' | 'created_at' | 'updated_at'>
>

/**
 * Assignment submission creation data
 */
export type CreateAssignmentSubmissionInput = {
  assignment_id: string
  student_id: string
  submission_file_url?: string
  submission_text?: string
}

/**
 * Assignment grading data
 */
export type GradeAssignmentInput = {
  grade: number
  teacher_feedback?: string
}

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

export const quizSchema = z.object({
  lesson_id: z.string().uuid(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().nullable(),
  duration_minutes: z.number().min(1, 'Duration must be at least 1 minute').max(300),
  passing_score: z.number().min(0).max(100),
  max_attempts: z.number().min(1).max(10),
  allow_retake: z.boolean().default(true),
  shuffle_questions: z.boolean().default(false),
})

export const mcqOptionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Option text is required'),
  is_correct: z.boolean().optional(),
})

export const quizQuestionSchema = z.object({
  quiz_id: z.string().uuid(),
  question_text: z.string().min(5, 'Question must be at least 5 characters'),
  question_type: z.nativeEnum(QuestionType),
  options: z.array(mcqOptionSchema).nullable(),
  correct_answer: z.string().min(1, 'Correct answer is required'),
  points: z.number().min(0.5).max(100),
  explanation: z.string().nullable(),
  order_index: z.number().min(0),
})

export const quizAnswerSchema = z.object({
  question_id: z.string().uuid(),
  answer: z.union([z.string(), z.array(z.string())]),
  time_spent_seconds: z.number().optional(),
})

export const submitQuizAttemptSchema = z.object({
  quiz_id: z.string().uuid(),
  student_id: z.string().uuid(),
  answers: z.record(quizAnswerSchema),
  time_taken_seconds: z.number().min(0),
})

export const assignmentSchema = z.object({
  lesson_id: z.string().uuid(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  instructions: z.string().min(10, 'Instructions must be at least 10 characters').nullable(),
  due_date: z.string().nullable(),
  max_points: z.number().min(1).max(1000),
  submission_type: z.nativeEnum(SubmissionType),
  allowed_file_types: z.array(z.string()),
})

export const assignmentSubmissionSchema = z.object({
  assignment_id: z.string().uuid(),
  student_id: z.string().uuid(),
  submission_file_url: z.string().url().optional(),
  submission_text: z.string().optional(),
}).refine(
  (data) => data.submission_file_url || data.submission_text,
  {
    message: 'Either file or text submission is required',
  }
)

export const gradeAssignmentSchema = z.object({
  grade: z.number().min(0),
  teacher_feedback: z.string().max(1000).optional(),
})

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Quiz summary for student
 */
export interface QuizSummary {
  quiz_id: string
  title: string
  total_questions: number
  total_points: number
  duration_minutes: number
  passing_score: number
  attempts_taken: number
  max_attempts: number
  best_score: number | null
  best_percentage: number | null
  passed: boolean
  can_retake: boolean
}

/**
 * Assignment summary for student
 */
export interface AssignmentSummary {
  assignment_id: string
  title: string
  due_date: string | null
  max_points: number
  submission_status: SubmissionStatus | 'not_submitted'
  grade: number | null
  submitted_at: string | null
  is_late: boolean
  days_until_due: number | null
}

/**
 * Grading statistics
 */
export interface GradingStats {
  total_submissions: number
  graded_submissions: number
  pending_submissions: number
  avg_score: number
  highest_score: number
  lowest_score: number
  pass_rate: number
}

/**
 * Student assessment performance
 */
export interface StudentAssessmentPerformance {
  student_id: string
  total_quizzes: number
  completed_quizzes: number
  avg_quiz_score: number
  total_assignments: number
  submitted_assignments: number
  avg_assignment_score: number
  overall_grade: number
}

/**
 * Quiz leaderboard entry
 */
export interface QuizLeaderboardEntry {
  rank: number
  student_id: string
  student_name: string
  student_profile_pic: string | null
  score: number
  percentage: number
  time_taken_seconds: number
  completed_at: string
}
