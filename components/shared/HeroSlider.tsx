'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, ArrowRight, Star, Users, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Slide {
  id: string
  title: string
  subtitle: string
  description: string
  backgroundImage: string
  ctaText: string
  ctaLink: string
  stats?: {
    label: string
    value: string
    icon: React.ReactNode
  }[]
}

const slides: Slide[] = [
  {
    id: '1',
    title: 'Discover Excellence at St Haroon Online School',
    subtitle: 'World-Class Online Education',
    description: 'Join thousands of students worldwide in our comprehensive Pre-Nursery to 10th Grade programs with certified teachers and interactive live classes.',
    backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    ctaText: 'Start Your Journey',
    ctaLink: '/auth/register',
    stats: [
      { label: 'Students', value: '1000+', icon: <Users className="w-5 h-5" /> },
      { label: 'Success Rate', value: '95%', icon: <Award className="w-5 h-5" /> },
      { label: 'Rating', value: '4.9/5', icon: <Star className="w-5 h-5" /> }
    ]
  },
  {
    id: '2',
    title: 'Master English Speaking with Confidence',
    subtitle: 'Spoken English for All Ages',
    description: 'From kids to seniors, our specialized English speaking courses help you communicate with confidence using proven methodologies.',
    backgroundImage: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    ctaText: 'Learn English Now',
    ctaLink: '/courses/spoken-english',
    stats: [
      { label: 'Languages', value: '5+', icon: <Users className="w-5 h-5" /> },
      { label: 'Native Teachers', value: '20+', icon: <Award className="w-5 h-5" /> },
      { label: 'Satisfaction', value: '98%', icon: <Star className="w-5 h-5" /> }
    ]
  },
  {
    id: '3',
    title: 'Personalized Online Tuition',
    subtitle: 'One-on-One Academic Support',
    description: 'Get personalized attention with our expert tutors for grade-wise academic support and exam preparation.',
    backgroundImage: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    ctaText: 'Get Tutoring',
    ctaLink: '/courses/tuition',
    stats: [
      { label: 'Subjects', value: '15+', icon: <Users className="w-5 h-5" /> },
      { label: 'Expert Tutors', value: '30+', icon: <Award className="w-5 h-5" /> },
      { label: 'Improvement', value: '90%', icon: <Star className="w-5 h-5" /> }
    ]
  }
]

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 8000) // Increased to 8 seconds for better UX

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

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
          style={{ background: slides[currentSlide]?.backgroundImage || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          {/* Enhanced Overlay with Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/20 to-black/40" />
          
          {/* Animated Geometric Shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
              className="absolute top-20 right-20 w-32 h-32 border border-white/10 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-20 left-20 w-24 h-24 border border-white/10 rounded-lg"
            />
          </div>
          
          {/* Content */}
          <div className="relative z-10 min-h-screen flex items-center">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <motion.div
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-white space-y-8"
                >
                  <div className="space-y-4">
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="text-lg font-medium text-white/90 uppercase tracking-wider"
                    >
                      {slides[currentSlide]?.subtitle}
                    </motion.p>
                    
                    <motion.h1
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight"
                    >
                      {slides[currentSlide]?.title}
                    </motion.h1>
                    
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      className="text-xl text-white/90 leading-relaxed max-w-2xl"
                    >
                      {slides[currentSlide]?.description}
                    </motion.p>
                  </div>

                  {/* Stats */}
                  {slides[currentSlide]?.stats && (
                    <motion.div
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      className="grid grid-cols-3 gap-6"
                    >
                      {slides[currentSlide]?.stats?.map((stat, index) => (
                        <div key={index} className="text-center">
                          <div className="flex items-center justify-center mb-2 text-white/80">
                            {stat.icon}
                          </div>
                          <div className="text-2xl font-bold">{stat.value}</div>
                          <div className="text-sm text-white/80">{stat.label}</div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* CTA Buttons */}
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="flex flex-col sm:flex-row gap-4"
                  >
                    <Link href={slides[currentSlide]?.ctaLink || '/auth/register'}>
                      <Button 
                        size="lg" 
                        className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-4 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                      >
                        {slides[currentSlide]?.ctaText || 'Get Started'}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                    
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="border-white text-white hover:bg-white hover:text-gray-900 text-lg px-8 py-4"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Watch Demo
                    </Button>
                  </motion.div>
                </motion.div>

                {/* Right Content - Enhanced Video Embed */}
                <motion.div
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="relative"
                >
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-sm border border-white/30 group">
                    {/* Video Container */}
                    <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
                      <iframe 
                        src="https://player.vimeo.com/video/1133830073?badge=0&autopause=0&player_id=0&app_id=58479" 
                        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" 
                        referrerPolicy="strict-origin-when-cross-origin" 
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
                        title="St Haroon Online School Demo"
                        className="rounded-3xl"
                      />
                    </div>
                    
                    {/* Video Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  
                  {/* Enhanced Floating Elements */}
                  <motion.div
                    animate={{ 
                      y: [0, -15, 0],
                      rotate: [0, 5, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-6 -right-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-2xl p-4 shadow-2xl backdrop-blur-sm"
                  >
                    <Star className="w-7 h-7" />
                  </motion.div>
                  
                  <motion.div
                    animate={{ 
                      y: [0, 15, 0],
                      rotate: [0, -5, 0]
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -bottom-6 -left-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-4 shadow-2xl backdrop-blur-sm"
                  >
                    <Award className="w-7 h-7" />
                  </motion.div>
                  
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/2 -right-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-3 shadow-xl"
                  >
                    <Users className="w-5 h-5" />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-3 transition-all duration-300"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-3 transition-all duration-300"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3">
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

      {/* Auto-play Toggle */}
      <button
        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
        className="absolute bottom-8 right-8 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full px-4 py-2 text-sm transition-all duration-300"
      >
        {isAutoPlaying ? 'Pause' : 'Play'}
      </button>
    </section>
  )
}