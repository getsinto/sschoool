'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle } from 'lucide-react';

interface ZoomMeetingEmbedProps {
  meetingNumber: string;
  password?: string;
  userName: string;
  userEmail?: string;
  role?: 0 | 1; // 0 = participant, 1 = host
  onMeetingEnd?: () => void;
  onError?: (error: any) => void;
}

export function ZoomMeetingEmbed({
  meetingNumber,
  password,
  userName,
  userEmail,
  role = 0,
  onMeetingEnd,
  onError
}: ZoomMeetingEmbedProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const meetingContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    generateSignature();
  }, [meetingNumber]);

  const generateSignature = async () => {
    try {
      const response = await fetch('/api/zoom/generate-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingNumber, role })
      });

      if (!response.ok) {
        throw new Error('Failed to generate signature');
      }

      const data = await response.json();
      setSignature(data.signature);
    } catch (err) {
      const errorMsg = 'Failed to initialize meeting';
      setError(errorMsg);
      onError?.(err);
    }
  };

  useEffect(() => {
    if (!signature) return;

    // Load Zoom Web SDK
    const script = document.createElement('script');
    script.src = 'https://source.zoom.us/2.18.0/lib/vendor/react.min.js';
    script.async = true;
    document.body.appendChild(script);

    const script2 = document.createElement('script');
    script2.src = 'https://source.zoom.us/2.18.0/lib/vendor/react-dom.min.js';
    script2.async = true;
    document.body.appendChild(script2);

    const script3 = document.createElement('script');
    script3.src = 'https://source.zoom.us/2.18.0/lib/vendor/redux.min.js';
    script3.async = true;
    document.body.appendChild(script3);

    const script4 = document.createElement('script');
    script4.src = 'https://source.zoom.us/zoom-meeting-2.18.0.min.js';
    script4.async = true;
    script4.onload = () => initializeMeeting();
    document.body.appendChild(script4);

    return () => {
      document.body.removeChild(script);
      document.body.removeChild(script2);
      document.body.removeChild(script3);
      document.body.removeChild(script4);
    };
  }, [signature]);

  const initializeMeeting = () => {
    if (!signature || !(window as any).ZoomMtg) return;

    const { ZoomMtg } = window as any;
    
    ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.0/lib', '/av');
    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareWebSDK();

    ZoomMtg.init({
      leaveUrl: window.location.origin + '/live-classes',
      success: () => {
        ZoomMtg.join({
          signature,
          meetingNumber,
          userName,
          userEmail,
          passWord: password || '',
          success: () => {
            setLoading(false);
          },
          error: (err: any) => {
            setError('Failed to join meeting');
            setLoading(false);
            onError?.(err);
          }
        });
      },
      error: (err: any) => {
        setError('Failed to initialize meeting');
        setLoading(false);
        onError?.(err);
      }
    });
  };

  if (error) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Unable to Load Meeting</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-screen">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading meeting...</p>
          </div>
        </div>
      )}
      <div ref={meetingContainerRef} id="zmmtg-root" className="w-full h-full" />
    </div>
  );
}
