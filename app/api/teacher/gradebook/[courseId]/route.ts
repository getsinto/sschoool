import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { canGradeCourse } from '@/lib/permissions/coursePermissions';

// GET /api/teacher/gradebook/[courseId]
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { courseId } = params;

    // Check if teacher has grading permission for this course
    const result = await canGradeCourse(user.id, courseId);
    
    if (!result.hasPermission) {
      return NextResponse.json(
        { error: 'You do not have permission to access the gradebook for this course' },
        { status: 403 }
      );
    }

    // Fetch course details
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('id', courseId)
      .single();

    if (courseError) {
      console.error('Error fetching course:', courseError);
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Fetch assignments for this course
    const { data: assignments, error: assignmentsError } = await supabase
      .from('assignments')
      .select('id, title, type, max_points, weight')
      .eq('course_id', courseId)
      .order('created_at', { ascending: true });

    if (assignmentsError) {
      console.error('Error fetching assignments:', assignmentsError);
    }

    // Fetch enrolled students
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select(`
        student_id,
        student:student_id (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('course_id', courseId)
      .eq('status', 'active');

    if (enrollmentsError) {
      console.error('Error fetching enrollments:', enrollmentsError);
    }

    // Fetch grades for all students
    const studentIds = (enrollments || []).map(e => e.student_id);
    const assignmentIds = (assignments || []).map(a => a.id);

    let grades: any[] = [];
    if (studentIds.length > 0 && assignmentIds.length > 0) {
      const { data: gradesData, error: gradesError } = await supabase
        .from('assignment_submissions')
        .select('student_id, assignment_id, grade')
        .in('student_id', studentIds)
        .in('assignment_id', assignmentIds)
        .eq('status', 'graded');

      if (!gradesError) {
        grades = gradesData || [];
      }
    }

    // Format gradebook data
    const students = (enrollments || []).map(enrollment => {
      const studentGrades: Record<string, number> = {};
      
      grades
        .filter(g => g.student_id === enrollment.student_id)
        .forEach(g => {
          studentGrades[g.assignment_id] = g.grade;
        });

      return {
        id: enrollment.student.id,
        name: enrollment.student.full_name,
        email: enrollment.student.email,
        avatar: enrollment.student.avatar_url,
        grades: studentGrades
      };
    });

    const gradebook = {
      course: {
        id: course.id,
        name: course.title,
        term: 'Current Term'
      },
      assignments: (assignments || []).map(a => ({
        id: a.id,
        name: a.title,
        type: a.type,
        maxScore: a.max_points,
        weight: a.weight || 0
      })),
      students
    };

    return NextResponse.json({
      success: true,
      data: gradebook
    });
  } catch (error) {
    console.error('Error fetching gradebook:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gradebook' },
      { status: 500 }
    );
  }
}
