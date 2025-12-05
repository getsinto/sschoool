import Link from 'next/link'
import { Home, Search, ArrowLeft, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PublicHeader from '@/components/public/Header'
import PublicFooter from '@/components/public/Footer'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <PublicHeader />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="text-[150px] md:text-[200px] font-bold text-gray-200 leading-none">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center animate-bounce">
                  <Search className="w-12 h-12 md:w-16 md:h-16 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/" className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Go to Homepage
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
              <Link href="/courses" className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Browse Courses
              </Link>
            </Button>
          </div>

          {/* Helpful Links */}
          <div className="border-t pt-8">
            <p className="text-sm text-gray-600 mb-4">You might be looking for:</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/about" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                About Us
              </Link>
              <Link href="/courses" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Courses
              </Link>
              <Link href="/contact" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Contact
              </Link>
              <Link href="/register" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Register
              </Link>
              <Link href="/login" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Login
              </Link>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-8">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  )
}
