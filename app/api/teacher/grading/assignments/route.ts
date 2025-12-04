import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canGradeCourse } from '@/lib/permissions/coursePermissions';

export const dynamic = 'force-dynamic';

// GET /api/teacher/grading/assignments - Get assignment submissions
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get('courseId');
    const status = searchParams.get('status') || 'pending';
    const sortBy = searchParams.get('sortBy') || 'oldest';

    // If courseId is provided, check grading permission for that course
    if (courseId) {
      const result = await canGradeCourse(user.id, courseId);
      
      if (!result.hasPermission) {
        return NextResponse.json(
          { error: 'You do not have permission to grade students in this course' },
          { status: 403 }
        );
      }
    }

    // Get all courses where teacher has grading permission
    const { data: assignments, error: assignmentsError } = await supabase
      .from('course_assignments')
      .select('course_id')
      .eq('teacher_id', user.id)
      .eq('can_grade', true);

    if (assignmentsError) {
      console.error('Error fetching teacher assignments:', assignmentsError);
      return NextResponse.json(
        { error: 'Failed to fetch assignments' },
        { status: 500 }
      );
    }

    const allowedCourseIds = assignments.map(a => a.course_id);

    if (allowedCourseIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: {
          total: 0,
          pending: 0,
          graded: 0,
          late: 0
        }
      });
    }

    // Fetch assignment submissions for courses where teacher can grade
    let query = supabase
      .from('assignment_submissions')
      .select(`
        *,
        assignment:assignment_id (
          id,
          title,
          max_points,
          due_date,
          course_id
        ),
        student:student_id (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .in('assignment.course_id', allowedCourseIds);

    // Filter by specific course if provided
    if (courseId) {
      query = query.eq('assignment.course_id', courseId);
    }

    // Filter by status
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: submissions, error: submissionsError } = await query;

    if (submissionsError) {
      console.error('Error fetching submissions:', submissionsError);
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500 }
      );
    }

    // Transform data for response
    const formattedSubmissions = (submissions || []).map(sub => ({
      id: sub.id,
      submissionId: sub.id,
      assignmentId: sub.assignment.id,
      assignmentTitle: sub.assignment.title,
      courseId: sub.assignment.course_id,
      student: {
        id: sub.student.id,
        name: sub.student.full_name,
        email: sub.student.email,
        avatar: sub.student.avatar_url
      },
      submittedAt: sub.submitted_at,
      dueDate: sub.assignment.due_date,
      isLate: new Date(sub.submitted_at) > new Date(sub.assignment.due_date),
      submissionType: sub.submission_type,
      maxPoints: sub.assignment.max_points,
      grade: sub.grade,
      status: sub.status
    }));

    // Sort
    formattedSubmissions.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
        case 'newest':
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        case 'student':
          return a.student.name.localeCompare(b.student.name);
        default:
          return 0;
      }
    });

    return NextResponse.json({
      success: true,
      data: formattedSubmissions,
      meta: {
        total: formattedSubmissions.length,
        pending: formattedSubmissions.filter(a => a.status === 'pending').length,
        graded: formattedSubmissions.filter(a => a.status === 'graded').length,
        late: formattedSubmissions.filter(a => a.isLate).length
      }
    });
  } catch (error) {
    console.error('Error fetching assignment submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assignment submissions' },
      { status: 500 }
    );
  }
}
