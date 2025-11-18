// Redirect to create page (schedule is an alias for create)
import { redirect } from 'next/navigation'

export default function ScheduleLiveClassPage() {
  redirect('/teacher/live-classes/create')
}
