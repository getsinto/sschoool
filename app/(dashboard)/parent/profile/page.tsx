'use client'

import { useState } from 'react'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Mock data
const mockParentData = {
  id: '1',
  firstName: 'Sarah',
  lastName: 'Johnson',
  email: 'sarah.johnson@example.com',
  phone: '+1 (555) 123-4567',
  address: '123 Main St, City, State 12345',
  dateOfBirth: '1985-05-15',
  avatar: '/avatars/parent.jpg',
  linkedChildren: 2,
  accountCreated: '2023-09-01'
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState(mockParentData)

  const handleSave = () => {
    // API call to update profile
    console.log('Saving profile:', profileData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setProfileData(mockParentData)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information</p>
        </div>

        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <Avatar className="w-32 h-32">
                <AvatarImage src={profileData.avatar} />
                <AvatarFallback className="text-2xl">
                  {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button variant="outline" size="sm">
                  Change Photo
                </Button>
              )}
            </div>

            {/* Profile Information */}
            <div className="flex-1 w-full space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{profileData.firstName}</span>
                    </div>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{profileData.lastName}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{profileData.email}</span>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{profileData.phone}</span>
                    </div>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  {isEditing ? (
                    <Input
                      id="address"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{profileData.address}</span>
                    </div>
                  )}
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  {isEditing ? (
                    <Input
                      id="dob"
                      type="date"
                      value={profileData.dateOfBirth}
                      onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{new Date(profileData.dateOfBirth).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Linked Children</p>
              <p className="text-2xl font-bold text-gray-900">{profileData.linkedChildren}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Account Created</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Date(profileData.accountCreated).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-gray-600">Last changed 3 months ago</p>
            </div>
            <Button variant="outline">Change Password</Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-gray-600">Add an extra layer of security</p>
            </div>
            <Button variant="outline">Enable 2FA</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
