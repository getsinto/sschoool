'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Play, ArrowRight, Star, Users, Award, GraduationCap, MessageCircle, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Slide {
  id: string
  title: string
  subtitle: string
  description: string
  backgroundGradient: string
  ctaText: string
  ctaLink: string
  icon: React.ReactNode
  stats: {
    label: string
    value: string
  }[]
}

const slides: Slide[] = [
  {
    id: '1',
    title: 'Discover Excellence at St Haroon Online School',
    subtitle: 'World-Class Online Education',
    description: 'Join thousands of students worldwide in our comprehensive Pre-Nursery to 10th Grade programs with certified teachers and interactive live classes.',
    backgroundGradient: 'from-blue-600 via-purple-600 to-indigo-700',
    ctaText: 'Start Your Journey',
    ctaLink: '/auth/register',
    icon: <GraduationCap className="w-12 h-12" />,
    stats: [
      { label: 'Students', value: '1000+' },
      { label: 'Success Rate', value: '95%' },
      { label: 'Rating', value: '4.9/5' }
    ]
  },
  {
    id: '2',
    title: 'Master English Speaking with Confidence',
    subtitle: 'Spoken English for All Ages',
    description: 'From kids to seniors, our specialized English speaking courses help you communicate with confidence using proven methodologies and native instructors.',
    backgroundGradient: 'from-green-600 via-teal-600 to-blue-600',
    ctaText: 'Learn English Now',
    ctaLink: '/courses/spoken-english',
    icon: <MessageCircle className="w-12 h-12" />,
    stats: [
      { label: 'Age Groups', value: '4+' },
      { label: 'Native Teachers', value: '20+' },
      { label: 'Satisfaction', value: '98%' }
    ]
  },
  {
    id: '3',
    title: 'Personalized Online Tuition',
    subtitle: 'One-on-One Academic Support',
    description: 'Get personalized attention with our expert tutors for grade-wise academic support, exam preparation, and homework assistance.',
    backgroundGradient: 'from-orange-600 via-red-600 to-pink-600',
    ctaText: 'Get Tutoring',
    ctaLink: '/courses/tuition',
    icon: <BookOpen className="w-12 h-12" />,
    stats: [
      { label: 'Subjects', value: '15+' },
      { label: 'Expert Tutors', value: '30+' },
      { label: 'Improvement', value: '90%' }
    ]
  }
]

export default function IntroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setIsAutoPlaying(false)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setIsAutoPlaying(false)
  }

  const currentSlideData = slides[currentSlide]

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background with Gradient */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.backgroundGradient} transition-all duration-1000 ease-in-out`}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-32 right-20 w-64 h-64 bg-yellow-400/20 rounded-full blur-2xl animate-bounce" />
          <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-pink-400/20 rounded-full blur-xl animate-pulse" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white space-y-8">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-6">
                {currentSlideData.icon}
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <p className="text-lg font-medium text-white/90 uppercase tracking-wider">
                    {currentSlideData.subtitle}
                  </p>
                  
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                    {currentSlideData.title}
                  </h1>
                  
                  <p className="text-xl text-white/90 leading-relaxed max-w-2xl">
                    {currentSlideData.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6">
                  {currentSlideData.stats.map((stat, index) => (
                    <div key={index} className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-white/80">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href={currentSlideData.ctaLink}>
                    <Button 
                      size="lg" 
                      className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-4 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group"
                    >
                      {currentSlideData.ctaText}
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-white text-white hover:bg-white hover:text-gray-900 text-lg px-8 py-4 backdrop-blur-sm"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Watch Demo
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Content - Video Embed */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                  <iframe 
                    src="https://player.vimeo.com/video/1133830073?badge=0&autopause=0&player_id=0&app_id=58479" 
                    frameBorder="0" 
                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" 
                    referrerPolicy="strict-origin-when-cross-origin" 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
                    title="St Haroon Online School Demo"
                    className="rounded-2xl"
                  />
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-yellow-400 text-gray-900 rounded-full p-4 shadow-lg animate-bounce">
                <Star className="w-6 h-6" />
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-green-500 text-white rounded-full p-4 shadow-lg animate-pulse">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex items-center space-x-4">
        {/* Previous Button */}
        <button
          onClick={goToPrevious}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-3 transition-all duration-300 border border-white/30"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Slide Indicators */}
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={goToNext}
          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-3 transition-all duration-300 border border-white/30"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Auto-play Toggle */}
      <button
        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
        className="absolute top-8 right-8 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full px-4 py-2 text-sm transition-all duration-300 border border-white/30"
      >
        {isAutoPlaying ? 'Pause' : 'Play'}
      </button>

      {/* Progress Bar */}
      {isAutoPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div 
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{
              width: '100%',
              animation: `slideProgress 6000ms linear infinite`
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes slideProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  )
}