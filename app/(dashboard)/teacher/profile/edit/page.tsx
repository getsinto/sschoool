'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft, Upload, Save, User } from 'lucide-react'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function EditProfilePage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // TODO: Implement save functionality
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/teacher/profile">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
        <p className="text-gray-600 mt-1">Update your profile information and teaching credentials</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
              <CardDescription>Update your profile picture</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/avatars/teacher.jpg" alt="Profile" />
                  <AvatarFallback>TC</AvatarFallback>
                </Avatar>
                <div>
                  <Button type="button" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New Photo
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    JPG, PNG or GIF. Max size 2MB.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your personal and professional details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" placeholder="John" defaultValue="John" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" placeholder="Doe" defaultValue="Doe" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Professional Title *</Label>
                <Input 
                  id="title" 
                  placeholder="e.g., Senior Mathematics Teacher" 
                  defaultValue="Senior Mathematics Teacher" 
                  required 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john.doe@school.edu" 
                    defaultValue="john.doe@school.edu" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+1 (555) 123-4567" 
                    defaultValue="+1 (555) 123-4567" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio *</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Tell students about yourself, your teaching philosophy, and experience..." 
                  rows={5}
                  defaultValue="Experienced mathematics and physics teacher with over 10 years of teaching experience. Passionate about making complex concepts accessible and engaging for all students."
                  required
                />
                <p className="text-sm text-gray-500">This will be displayed on your public profile</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Teaching Information</CardTitle>
              <CardDescription>Your areas of expertise and subjects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select defaultValue="mathematics">
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                    <SelectItem value="languages">Languages</SelectItem>
                    <SelectItem value="arts">Arts</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subjects">Subjects Taught</Label>
                <Input 
                  id="subjects" 
                  placeholder="e.g., Algebra, Calculus, Physics" 
                  defaultValue="Algebra, Calculus, Physics"
                />
                <p className="text-sm text-gray-500">Separate multiple subjects with commas</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grades">Grade Levels</Label>
                <Input 
                  id="grades" 
                  placeholder="e.g., 9-12" 
                  defaultValue="9-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input 
                  id="experience" 
                  type="number" 
                  placeholder="10" 
                  defaultValue="10"
                  min="0"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
              <CardDescription>Optional: Add your professional social media profiles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                <Input 
                  id="linkedin" 
                  type="url" 
                  placeholder="https://linkedin.com/in/yourprofile" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Personal Website</Label>
                <Input 
                  id="website" 
                  type="url" 
                  placeholder="https://yourwebsite.com" 
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/teacher/profile">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
