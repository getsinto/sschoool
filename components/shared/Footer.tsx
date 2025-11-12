import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react'

function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-12">
          {/* Logo and About Section - Takes more space */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center space-x-3 group mb-6">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                  <span className="text-white font-bold text-2xl">SH</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white drop-shadow-sm">
                  St Haroon
                </h1>
                <p className="text-sm font-medium text-gray-300 drop-shadow-sm">
                  Online School
                </p>
              </div>
            </Link>
            
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Empowering students worldwide with quality online education from Pre-Nursery to Grade 10. 
              Join thousands of students learning with certified teachers.
            </p>
            
            {/* Social Media Links */}
            <div className="flex space-x-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800/50 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50 backdrop-blur-sm border border-gray-700/50 hover:border-blue-500"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800/50 hover:bg-sky-500 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-sky-500/50 backdrop-blur-sm border border-gray-700/50 hover:border-sky-400"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800/50 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-pink-500/50 backdrop-blur-sm border border-gray-700/50 hover:border-pink-500"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800/50 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-700/50 backdrop-blur-sm border border-gray-700/50 hover:border-blue-600"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800/50 hover:bg-red-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/50 backdrop-blur-sm border border-gray-700/50 hover:border-red-500"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-lg mb-6 text-white relative inline-block">
              Quick Links
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></span>
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'About Us', href: '/about' },
                { name: 'Our Courses', href: '/courses' },
                { name: 'FAQ', href: '/faq' },
                { name: 'Contact Us', href: '/contact' },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-white text-sm transition-all duration-200 inline-flex items-center group"
                  >
                    <span className="w-0 h-px bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Programs */}
          <div className="lg:col-span-3">
            <h4 className="font-bold text-lg mb-6 text-white relative inline-block">
              Our Programs
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></span>
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Online School', href: '/courses' },
                { name: 'Online Tuition', href: '/courses' },
                { name: 'Spoken English', href: '/courses' },
                { name: 'Pre-Nursery to Grade 10', href: '/courses' },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-white text-sm transition-all duration-200 inline-flex items-center group"
                  >
                    <span className="w-0 h-px bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-4 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact Info */}
          <div className="lg:col-span-3">
            <h4 className="font-bold text-lg mb-6 text-white relative inline-block">
              Get In Touch
              <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></span>
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-sm group">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/20 transition-colors border border-blue-500/20">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Email</p>
                  <a 
                    href="mailto:info@stharoon.com" 
                    className="text-gray-300 hover:text-blue-400 transition-colors font-medium"
                  >
                    info@stharoon.com
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-3 text-sm group">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/20 transition-colors border border-green-500/20">
                  <Phone className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Phone</p>
                  <a 
                    href="tel:+15551234567" 
                    className="text-gray-300 hover:text-green-400 transition-colors font-medium"
                  >
                    +1 (555) 123-4567
                  </a>
                </div>
              </li>
              <li className="flex items-start space-x-3 text-sm group">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-purple-500/20 transition-colors border border-purple-500/20">
                  <MapPin className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Location</p>
                  <p className="text-gray-300 font-medium">Global Online</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-800/50 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-500 text-center md:text-left">
              © {currentYear} St Haroon Online School. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link 
                href="/privacy-policy" 
                className="text-gray-500 hover:text-white transition-colors relative group"
              >
                Privacy Policy
                <span className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                href="/terms-of-service" 
                className="text-gray-500 hover:text-white transition-colors relative group"
              >
                Terms of Service
                <span className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
