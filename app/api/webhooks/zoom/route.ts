import { NextRequest, NextResponse } from 'next/server';
import { zoomClient } from '@/lib/zoom/client';
import { createClient } from '@/lib/supabase/server';
import { processRecording } from '@/lib/zoom/recordings';
import { syncAttendanceToDatabase, getParticipants } from '@/lib/zoom/attendance';

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-zm-signature') || '';
    const timestamp = request.headers.get('x-zm-request-timestamp') || '';
    
    // Verify webhook signature
    const isValid = zoomClient.verifyWebhookSignature(body, signature, timestamp);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    const event = JSON.parse(body);
    const supabase = await createClient();
    
    // Handle different event types
    switch (event.event) {
      case 'meeting.started':
        await handleMeetingStarted(event.payload, supabase);
        break;
        
      case 'meeting.ended':
        await handleMeetingEnded(event.payload, supabase);
        break;
        
      case 'recording.completed':
        await handleRecordingCompleted(event.payload, supabase);
        break;
        
      case 'participant.joined':
        await handleParticipantJoined(event.payload, supabase);
        break;
        
      case 'participant.left':
        await handleParticipantLeft(event.payload, supabase);
        break;
        
      default:
        console.log('Unhandled Zoom webhook event:', event.event);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Zoom webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleMeetingStarted(payload: any, supabase: any) {
  try {
    const meetingId = payload.object.id.toString();
    
    // Update meeting status
    await supabase
      .from('live_classes')
      .update({
        status: 'ongoing',
        actual_start_time: new Date().toISOString()
      })
      .eq('meeting_id', meetingId);
    
    // Notify enrolled students
    const { data: liveClass } = await supabase
      .from('live_classes')
      .select('id, title, course_id')
      .eq('meeting_id', meetingId)
      .single();
    
    if (liveClass) {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select('user_id')
        .eq('course_id', liveClass.course_id);
      
      if (enrollments) {
        // Send notifications to students
        const notifications = enrollments.map(enrollment => ({
          user_id: enrollment.user_id,
          type: 'live_class_started',
          title: 'Live Class Started',
          message: `${liveClass.title} has started. Join now!`,
          data: { class_id: liveClass.id, meeting_id: meetingId },
          created_at: new Date().toISOString()
        }));
        
        await supabase.from('notifications').insert(notifications);
      }
    }
  } catch (error) {
    console.error('Error handling meeting started:', error);
  }
}

async function handleMeetingEnded(payload: any, supabase: any) {
  try {
    const meetingId = payload.object.id.toString();
    
    // Update meeting status
    await supabase
      .from('live_classes')
      .update({
        status: 'completed',
        actual_end_time: new Date().toISOString()
      })
      .eq('meeting_id', meetingId);
    
    // Get class info
    const { data: liveClass } = await supabase
      .from('live_classes')
      .select('id, course_id')
      .eq('meeting_id', meetingId)
      .single();
    
    if (liveClass) {
      // Sync attendance
      try {
        const { participants } = await getParticipants(meetingId);
        await syncAttendanceToDatabase(liveClass.id, meetingId, participants);
      } catch (error) {
        console.error('Error syncing attendance:', error);
      }
    }
  } catch (error) {
    console.error('Error handling meeting ended:', error);
  }
}

async function handleRecordingCompleted(payload: any, supabase: any) {
  try {
    const meetingId = payload.object.id.toString();
    const recordingFiles = payload.object.recording_files || [];
    
    // Get class info
    const { data: liveClass } = await supabase
      .from('live_classes')
      .select('id, title, course_id')
      .eq('meeting_id', meetingId)
      .single();
    
    if (!liveClass) return;
    
    // Process video recordings
    const videoRecordings = recordingFiles.filter(
      (file: any) => file.file_type === 'MP4' && file.recording_type.includes('shared_screen')
    );
    
    if (videoRecordings.length > 0) {
      const mainRecording = videoRecordings[0];
      
      try {
        // Process and upload recording
        const recordingUrl = await processRecording(meetingId, mainRecording);
        
        // Notify students
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('user_id')
          .eq('course_id', liveClass.course_id);
        
        if (enrollments) {
          const notifications = enrollments.map(enrollment => ({
            user_id: enrollment.user_id,
            type: 'recording_available',
            title: 'Recording Available',
            message: `Recording for ${liveClass.title} is now available`,
            data: { class_id: liveClass.id, recording_url: recordingUrl },
            created_at: new Date().toISOString()
          }));
          
          await supabase.from('notifications').insert(notifications);
        }
      } catch (error) {
        console.error('Error processing recording:', error);
      }
    }
  } catch (error) {
    console.error('Error handling recording completed:', error);
  }
}

async function handleParticipantJoined(payload: any, supabase: any) {
  try {
    const meetingId = payload.object.id.toString();
    const participant = payload.object.participant;
    
    // Log participant join
    await supabase.from('meeting_participants').insert({
      meeting_id: meetingId,
      user_email: participant.email,
      user_name: participant.user_name,
      join_time: new Date().toISOString(),
      participant_id: participant.id
    });
  } catch (error) {
    console.error('Error handling participant joined:', error);
  }
}

async function handleParticipantLeft(payload: any, supabase: any) {
  try {
    const meetingId = payload.object.id.toString();
    const participant = payload.object.participant;
    
    // Update participant leave time
    await supabase
      .from('meeting_participants')
      .update({
        leave_time: new Date().toISOString(),
        duration: payload.object.participant.duration || 0
      })
      .eq('meeting_id', meetingId)
      .eq('participant_id', participant.id);
  } catch (error) {
    console.error('Error handling participant left:', error);
  }
}

// Verify endpoint for Zoom webhook validation
export async function GET(request: NextRequest) {
  return NextResponse.json({ message: 'Zoom webhook endpoint' });
}
