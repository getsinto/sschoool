'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PreFlightCheck from '@/components/student/live-classes/PreFlightCheck'
import { Video, Mic, Wifi, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function JoinLiveClassPage() {
  const params = useParams()
  const router = useRouter()
  const [step, setStep] = useState<'preflight' | 'ready' | 'joining'>('preflight')
  const [displayName, setDisplayName] = useState('')
  const [checks, setChecks] = useState({
    camera: false,
    microphone: false,
    internet: false,
    system: false
  })
  const [joinUrl, setJoinUrl] = useState('')

  const handlePreFlightComplete = (results: any) => {
    setChecks(results)
    const allPassed = Object.values(results).every(v => v === true)
    if (allPassed) {
      setStep('ready')
    }
  }

  const handleJoinClass = async () => {
    if (!displayName.trim()) {
      alert('Please enter your display name')
      return
    }

    setStep('joining')

    try {
      const response = await fetch(`/api/student/live-classes/${params.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName })
      })

      const data = await response.json()
      
      if (data.success && data.data.joinUrl) {
        // Redirect to external meeting platform
        window.location.href = data.data.joinUrl
      } else {
        alert('Failed to generate join link')
        setStep('ready')
      }
    } catch (error) {
      console.error('Error joining class:', error)
      alert('Failed to join class')
      setStep('ready')
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Join Live Class</h1>
          <p className="text-muted-foreground">
            Complete the pre-flight check before joining
          </p>
        </div>

        {step === 'preflight' && (
          <PreFlightCheck 
            onComplete={handlePreFlightComplete}
            classId={params.id as string}
          />
        )}

        {step === 'ready' && (
          <Card className="p-8">
            <div className="space-y-6">
              {/* System Check Results */}
              <div className="space-y-3">
                <h3 className="font-semibold">System Check Results</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    {checks.camera ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span>Camera</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {checks.microphone ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span>Microphone</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {checks.internet ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span>Internet Connection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {checks.system ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span>System Requirements</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      placeholder="Enter your name as it will appear in class"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="mt-2"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      This is how other participants will see you
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setStep('preflight')}
                      className="flex-1"
                    >
                      Run Check Again
                    </Button>
                    <Button
                      onClick={handleJoinClass}
                      disabled={!displayName.trim()}
                      className="flex-1"
                      size="lg"
                    >
                      <Video className="mr-2 h-5 w-5" />
                      Join Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {step === 'joining' && (
          <Card className="p-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <h3 className="text-xl font-semibold">Joining Class...</h3>
              <p className="text-muted-foreground">
                Please wait while we connect you to the live class
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
