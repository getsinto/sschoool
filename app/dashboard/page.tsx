import { redirect } from 'next/navigation'

export default function DashboardRoot() {
  // Redirect to admin dashboard by default
  // In a real app, you'd check user role and redirect accordingly
  redirect('/dashboard/admin')
}