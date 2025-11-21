'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import NotificationBell from '@/components/notifications/NotificationBell'
import { 
  LayoutDashboard,
  Users,
  BookOpen,
  Video,
  CreditCard,
  Library,
  MessageSquare,
  BarChart3,
  Settings,
  Search,
  Bell,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  UserCircle,
  Home,
  PlusCircle,
  ClipboardCheck,
  HelpCircle,
  GraduationCap,
  FileText,
  Award,
  Trophy
} from 'lucide-react'

const adminSidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Users, label: 'Users', href: '/admin/users' },
  { icon: BookOpen, label: 'Courses', href: '/admin/courses' },
  { icon: Video, label: 'Live Classes', href: '/admin/live-classes' },
  { icon: CreditCard, label: 'Payments', href: '/admin/payments' },
  { icon: Library, label: 'Content Library', href: '/admin/content-library' },
  { icon: MessageSquare, label: 'Communication', href: '/admin/communication' },
  { icon: BarChart3, label: 'Reports', href: '/admin/reports' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
]

const teacherSidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/teacher' },
  { icon: BookOpen, label: 'My Courses', href: '/teacher/courses' },
  { icon: PlusCircle, label: 'Course Builder', href: '/teacher/course-builder' },
  { icon: Video, label: 'Live Classes', href: '/teacher/live-classes' },
  { icon: GraduationCap, label: 'Students', href: '/teacher/students' },
  { icon: ClipboardCheck, label: 'Grading', href: '/teacher/grading' },
  { icon: MessageSquare, label: 'Messages', href: '/teacher/messages' },
  { icon: HelpCircle, label: 'Support', href: '/teacher/support' },
  { icon: User, label: 'Profile', href: '/teacher/profile' },
]

const studentSidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/student' },
  { icon: BookOpen, label: 'My Courses', href: '/student/courses' },
  { icon: Video, label: 'Live Classes', href: '/student/live-classes' },
  { icon: FileText, label: 'Assignments', href: '/student/assignments' },
  { icon: HelpCircle, label: 'Quizzes', href: '/student/quizzes' },
  { icon: Award, label: 'Grades', href: '/student/grades' },
  { icon: BarChart3, label: 'Progress', href: '/student/progress' },
  { icon: GraduationCap, label: 'Certificates', href: '/student/certificates' },
  { icon: Trophy, label: 'Achievements', href: '/student/achievements' },
  { icon: MessageSquare, label: 'Messages', href: '/student/messages' },
  { icon: HelpCircle, label: 'Support', href: '/student/support' },
  { icon: User, label: 'Profile', href: '/student/profile' },
]

const parentSidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/parent' },
  { icon: Users, label: 'My Children', href: '/parent/children' },
  { icon: BarChart3, label: 'Performance', href: '/parent/performance' },
  { icon: ClipboardCheck, label: 'Attendance', href: '/parent/attendance' },
  { icon: CreditCard, label: 'Payments', href: '/parent/payments' },
  { icon: MessageSquare, label: 'Messages', href: '/parent/messages' },
  { icon: FileText, label: 'Reports', href: '/parent/reports' },
  { icon: HelpCircle, label: 'Support', href: '/parent/support' },
  { icon: User, label: 'Profile', href: '/parent/profile' },
  { icon: Settings, label: 'Settings', href: '/parent/settings' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [actualUserRole, setActualUserRole] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { signOut, user } = useAuth()

  // Fetch actual user role from database
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) return
      
      try {
        const response = await fetch('/api/user/role')
        const data = await response.json()
        if (data.role) {
          setActualUserRole(data.role)
        }
      } catch (error) {
        console.error('Error fetching user role:', error)
      }
    }
    
    fetchUserRole()
  }, [user])

  // Determine user role from pathname or actual role for shared routes
  const isTeacher = pathname.startsWith('/teacher') || (pathname.startsWith('/support') && actualUserRole === 'teacher')
  const isAdmin = pathname.startsWith('/admin') || (pathname.startsWith('/support') && actualUserRole === 'admin')
  const isStudent = pathname.startsWith('/student') || (pathname.startsWith('/support') && actualUserRole === 'student')
  const isParent = pathname.startsWith('/parent') || (pathname.startsWith('/support') && actualUserRole === 'parent')
  
  const sidebarItems = isTeacher ? teacherSidebarItems : isStudent ? studentSidebarItems : isParent ? parentSidebarItems : adminSidebarItems
  const userRole = isTeacher ? 'Teacher' : isStudent ? 'Student' : isParent ? 'Parent' : 'Admin'
  const panelTitle = isTeacher ? 'Teacher Portal' : isStudent ? 'Student Portal' : isParent ? 'Parent Portal' : 'Admin Panel'

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs = segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/')
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ')
      return { href, label }
    })
    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SH</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">St Haroon</h1>
              <p className="text-xs text-gray-500">{panelTitle}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-gray-200">
          <Link
            href="/"
            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Back to Website</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            {/* Left side - Mobile menu + Breadcrumbs */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              {/* Breadcrumbs */}
              <nav className="hidden md:flex items-center space-x-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.href} className="flex items-center space-x-2">
                    {index > 0 && <span className="text-gray-400">/</span>}
                    <Link
                      href={crumb.href}
                      className={`${
                        index === breadcrumbs.length - 1
                          ? 'text-gray-900 font-medium'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {crumb.label}
                    </Link>
                  </div>
                ))}
              </nav>
            </div>

            {/* Right side - Search, Notifications, Profile */}
            <div className="flex items-center space-x-4">
              {/* Global Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-64 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Notifications */}
              <NotificationBell />

              {/* Profile Dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="hidden md:block text-sm font-medium">{userRole} User</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      href={`/${userRole.toLowerCase()}/profile`}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <UserCircle className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      href={`/${userRole.toLowerCase()}/settings`}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <hr className="my-2" />
                    <button
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      onClick={async () => {
                        setProfileDropdownOpen(false)
                        await signOut()
                        router.push('/auth/login')
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}