'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  Lock, 
  User, 
  Globe, 
  Shield,
  Save,
  Eye,
  EyeOff
} from 'lucide-react'

export default function StudentSettingsPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [notifications, setNotifications] = useState({
    emailNewCourse: true,
    emailAssignmentDue: true,
    emailQuizAvailable: true,
    emailGradePosted: true,
    emailMessages: true,
    pushAssignmentDue: true,
    pushQuizAvailable: true,
    pushGradePosted: true,
    pushMessages: true
  })

  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showProgress: false,
    allowMessages: true
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="account" className="space-y-6">
        <TabsList>
          <TabsTrigger value="account" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Account</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Privacy</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Lock className="w-4 h-4" />
            <span>Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="john.doe@example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade">Grade Level</Label>
                <select
                  id="grade"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Grade 9</option>
                  <option>Grade 10</option>
                  <option>Grade 11</option>
                  <option>Grade 12</option>
                </select>
              </div>

              <Button className="w-full md:w-auto">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Preferences</CardTitle>
              <CardDescription>Configure your learning settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>UTC-5 (Eastern Time)</option>
                  <option>UTC-6 (Central Time)</option>
                  <option>UTC-7 (Mountain Time)</option>
                  <option>UTC-8 (Pacific Time)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Preferred Language</Label>
                <select
                  id="language"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>

              <Button className="w-full md:w-auto">
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Choose what emails you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Course Enrollment</Label>
                  <p className="text-sm text-gray-500">Get notified when you enroll in a new course</p>
                </div>
                <Switch
                  checked={notifications.emailNewCourse}
                  onCheckedChange={(checked) => setNotifications({...notifications, emailNewCourse: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Assignment Due Dates</Label>
                  <p className="text-sm text-gray-500">Reminders for upcoming assignment deadlines</p>
                </div>
                <Switch
                  checked={notifications.emailAssignmentDue}
                  onCheckedChange={(checked) => setNotifications({...notifications, emailAssignmentDue: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Quiz Available</Label>
                  <p className="text-sm text-gray-500">Get notified when new quizzes are posted</p>
                </div>
                <Switch
                  checked={notifications.emailQuizAvailable}
                  onCheckedChange={(checked) => setNotifications({...notifications, emailQuizAvailable: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Grades Posted</Label>
                  <p className="text-sm text-gray-500">Get notified when grades are posted</p>
                </div>
                <Switch
                  checked={notifications.emailGradePosted}
                  onCheckedChange={(checked) => setNotifications({...notifications, emailGradePosted: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Messages</Label>
                  <p className="text-sm text-gray-500">Get notified when you receive new messages</p>
                </div>
                <Switch
                  checked={notifications.emailMessages}
                  onCheckedChange={(checked) => setNotifications({...notifications, emailMessages: checked})}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
              <CardDescription>Manage your push notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Assignment Due Dates</Label>
                  <p className="text-sm text-gray-500">Push notifications for deadlines</p>
                </div>
                <Switch
                  checked={notifications.pushAssignmentDue}
                  onCheckedChange={(checked) => setNotifications({...notifications, pushAssignmentDue: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Quiz Available</Label>
                  <p className="text-sm text-gray-500">Push notifications for new quizzes</p>
                </div>
                <Switch
                  checked={notifications.pushQuizAvailable}
                  onCheckedChange={(checked) => setNotifications({...notifications, pushQuizAvailable: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Grades Posted</Label>
                  <p className="text-sm text-gray-500">Push notifications for new grades</p>
                </div>
                <Switch
                  checked={notifications.pushGradePosted}
                  onCheckedChange={(checked) => setNotifications({...notifications, pushGradePosted: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Messages</Label>
                  <p className="text-sm text-gray-500">Push notifications for messages</p>
                </div>
                <Switch
                  checked={notifications.pushMessages}
                  onCheckedChange={(checked) => setNotifications({...notifications, pushMessages: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control who can see your information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Profile</Label>
                  <p className="text-sm text-gray-500">Allow others to view your profile</p>
                </div>
                <Switch
                  checked={privacy.showProfile}
                  onCheckedChange={(checked) => setPrivacy({...privacy, showProfile: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Progress</Label>
                  <p className="text-sm text-gray-500">Display your course progress publicly</p>
                </div>
                <Switch
                  checked={privacy.showProgress}
                  onCheckedChange={(checked) => setPrivacy({...privacy, showProgress: checked})}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Direct Messages</Label>
                  <p className="text-sm text-gray-500">Let teachers and students message you</p>
                </div>
                <Switch
                  checked={privacy.allowMessages}
                  onCheckedChange={(checked) => setPrivacy({...privacy, allowMessages: checked})}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                />
              </div>

              <Button className="w-full md:w-auto">
                <Lock className="w-4 h-4 mr-2" />
                Update Password
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable 2FA</Label>
                  <p className="text-sm text-gray-500">Require a code in addition to your password</p>
                </div>
                <Badge variant="outline">Coming Soon</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
