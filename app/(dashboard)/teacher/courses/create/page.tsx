'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft, Lock } from 'lucide-react'

/**
 * Teacher Course Creation Page - BLOCKED
 * 
 * This page blocks teachers from creating courses.
 * Only administrators can create courses.
 * Teachers can manage content for courses assigned to them by administrators.
 */
export default function CreateCoursePage() {
  const router = useRouter()

  useEffect(() => {
    // Log the access attempt for security monitoring
    console.warn('Teacher attempted to access course creation page:', {
      timestamp: new Date().toISOString(),
      path: '/teacher/courses/create'
    })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Course Creation Not Available
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-1">
                Only Administrators Can Create Courses
              </h3>
              <p className="text-sm text-yellow-800">
                Teachers can manage content for courses that have been assigned to them by administrators, 
                but cannot create new courses directly.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">What You Can Do:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Manage content for courses assigned to you</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Add lessons, quizzes, and assignments to your assigned courses</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Grade student work and provide feedback</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span>Communicate with students in your courses</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Need a New Course?</h4>
            <p className="text-sm text-gray-700">
              Please contact your administrator to:
            </p>
            <ul className="space-y-2 text-sm text-gray-700 ml-4">
              <li>• Request creation of a new course</li>
              <li>• Get assigned to an existing course</li>
              <li>• Discuss course management permissions</li>
            </ul>
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <Button 
              onClick={() => router.push('/teacher/courses')}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              View My Assigned Courses
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/teacher')}
            >
              Go to Dashboard
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-xs text-gray-500">
              This restriction is in place to maintain course quality and consistency across the platform.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
