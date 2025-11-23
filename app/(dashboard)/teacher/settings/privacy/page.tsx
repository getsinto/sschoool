'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save, Shield } from 'lucide-react'
import Link from 'next/link'

export default function PrivacySettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    profileVisibility: true,
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    showOnlineStatus: true,
    shareStatistics: false,
    allowStudentReviews: true,
    showCourseEnrollments: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // TODO: Implement save functionality
    setTimeout(() => setIsLoading(false), 1000)
  }

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
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
        <h1 className="text-3xl font-bold text-gray-900">Privacy Settings</h1>
        <p className="text-gray-600 mt-1">Control your privacy and data sharing preferences</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Profile Visibility
              </CardTitle>
              <CardDescription>Control who can see your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="profileVisibility">Public Profile</Label>
                  <p className="text-sm text-gray-500">Make your profile visible to all users</p>
                </div>
                <Switch
                  id="profileVisibility"
                  checked={settings.profileVisibility}
                  onCheckedChange={() => handleToggle('profileVisibility')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showEmail">Show Email Address</Label>
                  <p className="text-sm text-gray-500">Display your email on your public profile</p>
                </div>
                <Switch
                  id="showEmail"
                  checked={settings.showEmail}
                  onCheckedChange={() => handleToggle('showEmail')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showPhone">Show Phone Number</Label>
                  <p className="text-sm text-gray-500">Display your phone number on your public profile</p>
                </div>
                <Switch
                  id="showPhone"
                  checked={settings.showPhone}
                  onCheckedChange={() => handleToggle('showPhone')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showOnlineStatus">Show Online Status</Label>
                  <p className="text-sm text-gray-500">Let others see when you're online</p>
                </div>
                <Switch
                  id="showOnlineStatus"
                  checked={settings.showOnlineStatus}
                  onCheckedChange={() => handleToggle('showOnlineStatus')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Communication Preferences</CardTitle>
              <CardDescription>Manage how others can contact you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowMessages">Allow Direct Messages</Label>
                  <p className="text-sm text-gray-500">Let students and parents send you messages</p>
                </div>
                <Switch
                  id="allowMessages"
                  checked={settings.allowMessages}
                  onCheckedChange={() => handleToggle('allowMessages')}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Sharing</CardTitle>
              <CardDescription>Control what information is shared publicly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="shareStatistics">Share Teaching Statistics</Label>
                  <p className="text-sm text-gray-500">Display your teaching hours and student count</p>
                </div>
                <Switch
                  id="shareStatistics"
                  checked={settings.shareStatistics}
                  onCheckedChange={() => handleToggle('shareStatistics')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allowStudentReviews">Allow Student Reviews</Label>
                  <p className="text-sm text-gray-500">Let students leave reviews on your profile</p>
                </div>
                <Switch
                  id="allowStudentReviews"
                  checked={settings.allowStudentReviews}
                  onCheckedChange={() => handleToggle('allowStudentReviews')}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="showCourseEnrollments">Show Course Enrollments</Label>
                  <p className="text-sm text-gray-500">Display enrollment numbers on your courses</p>
                </div>
                <Switch
                  id="showCourseEnrollments"
                  checked={settings.showCourseEnrollments}
                  onCheckedChange={() => handleToggle('showCourseEnrollments')}
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
