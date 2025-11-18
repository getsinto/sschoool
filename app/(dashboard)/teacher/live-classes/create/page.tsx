'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ClassScheduler } from '@/components/teacher/live-classes/ClassScheduler'

// Mock courses - would come from API
const mockCourses = [
  { id: 'course-1', title: 'Grade 10 Mathematics' },
  { id: 'course-2', title: 'Grade 9 Physics' },
  { id: 'course-3', title: 'Grade 8 English' }
]

export default function CreateLiveClassPage() {
  const router = useRouter()

  const handleSchedule = async (classData: any) => {
    try {
      // TODO: Call API to create class
      const response = await fetch('/api/teacher/live-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData)
      })

      if (response.ok) {
        router.push('/dashboard/teacher/live-classes')
      } else {
        alert('Failed to schedule class')
      }
    } catch (error) {
      console.error('Error scheduling class:', error)
      alert('Failed to schedule class')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Schedule Live Class</h1>
          <p className="text-gray-600 mt-1">Create a new live class session for your students</p>
        </div>
      </div>

      <ClassScheduler
        onSchedule={handleSchedule}
        courses={mockCourses}
      />
    </div>
  )
}
