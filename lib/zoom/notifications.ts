// Zoom Meeting Notifications
// Integrates with the existing notification system

import { createClient } from '@/lib/supabase/server';

interface MeetingNotificationData {
  meetingId: string;
  title: string;
  scheduledAt: string;
  duration: number;
  joinUrl: string;
  courseId: string;
}

/**
 * Send notification when a meeting is created
 */
export async function notifyMeetingCreated(data: MeetingNotificationData) {
  try {
    const supabase = createClient();

    // Get enrolled students
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('user_id')
      .eq('course_id', data.courseId)
      .eq('status', 'active');

    if (!enrollments || enrollments.length === 0) {
      return;
    }

    const userIds = enrollments.map(e => e.user_id);

    // Create notifications for all enrolled students
    const notifications = userIds.map(userId => ({
      user_id: userId,
      type: 'live_class_scheduled',
      title: 'New Live Class Scheduled',
      message: `${data.title} is scheduled for ${new Date(data.scheduledAt).toLocaleString()}`,
      data: {
        meeting_id: data.meetingId,
        join_url: data.joinUrl,
        scheduled_at: data.scheduledAt
      },
      priority: 'medium'
    }));

    await supabase.from('notifications').insert(notifications);
  } catch (error) {
    console.error('Error sending meeting created notification:', error);
  }
}

/**
 * Send reminder notification before meeting starts
 */
export async function notifyMeetingReminder(data: MeetingNotificationData) {
  try {
    const supabase = createClient();

    // Get enrolled students
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('user_id')
      .eq('course_id', data.courseId)
      .eq('status', 'active');

    if (!enrollments || enrollments.length === 0) {
      return;
    }

    const userIds = enrollments.map(e => e.user_id);

    // Create reminder notifications
    const notifications = userIds.map(userId => ({
      user_id: userId,
      type: 'live_class_reminder',
      title: 'Live Class Starting Soon',
      message: `${data.title} starts in 15 minutes`,
      data: {
        meeting_id: data.meetingId,
        join_url: data.joinUrl,
        scheduled_at: data.scheduledAt
      },
      priority: 'high'
    }));

    await supabase.from('notifications').insert(notifications);
  } catch (error) {
    console.error('Error sending meeting reminder:', error);
  }
}

/**
 * Send notification when meeting is cancelled
 */
export async function notifyMeetingCancelled(data: MeetingNotificationData) {
  try {
    const supabase = createClient();

    // Get enrolled students
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('user_id')
      .eq('course_id', data.courseId)
      .eq('status', 'active');

    if (!enrollments || enrollments.length === 0) {
      return;
    }

    const userIds = enrollments.map(e => e.user_id);

    // Create cancellation notifications
    const notifications = userIds.map(userId => ({
      user_id: userId,
      type: 'live_class_cancelled',
      title: 'Live Class Cancelled',
      message: `${data.title} scheduled for ${new Date(data.scheduledAt).toLocaleString()} has been cancelled`,
      data: {
        meeting_id: data.meetingId,
        scheduled_at: data.scheduledAt
      },
      priority: 'high'
    }));

    await supabase.from('notifications').insert(notifications);
  } catch (error) {
    console.error('Error sending meeting cancelled notification:', error);
  }
}

/**
 * Send notification when meeting starts
 */
export async function notifyMeetingStarted(data: MeetingNotificationData) {
  try {
    const supabase = createClient();

    // Get enrolled students
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('user_id')
      .eq('course_id', data.courseId)
      .eq('status', 'active');

    if (!enrollments || enrollments.length === 0) {
      return;
    }

    const userIds = enrollments.map(e => e.user_id);

    // Create live notifications
    const notifications = userIds.map(userId => ({
      user_id: userId,
      type: 'live_class_started',
      title: 'Live Class Started',
      message: `${data.title} is now live! Join now`,
      data: {
        meeting_id: data.meetingId,
        join_url: data.joinUrl
      },
      priority: 'urgent'
    }));

    await supabase.from('notifications').insert(notifications);
  } catch (error) {
    console.error('Error sending meeting started notification:', error);
  }
}

/**
 * Send notification when recording is available
 */
export async function notifyRecordingAvailable(
  meetingId: string,
  title: string,
  courseId: string,
  recordingUrl: string
) {
  try {
    const supabase = createClient();

    // Get enrolled students
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('user_id')
      .eq('course_id', courseId)
      .eq('status', 'active');

    if (!enrollments || enrollments.length === 0) {
      return;
    }

    const userIds = enrollments.map(e => e.user_id);

    // Create recording available notifications
    const notifications = userIds.map(userId => ({
      user_id: userId,
      type: 'recording_available',
      title: 'Class Recording Available',
      message: `Recording for ${title} is now available`,
      data: {
        meeting_id: meetingId,
        recording_url: recordingUrl
      },
      priority: 'low'
    }));

    await supabase.from('notifications').insert(notifications);
  } catch (error) {
    console.error('Error sending recording available notification:', error);
  }
}
