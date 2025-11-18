'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Camera, 
  Mic, 
  Volume2, 
  Wifi, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw
} from 'lucide-react'

interface TestResult {
  status: 'pending' | 'testing' | 'passed' | 'failed' | 'warning'
  message: string
}

export function PreFlightCheck() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const [cameraTest, setCameraTest] = useState<TestResult>({
    status: 'pending',
    message: 'Not tested'
  })

  const [micTest, setMicTest] = useState<TestResult>({
    status: 'pending',
    message: 'Not tested'
  })

  const [speakerTest, setSpeakerTest] = useState<TestResult>({
    status: 'pending',
    message: 'Not tested'
  })

  const [networkTest, setNetworkTest] = useState<TestResult>({
    status: 'pending',
    message: 'Not tested'
  })

  const [browserTest, setBrowserTest] = useState<TestResult>({
    status: 'pending',
    message: 'Not tested'
  })

  const [micLevel, setMicLevel] = useState(0)

  useEffect(() => {
    // Run browser compatibility check on mount
    testBrowserCompatibility()
    
    return () => {
      // Cleanup
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  const testCamera = async () => {
    setCameraTest({ status: 'testing', message: 'Testing camera...' })

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }

      setStream(mediaStream)
      setCameraTest({ 
        status: 'passed', 
        message: 'Camera is working properly' 
      })
    } catch (error: any) {
      setCameraTest({ 
        status: 'failed', 
        message: error.message || 'Camera access denied or not available' 
      })
    }
  }

  const testMicrophone = async () => {
    setMicTest({ status: 'testing', message: 'Testing microphone...' })

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: true,
        video: false
      })

      // Create audio context to analyze microphone input
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(mediaStream)
      microphone.connect(analyser)
      analyser.fftSize = 256

      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      // Monitor microphone level
      const checkLevel = () => {
        analyser.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        setMicLevel(Math.min(100, average))
      }

      const interval = setInterval(checkLevel, 100)

      setTimeout(() => {
        clearInterval(interval)
        mediaStream.getTracks().forEach(track => track.stop())
        
        if (micLevel > 10) {
          setMicTest({ 
            status: 'passed', 
            message: 'Microphone is working properly' 
          })
        } else {
          setMicTest({ 
            status: 'warning', 
            message: 'Microphone detected but no sound detected. Please speak to test.' 
          })
        }
      }, 5000)

    } catch (error: any) {
      setMicTest({ 
        status: 'failed', 
        message: error.message || 'Microphone access denied or not available' 
      })
    }
  }

  const testSpeakers = () => {
    setSpeakerTest({ status: 'testing', message: 'Playing test sound...' })

    const audio = new Audio('/test-sound.mp3') // You'll need to add a test sound file
    
    audio.play()
      .then(() => {
        setSpeakerTest({ 
          status: 'passed', 
          message: 'If you heard the sound, speakers are working' 
        })
      })
      .catch((error) => {
        setSpeakerTest({ 
          status: 'failed', 
          message: 'Failed to play test sound' 
        })
      })
  }

  const testNetwork = async () => {
    setNetworkTest({ status: 'testing', message: 'Testing network speed...' })

    try {
      const startTime = Date.now()
      const response = await fetch('https://www.google.com/favicon.ico', { 
        cache: 'no-store' 
      })
      const endTime = Date.now()
      const duration = endTime - startTime

      if (duration < 100) {
        setNetworkTest({ 
          status: 'passed', 
          message: `Excellent connection (${duration}ms)` 
        })
      } else if (duration < 300) {
        setNetworkTest({ 
          status: 'passed', 
          message: `Good connection (${duration}ms)` 
        })
      } else if (duration < 1000) {
        setNetworkTest({ 
          status: 'warning', 
          message: `Slow connection (${duration}ms). Video quality may be affected.` 
        })
      } else {
        setNetworkTest({ 
          status: 'failed', 
          message: `Very slow connection (${duration}ms). Not recommended for live classes.` 
        })
      }
    } catch (error) {
      setNetworkTest({ 
        status: 'failed', 
        message: 'Network test failed. Please check your internet connection.' 
      })
    }
  }

  const testBrowserCompatibility = () => {
    setBrowserTest({ status: 'testing', message: 'Checking browser...' })

    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    const hasWebRTC = !!(window.RTCPeerConnection)
    
    if (hasGetUserMedia && hasWebRTC) {
      setBrowserTest({ 
        status: 'passed', 
        message: 'Browser is compatible with live classes' 
      })
    } else {
      setBrowserTest({ 
        status: 'failed', 
        message: 'Browser does not support required features. Please use Chrome, Firefox, or Edge.' 
      })
    }
  }

  const runAllTests = async () => {
    await testBrowserCompatibility()
    await testCamera()
    await testMicrophone()
    testSpeakers()
    await testNetwork()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case 'testing':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-100 text-green-800">Passed</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case 'testing':
        return <Badge className="bg-blue-100 text-blue-800">Testing...</Badge>
      default:
        return <Badge variant="outline">Not Tested</Badge>
    }
  }

  const allTestsPassed = [cameraTest, micTest, speakerTest, networkTest, browserTest]
    .every(test => test.status === 'passed')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Pre-Flight Check</CardTitle>
            <Button onClick={runAllTests}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Run All Tests
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Camera Test */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Camera className="w-5 h-5 text-gray-600" />
                <div>
                  <h4 className="font-medium">Camera</h4>
                  <p className="text-sm text-gray-600">{cameraTest.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(cameraTest.status)}
                <Button variant="outline" size="sm" onClick={testCamera}>
                  Test
                </Button>
              </div>
            </div>
            {stream && (
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Microphone Test */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mic className="w-5 h-5 text-gray-600" />
                <div>
                  <h4 className="font-medium">Microphone</h4>
                  <p className="text-sm text-gray-600">{micTest.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(micTest.status)}
                <Button variant="outline" size="sm" onClick={testMicrophone}>
                  Test
                </Button>
              </div>
            </div>
            {micTest.status === 'testing' && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Speak into your microphone...</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${micLevel}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Speaker Test */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-gray-600" />
              <div>
                <h4 className="font-medium">Speakers</h4>
                <p className="text-sm text-gray-600">{speakerTest.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(speakerTest.status)}
              <Button variant="outline" size="sm" onClick={testSpeakers}>
                Test
              </Button>
            </div>
          </div>

          {/* Network Test */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wifi className="w-5 h-5 text-gray-600" />
              <div>
                <h4 className="font-medium">Network Connection</h4>
                <p className="text-sm text-gray-600">{networkTest.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(networkTest.status)}
              <Button variant="outline" size="sm" onClick={testNetwork}>
                Test
              </Button>
            </div>
          </div>

          {/* Browser Compatibility */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(browserTest.status)}
              <div>
                <h4 className="font-medium">Browser Compatibility</h4>
                <p className="text-sm text-gray-600">{browserTest.message}</p>
              </div>
            </div>
            {getStatusBadge(browserTest.status)}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardContent className="pt-6">
          {allTestsPassed ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                All Systems Ready!
              </h3>
              <p className="text-gray-600">
                Your device is ready for live classes
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Some Tests Need Attention
              </h3>
              <p className="text-gray-600">
                Please resolve the issues above before starting your class
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
