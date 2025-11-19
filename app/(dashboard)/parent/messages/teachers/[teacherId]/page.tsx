'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Mail, Phone, Video, Calendar } from 'lucide-react'
import Link from 'next/link'

export default function TeacherProfilePage({ params }: { params: { teacherId: string } }) {
  const mockTeacher = {
    id: params.teacherId,
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@school.com',
    phone: '+1 (555) 123-4567',
    photo: '/avatars/teacher.jpg',
    subjects: ['Mathematics', 'Physics'],
    courses: [
      { id: '1', title: 'Advanced Mathematics', students: 25 },
      { id: '2', title: 'Physics Fundamentals', students: 20 }
    ]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/parent/messages">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Teacher Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teacher Info */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Avatar className="w-24 h-24 mx-auto">
                <AvatarImage src={mockTeacher.photo} />
                <AvatarFallback>{mockTeacher.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{mockTeacher.name}</h2>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {mockTeacher.subjects.map((subject, idx) => (
                    <Badge key={idx} variant="outline">{subject}</Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>{mockTeacher.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{mockTeacher.phone}</span>
                </div>
              </div>
              <div className="space-y-2 pt-4">
                <Button className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                <Button variant="outline" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button variant="outline" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Request Call
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Teaching */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Courses Teaching Your Child</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTeacher.courses.map(course => (
                <div key={course.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">{course.students} students</p>
                    </div>
                    <Button variant="outline" size="sm">View Course</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message History */}
      <Card>
        <CardHeader>
          <CardTitle>Message History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No previous messages</p>
        </CardContent>
      </Card>
    </div>
  )
}
