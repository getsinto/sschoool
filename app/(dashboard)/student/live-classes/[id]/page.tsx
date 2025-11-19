'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Video, Calendar, Clock, User, FileText, Download,
  MessageSquare, Users, ExternalLink, Copy, CheckCircle
} from 'lucide-react'

export default function LiveClassDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [classData, setClassData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchClassDetails()
  }, [params.id])

  const fetchClassDetails = async () => {
    try {
      const response = await fetch(`/api/student/live-classes/${params.id}`)
      const data = await response.json()
      if (data.success) {
        setClassData(data.data)
      }
    } catch (error) {
      console.error('Error fetching class details:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyMeetingLink = () => {
    if (classData?.meetingLink) {
      navigator.clipboard.writeText(classData.meetingLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleJoinClass = () => {
    router.push(`/student/live-classes/join/${params.id}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!classData) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Class not found</p>
        </Card>
      </div>
    )
  }

  const canJoin = classData.status === 'live' || 
    (classData.status === 'upcoming' && classData.canJoin)

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{classData.title}</h1>
          <p className="text-muted-foreground">{classData.courseName}</p>
        </div>
        <Badge variant={
          classData.status === 'live' ? 'destructive' :
          classData.status === 'upcoming' ? 'default' : 'secondary'
        }>
          {classData.status === 'live' ? '🔴 Live Now' : 
           classData.status === 'upcoming' ? 'Upcoming' : 'Completed'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Class Info Card */}
          <Card className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{classData.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-medium">{classData.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Teacher</p>
                  <p className="font-medium">{classData.teacherName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Platform</p>
                  <p className="font-medium">{classData.platform}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="materials">Materials</TabsTrigger>
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
              <TabsTrigger value="chat">Q&A</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card className="p-6">
                <h3 className="font-semibold mb-3">Description</h3>
                <p className="text-muted-foreground">{classData.description}</p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-3">Learning Objectives</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {classData.objectives?.map((obj: string, idx: number) => (
                    <li key={idx}>{obj}</li>
                  ))}
                </ul>
              </Card>
            </TabsContent>

            <TabsContent value="materials" className="space-y-4">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Class Materials</h3>
                {classData.materials?.length > 0 ? (
                  <div className="space-y-3">
                    {classData.materials.map((material: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{material.name}</p>
                            <p className="text-sm text-muted-foreground">{material.size}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No materials uploaded yet</p>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="agenda" className="space-y-4">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Class Agenda</h3>
                {classData.agenda ? (
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap">{classData.agenda}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No agenda available</p>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="chat" className="space-y-4">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Q&A Transcript</h3>
                {classData.chatTranscript ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {classData.chatTranscript.map((msg: any, idx: number) => (
                      <div key={idx} className="border-l-2 border-primary pl-4">
                        <p className="font-medium text-sm">{msg.user}</p>
                        <p className="text-muted-foreground">{msg.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{msg.time}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    {classData.status === 'completed' ? 'No Q&A transcript saved' : 'Q&A will be available after class'}
                  </p>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Join/Recording Card */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Access Class</h3>
            
            {classData.status === 'live' || canJoin ? (
              <div className="space-y-4">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleJoinClass}
                >
                  <Video className="mr-2 h-5 w-5" />
                  Join Live Class
                </Button>
                
                {classData.meetingLink && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Meeting Link:</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={classData.meetingLink}
                        readOnly
                        className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
                      />
                      <Button size="sm" variant="outline" onClick={copyMeetingLink}>
                        {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}
                
                {classData.meetingPassword && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Password:</p>
                    <p className="font-mono font-semibold">{classData.meetingPassword}</p>
                  </div>
                )}
              </div>
            ) : classData.status === 'completed' && classData.recordingUrl ? (
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => window.open(classData.recordingUrl, '_blank')}
              >
                <Video className="mr-2 h-5 w-5" />
                Watch Recording
              </Button>
            ) : classData.status === 'upcoming' ? (
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Class starts in:</p>
                <p className="text-2xl font-bold">{classData.countdown}</p>
                <p className="text-xs text-muted-foreground">Join button will be enabled 15 minutes before</p>
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Recording not available</p>
            )}
          </Card>

          {/* Teacher Card */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Teacher</h3>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">{classData.teacherName}</p>
                <p className="text-sm text-muted-foreground">{classData.teacherTitle}</p>
              </div>
            </div>
          </Card>

          {/* Course Context */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Course</h3>
            <p className="font-medium mb-2">{classData.courseName}</p>
            <p className="text-sm text-muted-foreground mb-4">{classData.courseDescription}</p>
            <Button variant="outline" className="w-full" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Course
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
