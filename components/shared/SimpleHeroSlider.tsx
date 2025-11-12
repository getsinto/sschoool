'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight, Star, Users, Award } from 'lucide-react'
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
    backgroundImage: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #6366f1 100%)',
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
    subtitle: 'Spoken English Course for All Ages',
    description: 'From kids to seniors, our specialized English speaking courses help you communicate with confidence using proven methodologies.',
    backgroundImage: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
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
    backgroundImage: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)',
    ctaText: 'Get Tutoring',
    ctaLink: '/courses/tuition',
    stats: [
      { label: 'Subjects', value: '15+', icon: <Users className="w-5 h-5" /> },
      { label: 'Expert Tutors', value: '30+', icon: <Award className="w-5 h-5" /> },
      { label: 'Improvement', value: '90%', icon: <Star className="w-5 h-5" /> }
    ]
  }
]

export default function SimpleHeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 8000)

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
    <section className="relative min-h-screen overflow-hidden pt-20">
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
          <div className="relative z-10 min-h-screen flex items-center pt-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-5xl mx-auto text-center">
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-white space-y-8"
                >
                  <div className="space-y-6">
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="text-lg sm:text-xl font-semibold text-white/95 uppercase tracking-wider"
                    >
                      {slides[currentSlide]?.subtitle}
                    </motion.p>
                    
                    <motion.h1
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight drop-shadow-2xl"
                    >
                      {slides[currentSlide]?.title}
                    </motion.h1>
                    
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      className="text-lg sm:text-xl lg:text-2xl text-white/95 leading-relaxed max-w-4xl mx-auto drop-shadow-lg font-medium"
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
                      className="grid grid-cols-3 gap-8 max-w-3xl mx-auto"
                    >
                      {slides[currentSlide]?.stats?.map((stat, index) => (
                        <div key={index} className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                          <div className="flex items-center justify-center mb-3 text-white">
                            {stat.icon}
                          </div>
                          <div className="text-3xl lg:text-4xl font-bold mb-1">{stat.value}</div>
                          <div className="text-sm lg:text-base text-white/90 font-medium">{stat.label}</div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* CTA Button */}
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="flex justify-center"
                  >
                    <Link href="/auth/register">
                      <Button 
                        size="lg" 
                        className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-10 py-4 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                      >
                        Enroll Now
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
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


    </section>
  )
}