'use client'

// Redirect to create page (schedule is an alias for create)
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ScheduleLiveClassPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/teacher/live-classes/create')
  }, [router])
  
  return null
}
