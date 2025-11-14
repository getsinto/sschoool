'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ClassScheduler from '@/components/admin/live-classes/ClassScheduler'

export default function ScheduleClassPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/admin/live-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to schedule class')
      }

      const data = await response.json()
      
      // Show success message
      alert('Class scheduled successfully!')
      
      // Redirect to class details or list
      router.push(`/admin/live-classes/${data.class.id}`)
    } catch (error) {
      console.error('Error scheduling class:', error)
      alert('Failed to schedule class. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/live-classes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Classes
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule Live Class</h1>
          <p className="text-gray-600">Create and schedule a new live class</p>
        </div>
      </div>

      {/* Scheduler Form */}
      <ClassScheduler onSubmit={handleSubmit} />
    </div>
  )
}
