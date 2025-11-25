'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'About Us', href: '/about' },
  { name: 'Courses', href: '/courses' },
  { name: 'Contact Us', href: '/contact' },
  { name: 'FAQ', href: '/faq' },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
      
      // Update active section based on scroll position
      const sections = ['about', 'courses', 'contact', 'faq']
      const currentSection = sections.find(section => {
        const element = document.getElementById(section)
        if (element) {
          const rect = element.getBoundingClientRect()
          return rect.top <= 100 && rect.bottom >= 100
        }
        return false
      })
      setActiveSection(currentSection || '')
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-2xl border-b border-gray-200/50'
          : 'bg-gray-900/90 backdrop-blur-xl shadow-2xl border-b border-gray-700/30'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 lg:h-22">
          {/* Logo matching Footer */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className={cn(
                  "w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-105",
                  isScrolled ? "shadow-xl" : "shadow-2xl"
                )}>
                  <span className="text-white font-bold text-xl">SH</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className={cn(
                  "text-xl font-bold transition-colors duration-300 drop-shadow-sm",
                  isScrolled ? "text-gray-900" : "text-white"
                )}>
                  St Haroon
                </h1>
                <p className={cn(
                  "text-sm font-medium transition-colors duration-300 drop-shadow-sm",
                  isScrolled ? "text-gray-600" : "text-gray-200"
                )}>
                  Online School
                </p>
              </div>
            </Link>
          </div>

          {/* Enhanced Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative px-4 py-2 rounded-lg font-medium transition-all duration-300 group drop-shadow-sm",
                  isScrolled 
                    ? "text-gray-700 hover:text-blue-600 hover:bg-blue-50" 
                    : "text-gray-100 hover:text-white hover:bg-white/10"
                )}
              >
                {item.name}
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full"></span>
              </Link>
            ))}
          </nav>

          {/* Enhanced Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link href="/auth/login">
              <Button 
                variant="outline" 
                className={cn(
                  "font-medium transition-all duration-300 hover:scale-105 border-2 shadow-sm",
                  isScrolled 
                    ? "border-gray-300 text-gray-700 hover:text-blue-600 hover:border-blue-600 hover:bg-blue-50" 
                    : "border-gray-300 bg-white/95 text-gray-700 hover:text-blue-600 hover:border-blue-600 hover:bg-white"
                )}
              >
                Login
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-medium text-white">
                Register
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={cn(
                    "transition-colors duration-300",
                    isScrolled 
                      ? "text-gray-700 hover:text-blue-600 hover:bg-blue-50" 
                      : "text-white hover:text-white hover:bg-white/10"
                  )}
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-6 mt-6">
                  {/* Mobile Logo matching Footer */}
                  <div className="flex items-center space-x-2 pb-6 border-b">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-lg">SH</span>
                    </div>
                    <div>
                      <h1 className="text-lg font-bold text-gray-900">St Haroon</h1>
                      <p className="text-xs text-gray-600">Online School</p>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex flex-col space-y-4">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </a>
                    ))}
                  </nav>

                  {/* Mobile Auth Buttons */}
                  <div className="flex flex-col space-y-3 pt-6 border-t">
                    <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        Register
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}