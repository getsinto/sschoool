// Zoom Attendance Tracking
import { zoomClient } from './client';
import { createClient } from '@/lib/supabase/server';

export interface Participant {
  id: string;
  user_id: string;
  name: string;
  user_email: string;
  join_time: string;
  leave_time: string;
  duration: number;
  attentiveness_score?: string;
  failover?: boolean;
  status?: 'in_meeting' | 'in_waiting_room';
}

export interface AttendanceReport {
  meeting_id: string;
  meeting_uuid: string;
  topic: string;
  start_time: string;
  end_time: string;
  duration: number;
  participants: Participant[];
  total_participants: number;
}

// Get participants for a meeting
export async function getParticipants(
  meetingId: string,
  pageSize: number = 300
): Promise<{ participants: Participant[]; total_records: number }> {
  try {
    const response = await zoomClient.request<any>(
      `/past_meetings/${meetingId}/participants?page_size=${pageSize}`
    );
    
    return {
      participants: response.participants || [],
      total_records: response.total_records || 0
    };
  } catch (error) {
    console.error('Error getting participants:', error);
    throw error;
  }
}

// Get participant report with join/leave times
export async function getParticipantReport(
  meetingId: string
): Promise<AttendanceReport> {
  try {
    const meeting = await zoomClient.request<any>(
      `/past_meetings/${meetingId}`
    );
    
    const { participants, total_records } = await getParticipants(meetingId);
    
    return {
      meeting_id: meeting.id,
      meeting_uuid: meeting.uuid,
      topic: meeting.topic,
      start_time: meeting.start_time,
      end_time: meeting.end_time,
      duration: meeting.duration,
      participants,
      total_participants: total_records
    };
  } catch (error) {
    console.error('Error getting participant report:', error);
    throw error;
  }
}

// Calculate attendance statistics
export function calculateAttendanceStats(participants: Participant[], meetingDuration: number) {
  const stats = {
    total_participants: participants.length,
    on_time: 0,
    late: 0,
    left_early: 0,
    full_attendance: 0,
    average_duration: 0,
    attendance_rate: 0
  };

  let totalDuration = 0;

  participants.forEach(participant => {
    const joinTime = new Date(participant.join_time).getTime();
    const leaveTime = new Date(participant.leave_time).getTime();
    const duration = participant.duration;

    totalDuration += duration;

    // Check if joined on time (within 5 minutes of start)
    const meetingStart = new Date(participant.join_time).getTime();
    if (joinTime - meetingStart <= 5 * 60 * 1000) {
      stats.on_time++;
    } else {
      stats.late++;
    }

    // Check if left early (more than 10 minutes before end)
    const expectedEnd = meetingStart + meetingDuration * 60 * 1000;
    if (leaveTime < expectedEnd - 10 * 60 * 1000) {
      stats.left_early++;
    }

    // Check full attendance (attended at least 80% of meeting)
    if (duration >= meetingDuration * 0.8) {
      stats.full_attendance++;
    }
  });

  stats.average_duration = participants.length > 0 
    ? Math.round(totalDuration / participants.length) 
    : 0;
    
  stats.attendance_rate = participants.length > 0
    ? Math.round((stats.full_attendance / participants.length) * 100)
    : 0;

  return stats;
}

// Generate attendance report
export async function generateAttendanceReport(
  meetingId: string
): Promise<{
  report: AttendanceReport;
  stats: ReturnType<typeof calculateAttendanceStats>;
  csv: string;
}> {
  try {
    const report = await getParticipantReport(meetingId);
    const stats = calculateAttendanceStats(report.participants, report.duration);
    
    // Generate CSV
    const csvHeaders = [
      'Name',
      'Email',
      'Join Time',
      'Leave Time',
      'Duration (minutes)',
      'Status'
    ].join(',');
    
    const csvRows = report.participants.map(p => [
      p.name,
      p.user_email,
      new Date(p.join_time).toLocaleString(),
      new Date(p.leave_time).toLocaleString(),
      Math.round(p.duration / 60),
      p.duration >= report.duration * 0.8 ? 'Present' : 'Partial'
    ].join(','));
    
    const csv = [csvHeaders, ...csvRows].join('\n');
    
    return { report, stats, csv };
  } catch (error) {
    console.error('Error generating attendance report:', error);
    throw error;
  }
}

// Sync attendance to database
export async function syncAttendanceToDatabase(
  classId: string,
  meetingId: string,
  participants: Participant[]
): Promise<void> {
  try {
    const supabase = createClient();
    
    // Get enrolled students for this class
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('user_id, users(email, full_name)')
      .eq('class_id', classId);
    
    if (!enrollments) return;
    
    // Create attendance records
    const attendanceRecords = enrollments.map(enrollment => {
      const participant = participants.find(
        p => p.user_email === enrollment.users?.email
      );
      
      return {
        class_id: classId,
        student_id: enrollment.user_id,
        meeting_id: meetingId,
        status: participant ? 'present' : 'absent',
        join_time: participant?.join_time || null,
        leave_time: participant?.leave_time || null,
        duration: participant?.duration || 0,
        recorded_at: new Date().toISOString()
      };
    });
    
    // Insert attendance records
    const { error } = await supabase
      .from('class_attendance')
      .upsert(attendanceRecords, {
        onConflict: 'class_id,student_id,meeting_id'
      });
    
    if (error) {
      throw error;
    }
    
    // Update class status
    await supabase
      .from('live_classes')
      .update({
        attendance_synced: true,
        attendance_synced_at: new Date().toISOString()
      })
      .eq('meeting_id', meetingId);
      
  } catch (error) {
    console.error('Error syncing attendance to database:', error);
    throw error;
  }
}

// Get attendance for a student
export async function getStudentAttendance(
  studentId: string,
  classId?: string
): Promise<any[]> {
  try {
    const supabase = createClient();
    
    let query = supabase
      .from('class_attendance')
      .select(`
        *,
        live_classes(topic, scheduled_at)
      `)
      .eq('student_id', studentId)
      .order('recorded_at', { ascending: false });
    
    if (classId) {
      query = query.eq('class_id', classId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting student attendance:', error);
    throw error;
  }
}

// Calculate attendance percentage for a student
export async function calculateStudentAttendanceRate(
  studentId: string,
  classId?: string
): Promise<number> {
  try {
    const attendance = await getStudentAttendance(studentId, classId);
    
    if (attendance.length === 0) return 0;
    
    const presentCount = attendance.filter(a => a.status === 'present').length;
    return Math.round((presentCount / attendance.length) * 100);
  } catch (error) {
    console.error('Error calculating attendance rate:', error);
    return 0;
  }
}

// Export attendance report to CSV
export function exportAttendanceToCSV(
  report: AttendanceReport,
  includeStats: boolean = true
): string {
  const lines: string[] = [];
  
  // Header
  lines.push('Zoom Meeting Attendance Report');
  lines.push(`Meeting: ${report.topic}`);
  lines.push(`Meeting ID: ${report.meeting_id}`);
  lines.push(`Date: ${new Date(report.start_time).toLocaleDateString()}`);
  lines.push(`Duration: ${report.duration} minutes`);
  lines.push('');
  
  // Participant data
  lines.push('Name,Email,Join Time,Leave Time,Duration (min),Attendance %');
  
  report.participants.forEach(p => {
    const attendancePercent = Math.round((p.duration / (report.duration * 60)) * 100);
    lines.push([
      `"${p.name}"`,
      p.user_email,
      new Date(p.join_time).toLocaleString(),
      new Date(p.leave_time).toLocaleString(),
      Math.round(p.duration / 60),
      attendancePercent
    ].join(','));
  });
  
  if (includeStats) {
    const stats = calculateAttendanceStats(report.participants, report.duration);
    lines.push('');
    lines.push('Summary Statistics');
    lines.push(`Total Participants,${stats.total_participants}`);
    lines.push(`On Time,${stats.on_time}`);
    lines.push(`Late,${stats.late}`);
    lines.push(`Left Early,${stats.left_early}`);
    lines.push(`Full Attendance,${stats.full_attendance}`);
    lines.push(`Average Duration (min),${Math.round(stats.average_duration / 60)}`);
    lines.push(`Attendance Rate,${stats.attendance_rate}%`);
  }
  
  return lines.join('\n');
}
