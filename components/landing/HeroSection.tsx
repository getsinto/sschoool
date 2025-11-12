'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function HeroSection() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showEnrollModal, setShowEnrollModal] = useState(false)

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
    // In a real implementation, you would control the video player here
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    // In a real implementation, you would control the video audio here
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200/30 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200/30 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-indigo-200/30 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-pink-200/30 rounded-full animate-bounce delay-700"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Discover Excellence at{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Our Online School
              </span>
            </h1>
            
            <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed">
              Experience world-class education with live interactive classes, expert teachers, 
              and personalized learning paths. Join thousands of students achieving their dreams.
            </p>

            {/* Key Benefits */}
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Live Interactive Classes</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Certified Teachers</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Flexible Learning</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Affordable Pricing</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-10">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                onClick={() => setShowEnrollModal(true)}
              >
                Enroll Now - Start Learning Today
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 text-center lg:text-left">
              <div>
                <div className="text-2xl font-bold text-gray-900">10,000+</div>
                <div className="text-sm text-gray-600">Students Enrolled</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">500+</div>
                <div className="text-sm text-gray-600">Expert Teachers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">95%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Right Content - Video Player */}
          <div className="relative">
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Video Container */}
              <div className="relative aspect-video bg-gray-900">
                {/* Placeholder for video - replace with actual video component */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Play className="w-8 h-8 ml-1" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Sample Class Preview</h3>
                    <p className="text-gray-300">Experience our interactive teaching method</p>
                  </div>
                </div>

                {/* Custom Video Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={togglePlay}
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/20"
                        onClick={toggleMute}
                      >
                        {isMuted ? (
                          <VolumeX className="w-5 h-5" />
                        ) : (
                          <Volume2 className="w-5 h-5" />
                        )}
                      </Button>

                      <span className="text-white text-sm">2:34 / 5:12</span>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                    >
                      <Maximize className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2 w-full bg-white/20 rounded-full h-1">
                    <div className="bg-white rounded-full h-1 w-1/2"></div>
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Mathematics - Grade 10: Quadratic Equations
                </h4>
                <p className="text-gray-600 text-sm">
                  Watch how our expert teachers make complex topics simple and engaging
                </p>
              </div>
            </div>

            {/* Floating Elements around video */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Enrollment Modal Placeholder */}
      {showEnrollModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Learning?</h3>
            <p className="text-gray-600 mb-6">
              Join thousands of students who are already achieving their academic goals with us.
            </p>
            <div className="flex space-x-4">
              <Button
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                onClick={() => {
                  setShowEnrollModal(false)
                  window.location.href = '/auth/register'
                }}
              >
                Register Now
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowEnrollModal(false)}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}