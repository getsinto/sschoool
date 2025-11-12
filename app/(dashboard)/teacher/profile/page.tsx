'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Edit, Settings, Award, BookOpen } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Profile</h1>
          <p className="text-gray-600 mt-1">Manage your profile and teaching credentials</p>
        </div>
        <Button>
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src="/avatars/teacher.jpg" alt="Teacher" />
                <AvatarFallback>TC</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold">Teacher Name</h3>
              <p className="text-gray-600">Mathematics & Physics</p>
              <div className="flex items-center gap-2 mt-2">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Certified Educator</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Teaching Statistics</CardTitle>
            <CardDescription>Your teaching performance overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <p className="text-sm text-gray-600">Courses Created</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">245</div>
                <p className="text-sm text-gray-600">Students Taught</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">4.8</div>
                <p className="text-sm text-gray-600">Average Rating</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">156h</div>
                <p className="text-sm text-gray-600">Teaching Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Qualifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">Master of Science in Mathematics</h4>
                <p className="text-sm text-gray-600">University Name, 2018</p>
              </div>
              <div>
                <h4 className="font-medium">Teaching Certification</h4>
                <p className="text-sm text-gray-600">State Board of Education, 2019</p>
              </div>
              <div>
                <h4 className="font-medium">Online Teaching Certificate</h4>
                <p className="text-sm text-gray-600">EdTech Institute, 2020</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <User className="w-4 h-4 mr-2" />
              Personal Information
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-2" />
              Privacy Settings
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Award className="w-4 h-4 mr-2" />
              Certifications
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}