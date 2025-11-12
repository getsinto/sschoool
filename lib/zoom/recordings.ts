// Zoom Recordings Management
import { zoomClient } from './client';
import { createClient } from '@/lib/supabase/server';

export interface ZoomRecording {
  id: string;
  meeting_id: string;
  recording_start: string;
  recording_end: string;
  file_type: string;
  file_size: number;
  play_url: string;
  download_url: string;
  status: string;
  recording_type: string;
}

export interface RecordingFile {
  id: string;
  meeting_id: string;
  recording_start: string;
  recording_end: string;
  file_type: 'MP4' | 'M4A' | 'TIMELINE' | 'TRANSCRIPT' | 'CHAT' | 'CC';
  file_extension: string;
  file_size: number;
  play_url: string;
  download_url: string;
  status: 'completed' | 'processing';
  recording_type: 'shared_screen_with_speaker_view' | 'shared_screen_with_gallery_view' | 'speaker_view' | 'gallery_view' | 'shared_screen' | 'audio_only' | 'audio_transcript' | 'chat_file' | 'active_speaker';
}

export interface RecordingMeeting {
  uuid: string;
  id: number;
  account_id: string;
  host_id: string;
  topic: string;
  start_time: string;
  duration: number;
  total_size: number;
  recording_count: number;
  share_url: string;
  recording_files: RecordingFile[];
}

// List all recordings for a user
export async function listRecordings(
  userId: string = 'me',
  from?: string,
  to?: string,
  pageSize: number = 30
): Promise<{ meetings: RecordingMeeting[] }> {
  try {
    const params = new URLSearchParams({
      page_size: pageSize.toString(),
      ...(from && { from }),
      ...(to && { to })
    });

    const response = await zoomClient.request<any>(
      `/users/${userId}/recordings?${params.toString()}`
    );
    
    return response;
  } catch (error) {
    console.error('Error listing recordings:', error);
    throw error;
  }
}

// Get recordings for a specific meeting
export async function getMeetingRecordings(
  meetingId: string
): Promise<RecordingMeeting> {
  try {
    const response = await zoomClient.request<RecordingMeeting>(
      `/meetings/${meetingId}/recordings`
    );
    return response;
  } catch (error) {
    console.error('Error getting meeting recordings:', error);
    throw error;
  }
}

// Download recording file
export async function downloadRecording(
  downloadUrl: string,
  accessToken?: string
): Promise<Blob> {
  try {
    const token = accessToken || await zoomClient.request<any>('/oauth/token', {
      method: 'POST'
    });

    const response = await fetch(downloadUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to download recording: ${response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Error downloading recording:', error);
    throw error;
  }
}

// Upload recording to Supabase Storage
export async function uploadRecordingToStorage(
  recordingBlob: Blob,
  meetingId: string,
  fileName: string
): Promise<string> {
  try {
    const supabase = createClient();
    
    // Create file path
    const filePath = `recordings/${meetingId}/${fileName}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('zoom-recordings')
      .upload(filePath, recordingBlob, {
        contentType: 'video/mp4',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('zoom-recordings')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading recording to storage:', error);
    throw error;
  }
}

// Process and store recording
export async function processRecording(
  meetingId: string,
  recordingFile: RecordingFile
): Promise<string> {
  try {
    // Download recording from Zoom
    const recordingBlob = await downloadRecording(recordingFile.download_url);
    
    // Generate filename
    const fileName = `${recordingFile.id}.${recordingFile.file_extension}`;
    
    // Upload to storage
    const publicUrl = await uploadRecordingToStorage(
      recordingBlob,
      meetingId,
      fileName
    );
    
    // Update database
    const supabase = createClient();
    await supabase
      .from('live_classes')
      .update({
        recording_url: publicUrl,
        recording_duration: recordingFile.file_size,
        recording_processed_at: new Date().toISOString()
      })
      .eq('meeting_id', meetingId);
    
    return publicUrl;
  } catch (error) {
    console.error('Error processing recording:', error);
    throw error;
  }
}

// Delete recording from Zoom
export async function deleteRecording(
  meetingId: string,
  action: 'trash' | 'delete' = 'trash'
): Promise<void> {
  try {
    await zoomClient.request(
      `/meetings/${meetingId}/recordings?action=${action}`,
      { method: 'DELETE' }
    );
  } catch (error) {
    console.error('Error deleting recording:', error);
    throw error;
  }
}

// Recover recording from trash
export async function recoverRecording(
  meetingId: string
): Promise<void> {
  try {
    await zoomClient.request(
      `/meetings/${meetingId}/recordings/status`,
      {
        method: 'PUT',
        body: JSON.stringify({ action: 'recover' })
      }
    );
  } catch (error) {
    console.error('Error recovering recording:', error);
    throw error;
  }
}

// Get recording settings
export async function getRecordingSettings(
  meetingId: string
): Promise<any> {
  try {
    const response = await zoomClient.request(
      `/meetings/${meetingId}/recordings/settings`
    );
    return response;
  } catch (error) {
    console.error('Error getting recording settings:', error);
    throw error;
  }
}

// Update recording settings
export async function updateRecordingSettings(
  meetingId: string,
  settings: {
    share_recording?: 'publicly' | 'internally' | 'none';
    recording_authentication?: boolean;
    password?: string;
    on_demand?: boolean;
    approval_type?: 0 | 1 | 2;
    send_email_to_host?: boolean;
    show_social_share_buttons?: boolean;
  }
): Promise<void> {
  try {
    await zoomClient.request(
      `/meetings/${meetingId}/recordings/settings`,
      {
        method: 'PATCH',
        body: JSON.stringify(settings)
      }
    );
  } catch (error) {
    console.error('Error updating recording settings:', error);
    throw error;
  }
}

// Generate recording thumbnail
export async function generateThumbnail(
  videoUrl: string
): Promise<string> {
  // This would typically use a video processing service
  // For now, return a placeholder
  return '/images/video-thumbnail-placeholder.jpg';
}

// Get recording analytics
export async function getRecordingAnalytics(
  meetingId: string
): Promise<{
  views: number;
  downloads: number;
  unique_viewers: number;
}> {
  try {
    // This would fetch from your analytics system
    // Placeholder implementation
    return {
      views: 0,
      downloads: 0,
      unique_viewers: 0
    };
  } catch (error) {
    console.error('Error getting recording analytics:', error);
    throw error;
  }
}

// Export convenience functions for API routes
export async function getRecordings(meetingId: string) {
  return getMeetingRecordings(meetingId);
}

export async function startRecording(meetingId: string) {
  try {
    await zoomClient.request(
      `/meetings/${meetingId}/recordings`,
      {
        method: 'PATCH',
        body: JSON.stringify({ action: 'start' })
      }
    );
    return { success: true };
  } catch (error) {
    console.error('Error starting recording:', error);
    throw error;
  }
}

export async function stopRecording(meetingId: string) {
  try {
    await zoomClient.request(
      `/meetings/${meetingId}/recordings`,
      {
        method: 'PATCH',
        body: JSON.stringify({ action: 'stop' })
      }
    );
    return { success: true };
  } catch (error) {
    console.error('Error stopping recording:', error);
    throw error;
  }
}
