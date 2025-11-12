// Google Meet Calendar Sync
// Sync live classes with Google Calendar events

import { createClient } from '@/lib/supabase/server';
import { getAuthenticatedClient } from './auth';
import { createMeeting, updateMeeting, deleteMeeting } from './meetings';

interface SyncResult {
  created: number;
  updated: number;
  deleted: number;
  errors: string[];
}

/**
 * Sync a live class with Google Calendar
 */
export async function syncLiveClassToGoogle(
  userId: string,
  liveClassId: string
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const supabase = createClient();
    
    // Get live class details
    const { data: liveClass, error: fetchError } = await supabase
      .from('live_classes')
      .select(`
        *,
        courses (title),
        users!live_classes_teacher_id_fkey (full_name, email)
      `)
      .eq('id', liveClassId)
      .single();

    if (fetchError || !liveClass) {
      return { success: false, error: 'Live class not found' };
    }

    // Get enrolled students for attendees
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('users (email)')
      .eq('course_id', liveClass.course_id)
      .eq('status', 'active');

    const attendees = enrollments?.map((e: any) => e.users.email).filter(Boolean) || [];

    const meetingData = {
      title: `${liveClass.courses?.title || 'Live Class'} - ${liveClass.title}`,
      description: liveClass.description || '',
      start_time: liveClass.scheduled_at,
      end_time: new Date(
        new Date(liveClass.scheduled_at).getTime() + liveClass.duration * 60000
      ).toISOString(),
      attendees,
      timezone: 'UTC',
      sendUpdates: true
    };

    if (liveClass.google_event_id) {
      // Update existing meeting
      const meeting = await updateMeeting(userId, liveClass.google_event_id, meetingData);
      
      await supabase
        .from('live_classes')
        .update({
          join_url: meeting.meetLink,
          platform_data: {
            calendarLink: meeting.calendarLink,
            status: meeting.status
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', liveClassId);

      return { success: true, eventId: meeting.eventId };
    } else {
      // Create new meeting
      const meeting = await createMeeting(userId, meetingData);
      
      await supabase
        .from('live_classes')
        .update({
          platform: 'google_meet',
          google_event_id: meeting.eventId,
          join_url: meeting.meetLink,
          platform_data: {
            calendarLink: meeting.calendarLink,
            status: meeting.status
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', liveClassId);

      return { success: true, eventId: meeting.eventId };
    }
  } catch (error) {
    console.error('Error syncing to Google:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Sync failed' 
    };
  }
}

/**
 * Bulk sync all upcoming live classes for a teacher
 */
export async function syncAllLiveClasses(userId: string): Promise<SyncResult> {
  const result: SyncResult = {
    created: 0,
    updated: 0,
    deleted: 0,
    errors: []
  };

  try {
    const supabase = createClient();
    
    // Get all upcoming live classes for this teacher
    const { data: liveClasses } = await supabase
      .from('live_classes')
      .select('id, google_event_id, status')
      .eq('teacher_id', userId)
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true });

    if (!liveClasses || liveClasses.length === 0) {
      return result;
    }

    for (const liveClass of liveClasses) {
      try {
        if (liveClass.status === 'cancelled' && liveClass.google_event_id) {
          // Delete from Google Calendar
          await deleteMeeting(userId, liveClass.google_event_id, true);
          result.deleted++;
        } else {
          const syncResult = await syncLiveClassToGoogle(userId, liveClass.id);
          if (syncResult.success) {
            if (liveClass.google_event_id) {
              result.updated++;
            } else {
              result.created++;
            }
          } else {
            result.errors.push(`${liveClass.id}: ${syncResult.error}`);
          }
        }
      } catch (error) {
        result.errors.push(
          `${liveClass.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    return result;
  } catch (error) {
    console.error('Error in bulk sync:', error);
    result.errors.push(error instanceof Error ? error.message : 'Bulk sync failed');
    return result;
  }
}

/**
 * Remove Google Meet from a live class
 */
export async function unsyncLiveClass(
  userId: string,
  liveClassId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    
    const { data: liveClass } = await supabase
      .from('live_classes')
      .select('google_event_id')
      .eq('id', liveClassId)
      .single();

    if (!liveClass?.google_event_id) {
      return { success: true }; // Nothing to unsync
    }

    // Delete from Google Calendar
    await deleteMeeting(userId, liveClass.google_event_id, true);

    // Clear Google Meet data from live class
    await supabase
      .from('live_classes')
      .update({
        google_event_id: null,
        platform_data: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', liveClassId);

    return { success: true };
  } catch (error) {
    console.error('Error unsyncing live class:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unsync failed' 
    };
  }
}
