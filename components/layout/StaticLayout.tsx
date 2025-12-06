import Link from 'next/link'
import { BookOpen } from 'lucide-react'

interface StaticLayoutProps {
  children: React.ReactNode
}

export default function StaticLayout({ children }: StaticLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">St Haroon School</span>
            </Link>
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600">Home</Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600">About</Link>
              <Link href="/contact" className="text-gray-700 hover:text-blue-600">Contact</Link>
              <Link href="/faq" className="text-gray-700 hover:text-blue-600">FAQ</Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth/login" 
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Login
              </Link>
              <Link 
                href="/auth/register" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <span className="ml-2 text-lg font-bold">St Haroon School</span>
              </div>
              <p className="text-gray-600 text-sm">
                Quality online education for students worldwide
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/" className="text-gray-600 hover:text-blue-600">Home</Link></li>
                <li><Link href="/about" className="text-gray-600 hover:text-blue-600">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-blue-600">Contact</Link></li>
                <li><Link href="/faq" className="text-gray-600 hover:text-blue-600">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Students</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/auth/login" className="text-gray-600 hover:text-blue-600">Student Login</Link></li>
                <li><Link href="/auth/register" className="text-gray-600 hover:text-blue-600">Register</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>info@stharoon.com</li>
                <li>+1 (555) 123-4567</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2025 St Haroon Online School. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
