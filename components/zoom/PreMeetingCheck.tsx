'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Volume2, 
  VolumeX,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

interface PreMeetingCheckProps {
  onComplete: (settings: {
    audioEnabled: boolean;
    videoEnabled: boolean;
    deviceReady: boolean;
  }) => void;
}

export function PreMeetingCheck({ onComplete }: PreMeetingCheckProps) {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<string>('');
  const [selectedVideo, setSelectedVideo] = useState<string>('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [checking, setChecking] = useState(true);
  const [permissions, setPermissions] = useState({
    audio: false,
    video: false
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    checkDevices();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const checkDevices = async () => {
    try {
      // Request permissions
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });

      setStream(mediaStream);
      setPermissions({ audio: true, video: true });

      // Get available devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(d => d.kind === 'audioinput');
      const videoInputs = devices.filter(d => d.kind === 'videoinput');

      setAudioDevices(audioInputs);
      setVideoDevices(videoInputs);

      if (audioInputs.length > 0) setSelectedAudio(audioInputs[0].deviceId);
      if (videoInputs.length > 0) setSelectedVideo(videoInputs[0].deviceId);

      // Show video preview
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setChecking(false);
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setPermissions({ audio: false, video: false });
      setChecking(false);
    }
  };

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
    }
    setAudioEnabled(!audioEnabled);
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !videoEnabled;
      });
    }
    setVideoEnabled(!videoEnabled);
  };

  const handleJoin = () => {
    onComplete({
      audioEnabled,
      videoEnabled,
      deviceReady: permissions.audio && permissions.video
    });
  };

  if (checking) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Checking your devices...</p>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Pre-Meeting Check</h2>

        {/* Video Preview */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Video Preview</h3>
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            {videoEnabled && permissions.video ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <VideoOff className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Device Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Microphone
            </label>
            <select
              value={selectedAudio}
              onChange={(e) => setSelectedAudio(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              disabled={!permissions.audio}
            >
              {audioDevices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Camera
            </label>
            <select
              value={selectedVideo}
              onChange={(e) => setSelectedVideo(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              disabled={!permissions.video}
            >
              {videoDevices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <Button
            variant={audioEnabled ? 'default' : 'destructive'}
            size="lg"
            onClick={toggleAudio}
            disabled={!permissions.audio}
          >
            {audioEnabled ? (
              <><Mic className="h-5 w-5 mr-2" /> Microphone On</>
            ) : (
              <><MicOff className="h-5 w-5 mr-2" /> Microphone Off</>
            )}
          </Button>

          <Button
            variant={videoEnabled ? 'default' : 'destructive'}
            size="lg"
            onClick={toggleVideo}
            disabled={!permissions.video}
          >
            {videoEnabled ? (
              <><Video className="h-5 w-5 mr-2" /> Camera On</>
            ) : (
              <><VideoOff className="h-5 w-5 mr-2" /> Camera Off</>
            )}
          </Button>
        </div>

        {/* Status */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2">
            {permissions.audio ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span>Microphone {permissions.audio ? 'Ready' : 'Not Available'}</span>
          </div>
          <div className="flex items-center gap-2">
            {permissions.video ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span>Camera {permissions.video ? 'Ready' : 'Not Available'}</span>
          </div>
        </div>

        {/* Join Button */}
        <div className="flex justify-end">
          <Button size="lg" onClick={handleJoin}>
            Join Meeting
          </Button>
        </div>
      </Card>
    </div>
  );
}
