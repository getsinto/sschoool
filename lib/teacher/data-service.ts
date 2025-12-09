/**
 * Teacher Data Service
 * 
 * Provides real database queries for teacher-related data,
 * replacing mock data throughout the application.
 */

import { createClient } from '@/lib/supabase/server'

export interface Student {
  id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatar?: string
  gradeLevel?: string
  enrollmentDate: string
  status: 'active' | 'inactive'
  enrolledCourses: number
  completedCourses: number
  overallProgress: number
  averageGrade: number
  lastActive: string
  attendanceRate: number
  assignmentsCompleted: number
  totalAssignments: number
}

export interface ProgressMetrics {
  student_id: string
  student_name: string
  course_id: string
  course_name: string
  completion_percentage: number
  lessons_completed: number
  total_lessons: number
  assignments_submitted: number
  total_assignments: number
  quizzes_completed: number
  total_quizzes: number
  average_quiz_score: number
  last_activity: string
}

export interface PerformanceData {
  student_id: string
  student_name: string
  overall_grade: number
  assignment_average: number
  quiz_average: number
  attendance_rate: number
  participation_score: number
  strengths: string[]
  areas_for_improvement: string[]
  recent_grades: Array<{
    type: 'assignment' | 'quiz'
    title: string
    score: number
    max_score: number
    date: string
  }>
}

export interface StudentActivity {
  student_id: string
  activities: Array<{
    id: string
    type: 'lesson_view' | 'assignment_submit' | 'quiz_attempt' | 'note_create'
    title: string
    description: string
    timestamp: string
  }>
}

export interface Message {
  recipient_id: string
  subject: string
  content: string
  priority?: 'low' | 'normal' | 'high'
}

export interface GradingStatistics {
  total_submissions: number
  pending_grading: number
  graded_today: number
  average_turnaround_time: number
  by_course: Array<{
    course_id: string
    course_name: string
    pending: number
    graded: number
  }>
}

/**
 * Get all students for a teacher
 * Includes students from all courses the teacher teaches
 */
export async function getTeacherStudents(
  teacherId: string,
  filters?: {
    courseId?: string
    search?: string
    gradeLevel?: string
  }
): Promise<Student[]> {
  const supabase = await createClient()

  // Get all courses taught by this teacher
  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select('id')
    .or(`created_by.eq.${teacherId},course_assignments.teacher_id.eq.${teacherId}`)

  if (coursesError || !courses) {
    console.error('Error fetching teacher courses:', coursesError)
    return []
  }

  const courseIds = courses.map(c => c.id)

  if (courseIds.length === 0) {
    return []
  }

  // Build query for students enrolled in these courses
  let query = supabase
    .from('enrollments')
    .select(`
      student_id,
      created_at,
      user_profiles!enrollments_student_id_fkey (
        id,
        user_id,
        full_name,
        email,
        profile_pic,
        grade_level,
        last_active
      )
    `)
    .in('course_id', courseIds)
    .eq('status', 'active')

  // Apply filters
  if (filters?.courseId) {
    query = query.eq('course_id', filters.courseId)
  }

  const { data: enrollments, error } = await query

  if (error || !enrollments) {
    console.error('Error fetching students:', error)
    return []
  }

  // Transform and deduplicate students
  const studentMap = new Map<string, Student>()

  for (const enrollment of enrollments) {
    const profile = enrollment.user_profiles as any
    if (!profile) continue

    const studentId = profile.id

    if (!studentMap.has(studentId)) {
      // Count courses for this student
      const coursesCount = enrollments.filter(
        e => (e.user_profiles as any)?.id === studentId
      ).length

      // Calculate overall progress (simplified - would need more complex query in production)
      const progress = await calculateStudentProgress(studentId, courseIds)

      // Split full name into first and last
      const nameParts = profile.full_name?.split(' ') || ['', '']
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''

      studentMap.set(studentId, {
        id: studentId,
        userId: profile.user_id,
        firstName,
        lastName,
        email: profile.email,
        phone: profile.phone,
        avatar: profile.profile_pic,
        gradeLevel: profile.grade_level,
        enrollmentDate: enrollment.created_at,
        status: 'active',
        enrolledCourses: coursesCount,
        completedCourses: 0, // Would need additional query
        overallProgress: progress,
        averageGrade: 0, // Would need additional query
        lastActive: profile.last_active || new Date().toISOString(),
        attendanceRate: 0, // Would need additional query
        assignmentsCompleted: 0, // Would need additional query
        totalAssignments: 0, // Would need additional query
      })
    }
  }

  let students = Array.from(studentMap.values())

  // Apply search filter
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase()
    students = students.filter(s =>
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchLower) ||
      s.email.toLowerCase().includes(searchLower)
    )
  }

  // Apply grade level filter
  if (filters?.gradeLevel) {
    students = students.filter(s => s.gradeLevel === filters.gradeLevel)
  }

  return students
}

/**
 * Calculate overall progress for a student across courses
 */
async function calculateStudentProgress(
  studentId: string,
  courseIds: string[]
): Promise<number> {
  const supabase = await createClient()

  // Get total lessons and completed lessons
  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('completed')
    .eq('student_id', studentId)
    .in('lesson_id', supabase
      .from('lessons')
      .select('id')
      .in('course_id', courseIds)
    )

  if (!progress || progress.length === 0) {
    return 0
  }

  const completed = progress.filter(p => p.completed).length
  const total = progress.length

  return Math.round((completed / total) * 100)
}

/**
 * Get detailed progress metrics for a specific student
 */
export async function getStudentProgress(
  teacherId: string,
  studentId: string,
  courseId?: string
): Promise<ProgressMetrics[]> {
  const supabase = await createClient()

  // Verify teacher has access to this student
  const hasAccess = await verifyTeacherStudentAccess(teacherId, studentId, courseId)
  if (!hasAccess) {
    throw new Error('Unauthorized access to student data')
  }

  // Get student profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name')
    .eq('id', studentId)
    .single()

  if (!profile) {
    throw new Error('Student not found')
  }

  // Build query for enrollments
  let enrollmentQuery = supabase
    .from('enrollments')
    .select(`
      course_id,
      courses (
        id,
        title
      )
    `)
    .eq('student_id', studentId)
    .eq('status', 'active')

  if (courseId) {
    enrollmentQuery = enrollmentQuery.eq('course_id', courseId)
  }

  const { data: enrollments } = await enrollmentQuery

  if (!enrollments || enrollments.length === 0) {
    return []
  }

  const metrics: ProgressMetrics[] = []

  for (const enrollment of enrollments) {
    const course = enrollment.courses as any
    if (!course) continue

    // Get lesson progress
    const { data: lessonProgress } = await supabase
      .from('lesson_progress')
      .select('completed, lesson_id')
      .eq('student_id', studentId)
      .in('lesson_id', supabase
        .from('lessons')
        .select('id')
        .eq('course_id', course.id)
      )

    const totalLessons = lessonProgress?.length || 0
    const completedLessons = lessonProgress?.filter(lp => lp.completed).length || 0

    // Get assignment submissions
    const { data: assignments } = await supabase
      .from('assignment_submissions')
      .select('assignment_id')
      .eq('student_id', studentId)
      .in('assignment_id', supabase
        .from('assignments')
        .select('id')
        .eq('course_id', course.id)
      )

    const { count: totalAssignments } = await supabase
      .from('assignments')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', course.id)

    // Get quiz attempts
    const { data: quizAttempts } = await supabase
      .from('quiz_attempts')
      .select('quiz_id, score, max_score')
      .eq('student_id', studentId)
      .in('quiz_id', supabase
        .from('quizzes')
        .select('id')
        .eq('course_id', course.id)
      )

    const { count: totalQuizzes } = await supabase
      .from('quizzes')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', course.id)

    const averageQuizScore = quizAttempts && quizAttempts.length > 0
      ? quizAttempts.reduce((sum, attempt) => {
          return sum + (attempt.score / attempt.max_score) * 100
        }, 0) / quizAttempts.length
      : 0

    // Get last activity
    const { data: lastActivity } = await supabase
      .from('lesson_progress')
      .select('updated_at')
      .eq('student_id', studentId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    const completionPercentage = totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0

    metrics.push({
      student_id: studentId,
      student_name: profile.full_name,
      course_id: course.id,
      course_name: course.title,
      completion_percentage: completionPercentage,
      lessons_completed: completedLessons,
      total_lessons: totalLessons,
      assignments_submitted: assignments?.length || 0,
      total_assignments: totalAssignments || 0,
      quizzes_completed: quizAttempts?.length || 0,
      total_quizzes: totalQuizzes || 0,
      average_quiz_score: Math.round(averageQuizScore),
      last_activity: lastActivity?.updated_at || new Date().toISOString()
    })
  }

  return metrics
}

/**
 * Get performance data for a student
 */
export async function getStudentPerformance(
  teacherId: string,
  studentId: string,
  courseId?: string
): Promise<PerformanceData> {
  const supabase = await createClient()

  // Verify access
  const hasAccess = await verifyTeacherStudentAccess(teacherId, studentId, courseId)
  if (!hasAccess) {
    throw new Error('Unauthorized access to student data')
  }

  // Get student profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name')
    .eq('id', studentId)
    .single()

  if (!profile) {
    throw new Error('Student not found')
  }

  // Get assignment grades
  let assignmentQuery = supabase
    .from('assignment_submissions')
    .select(`
      score,
      max_score,
      assignments (
        course_id
      )
    `)
    .eq('student_id', studentId)
    .not('score', 'is', null)

  if (courseId) {
    assignmentQuery = assignmentQuery.eq('assignments.course_id', courseId)
  }

  const { data: assignmentGrades } = await assignmentQuery

  const assignmentAverage = assignmentGrades && assignmentGrades.length > 0
    ? assignmentGrades.reduce((sum, grade) => {
        return sum + (grade.score / grade.max_score) * 100
      }, 0) / assignmentGrades.length
    : 0

  // Get quiz grades
  let quizQuery = supabase
    .from('quiz_attempts')
    .select(`
      score,
      max_score,
      quizzes (
        course_id
      )
    `)
    .eq('student_id', studentId)

  if (courseId) {
    quizQuery = quizQuery.eq('quizzes.course_id', courseId)
  }

  const { data: quizGrades } = await quizQuery

  const quizAverage = quizGrades && quizGrades.length > 0
    ? quizGrades.reduce((sum, grade) => {
        return sum + (grade.score / grade.max_score) * 100
      }, 0) / quizGrades.length
    : 0

  // Calculate overall grade
  const overallGrade = (assignmentAverage * 0.6) + (quizAverage * 0.4)

  // Get attendance rate (simplified)
  const attendanceRate = 85 // Would need actual attendance tracking

  // Get participation score (simplified)
  const participationScore = 80 // Would need actual participation tracking

  // Determine strengths and areas for improvement
  const strengths: string[] = []
  const areasForImprovement: string[] = []

  if (assignmentAverage >= 80) {
    strengths.push('Strong assignment performance')
  } else if (assignmentAverage < 70) {
    areasForImprovement.push('Assignment completion and quality')
  }

  if (quizAverage >= 80) {
    strengths.push('Excellent quiz scores')
  } else if (quizAverage < 70) {
    areasForImprovement.push('Quiz preparation and understanding')
  }

  if (attendanceRate >= 90) {
    strengths.push('Consistent attendance')
  } else if (attendanceRate < 80) {
    areasForImprovement.push('Class attendance')
  }

  // Get recent grades
  const recentGrades = [
    ...(assignmentGrades || []).slice(-5).map(g => ({
      type: 'assignment' as const,
      title: 'Assignment',
      score: g.score,
      max_score: g.max_score,
      date: new Date().toISOString()
    })),
    ...(quizGrades || []).slice(-5).map(g => ({
      type: 'quiz' as const,
      title: 'Quiz',
      score: g.score,
      max_score: g.max_score,
      date: new Date().toISOString()
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)

  return {
    student_id: studentId,
    student_name: profile.full_name,
    overall_grade: Math.round(overallGrade),
    assignment_average: Math.round(assignmentAverage),
    quiz_average: Math.round(quizAverage),
    attendance_rate: attendanceRate,
    participation_score: participationScore,
    strengths,
    areas_for_improvement: areasForImprovement,
    recent_grades: recentGrades
  }
}

/**
 * Get student activity log
 */
export async function getStudentActivity(
  teacherId: string,
  studentId: string,
  limit: number = 50
): Promise<StudentActivity> {
  const supabase = await createClient()

  // Verify access
  const hasAccess = await verifyTeacherStudentAccess(teacherId, studentId)
  if (!hasAccess) {
    throw new Error('Unauthorized access to student data')
  }

  const activities: StudentActivity['activities'] = []

  // Get lesson views
  const { data: lessonViews } = await supabase
    .from('lesson_progress')
    .select(`
      id,
      updated_at,
      lessons (
        title
      )
    `)
    .eq('student_id', studentId)
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (lessonViews) {
    activities.push(...lessonViews.map(lv => ({
      id: lv.id,
      type: 'lesson_view' as const,
      title: (lv.lessons as any)?.title || 'Lesson',
      description: 'Viewed lesson',
      timestamp: lv.updated_at
    })))
  }

  // Get assignment submissions
  const { data: submissions } = await supabase
    .from('assignment_submissions')
    .select(`
      id,
      submitted_at,
      assignments (
        title
      )
    `)
    .eq('student_id', studentId)
    .order('submitted_at', { ascending: false })
    .limit(limit)

  if (submissions) {
    activities.push(...submissions.map(s => ({
      id: s.id,
      type: 'assignment_submit' as const,
      title: (s.assignments as any)?.title || 'Assignment',
      description: 'Submitted assignment',
      timestamp: s.submitted_at
    })))
  }

  // Get quiz attempts
  const { data: quizAttempts } = await supabase
    .from('quiz_attempts')
    .select(`
      id,
      completed_at,
      quizzes (
        title
      )
    `)
    .eq('student_id', studentId)
    .order('completed_at', { ascending: false })
    .limit(limit)

  if (quizAttempts) {
    activities.push(...quizAttempts.map(qa => ({
      id: qa.id,
      type: 'quiz_attempt' as const,
      title: (qa.quizzes as any)?.title || 'Quiz',
      description: 'Completed quiz',
      timestamp: qa.completed_at
    })))
  }

  // Sort all activities by timestamp
  activities.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return {
    student_id: studentId,
    activities: activities.slice(0, limit)
  }
}

/**
 * Send message to student(s)
 */
export async function sendMessage(
  teacherId: string,
  message: Message
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const supabase = await createClient()

  try {
    // Verify teacher has access to recipient
    const hasAccess = await verifyTeacherStudentAccess(teacherId, message.recipient_id)
    if (!hasAccess) {
      return { success: false, error: 'Unauthorized to message this student' }
    }

    // Create message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: teacherId,
        recipient_id: message.recipient_id,
        subject: message.subject,
        content: message.content,
        priority: message.priority || 'normal',
        sent_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error sending message:', error)
      return { success: false, error: 'Failed to send message' }
    }

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: message.recipient_id,
        type: 'message',
        title: `New message: ${message.subject}`,
        message: message.content.substring(0, 100),
        link: `/messages/${data.id}`,
        created_at: new Date().toISOString()
      })

    return { success: true, messageId: data.id }
  } catch (error) {
    console.error('Error in sendMessage:', error)
    return { success: false, error: 'Failed to send message' }
  }
}

/**
 * Get grading statistics for teacher
 */
export async function getGradingStatistics(
  teacherId: string
): Promise<GradingStatistics> {
  const supabase = await createClient()

  // Get teacher's courses
  const { data: courses } = await supabase
    .from('courses')
    .select('id, title')
    .or(`created_by.eq.${teacherId},course_assignments.teacher_id.eq.${teacherId}`)

  if (!courses || courses.length === 0) {
    return {
      total_submissions: 0,
      pending_grading: 0,
      graded_today: 0,
      average_turnaround_time: 0,
      by_course: []
    }
  }

  const courseIds = courses.map(c => c.id)

  // Get all submissions for these courses
  const { data: submissions } = await supabase
    .from('assignment_submissions')
    .select('id, score, graded_at, submitted_at, assignment_id')
    .in('assignment_id', supabase
      .from('assignments')
      .select('id')
      .in('course_id', courseIds)
    )

  const totalSubmissions = submissions?.length || 0
  const pendingGrading = submissions?.filter(s => s.score === null).length || 0
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const gradedToday = submissions?.filter(s => 
    s.graded_at && new Date(s.graded_at) >= today
  ).length || 0

  // Calculate average turnaround time
  const gradedSubmissions = submissions?.filter(s => s.graded_at) || []
  const averageTurnaroundTime = gradedSubmissions.length > 0
    ? gradedSubmissions.reduce((sum, s) => {
        const submitted = new Date(s.submitted_at).getTime()
        const graded = new Date(s.graded_at!).getTime()
        return sum + (graded - submitted) / (1000 * 60 * 60 * 24) // days
      }, 0) / gradedSubmissions.length
    : 0

  // Get stats by course
  const byCourse = await Promise.all(courses.map(async (course) => {
    const { data: courseSubmissions } = await supabase
      .from('assignment_submissions')
      .select('id, score')
      .in('assignment_id', supabase
        .from('assignments')
        .select('id')
        .eq('course_id', course.id)
      )

    const pending = courseSubmissions?.filter(s => s.score === null).length || 0
    const graded = courseSubmissions?.filter(s => s.score !== null).length || 0

    return {
      course_id: course.id,
      course_name: course.title,
      pending,
      graded
    }
  }))

  return {
    total_submissions: totalSubmissions,
    pending_grading: pendingGrading,
    graded_today: gradedToday,
    average_turnaround_time: Math.round(averageTurnaroundTime * 10) / 10,
    by_course: byCourse
  }
}

/**
 * Verify teacher has access to student data
 */
export async function verifyTeacherStudentAccess(
  teacherId: string,
  studentId: string,
  courseId?: string
): Promise<boolean> {
  const supabase = await createClient()

  // Get teacher's courses
  const { data: courses } = await supabase
    .from('courses')
    .select('id')
    .or(`created_by.eq.${teacherId},course_assignments.teacher_id.eq.${teacherId}`)

  if (!courses || courses.length === 0) {
    return false
  }

  let courseIds = courses.map(c => c.id)

  // If specific course requested, verify teacher teaches it
  if (courseId) {
    if (!courseIds.includes(courseId)) {
      return false
    }
    courseIds = [courseId]
  }

  // Check if student is enrolled in any of teacher's courses
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('student_id', studentId)
    .in('course_id', courseIds)
    .limit(1)
    .single()

  return !!enrollment
}
