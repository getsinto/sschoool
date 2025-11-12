'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HelpCircle, BookOpen, MessageSquare, Video, FileText, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function HelpPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
        <p className="text-gray-600 mt-1">Get help with using the teacher platform</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search for help articles..."
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Getting Started
            </CardTitle>
            <CardDescription>Learn the basics of using the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Setting up your profile</li>
              <li>• Creating your first course</li>
              <li>• Managing students</li>
              <li>• Using the grading system</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-green-600" />
              Video Tutorials
            </CardTitle>
            <CardDescription>Step-by-step video guides</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Course creation walkthrough</li>
              <li>• Live class setup</li>
              <li>• Student communication</li>
              <li>• Analytics overview</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Documentation
            </CardTitle>
            <CardDescription>Detailed guides and references</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• Platform features</li>
              <li>• Best practices</li>
              <li>• Troubleshooting</li>
              <li>• API documentation</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-orange-600" />
            Contact Support
          </CardTitle>
          <CardDescription>Need personalized help? Reach out to our support team</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <MessageSquare className="h-6 w-6 mb-2" />
              Live Chat
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              Submit Ticket
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <HelpCircle className="h-6 w-6 mb-2" />
              FAQ
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}