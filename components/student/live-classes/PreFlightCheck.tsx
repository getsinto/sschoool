'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Video, Mic, Wifi, Monitor, CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface PreFlightCheckProps {
  onComplete: (results: {
    camera: boolean
    microphone: boolean
    internet: boolean
    system: boolean
  }) => void
  classId: string
}

export default function PreFlightCheck({ onComplete, classId }: PreFlightCheckProps) {
  const [checking, setChecking] = useState(false)
  const [progress, setProgress] = useState(0)
  const [checks, setChecks] = useState({
    camera: { status: 'pending', message: '' },
    microphone: { status: 'pending', message: '' },
    internet: { status: 'pending', message: '' },
    system: { status: 'pending', message: '' }
  })
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const runChecks = async () => {
    setChecking(true)
    setProgress(0)

    // Check Camera
    await checkCamera()
    setProgress(25)

    // Check Microphone
    await checkMicrophone()
    setProgress(50)

    // Check Internet
    await checkInternet()
    setProgress(75)

    // Check System
    await checkSystem()
    setProgress(100)

    setChecking(false)

    // Call onComplete with results
    const results = {
      camera: checks.camera.status === 'success',
      microphone: checks.microphone.status === 'success',
      internet: checks.internet.status === 'success',
      system: checks.system.status === 'success'
    }
    
    setTimeout(() => onComplete(results), 500)
  }

  const checkCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true })
      setStream(mediaStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }

      setChecks(prev => ({
        ...prev,
        camera: { status: 'success', message: 'Camera is working' }
      }))
    } catch (error) {
      setChecks(prev => ({
        ...prev,
        camera: { status: 'error', message: 'Camera access denied or not available' }
      }))
    }
  }

  const checkMicrophone = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Test audio levels
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(mediaStream)
      microphone.connect(analyser)
      
      mediaStream.getTracks().forEach(track => track.stop())

      setChecks(prev => ({
        ...prev,
        microphone: { status: 'success', message: 'Microphone is working' }
      }))
    } catch (error) {
      setChecks(prev => ({
        ...prev,
        microphone: { status: 'error', message: 'Microphone access denied or not available' }
      }))
    }
  }

  const checkInternet = async () => {
    try {
      const startTime = Date.now()
      await fetch('/api/health', { method: 'HEAD' })
      const latency = Date.now() - startTime

      if (latency < 100) {
        setChecks(prev => ({
          ...prev,
          internet: { status: 'success', message: `Excellent connection (${latency}ms)` }
        }))
      } else if (latency < 300) {
        setChecks(prev => ({
          ...prev,
          internet: { status: 'success', message: `Good connection (${latency}ms)` }
        }))
      } else {
        setChecks(prev => ({
          ...prev,
          internet: { status: 'warning', message: `Slow connection (${latency}ms)` }
        }))
      }
    } catch (error) {
      setChecks(prev => ({
        ...prev,
        internet: { status: 'error', message: 'No internet connection' }
      }))
    }
  }

  const checkSystem = async () => {
    try {
      const userAgent = navigator.userAgent
      const isChrome = /Chrome/.test(userAgent)
      const isFirefox = /Firefox/.test(userAgent)
      const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent)
      const isEdge = /Edg/.test(userAgent)

      if (isChrome || isFirefox || isSafari || isEdge) {
        setChecks(prev => ({
          ...prev,
          system: { status: 'success', message: 'Browser is compatible' }
        }))
      } else {
        setChecks(prev => ({
          ...prev,
          system: { status: 'warning', message: 'Browser may not be fully supported' }
        }))
      }
    } catch (error) {
      setChecks(prev => ({
        ...prev,
        system: { status: 'error', message: 'System check failed' }
      }))
    }
  }

  useEffect(() => {
    return () => {
      // Cleanup: stop all media tracks
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <CheckCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    }
  }

  return (
    <Card className="p-8">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Pre-Flight Check</h2>
          <p className="text-muted-foreground">
            We'll test your camera, microphone, and internet connection
          </p>
        </div>

        {/* Video Preview */}
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          {!stream && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Video className="h-12 w-12 text-white/50" />
            </div>
          )}
        </div>

        {/* Progress */}
        {checking && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-center text-muted-foreground">
              Running system checks... {progress}%
            </p>
          </div>
        )}

        {/* Check Results */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Video className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Camera</p>
                <p className="text-sm text-muted-foreground">{checks.camera.message || 'Not tested'}</p>
              </div>
            </div>
            {getStatusIcon(checks.camera.status)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Mic className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Microphone</p>
                <p className="text-sm text-muted-foreground">{checks.microphone.message || 'Not tested'}</p>
              </div>
            </div>
            {getStatusIcon(checks.microphone.status)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Wifi className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Internet Connection</p>
                <p className="text-sm text-muted-foreground">{checks.internet.message || 'Not tested'}</p>
              </div>
            </div>
            {getStatusIcon(checks.internet.status)}
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Monitor className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">System Requirements</p>
                <p className="text-sm text-muted-foreground">{checks.system.message || 'Not tested'}</p>
              </div>
            </div>
            {getStatusIcon(checks.system.status)}
          </div>
        </div>

        {/* Action Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={runChecks}
          disabled={checking}
        >
          {checking ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Running Checks...
            </>
          ) : (
            'Start System Check'
          )}
        </Button>
      </div>
    </Card>
  )
}
