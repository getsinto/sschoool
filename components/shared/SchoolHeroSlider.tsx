'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, GraduationCap, BookOpen, Globe, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Slide {
  id: number
  category: string
  title: string
  subtitle: string
  description: string
  gradient: string
  overlayGradient: string
  icon: React.ReactNode
  highlights: string[]
}

const slides: Slide[] = [
  {
    id: 1,
    category: 'Online School',
    title: 'Shape Tomorrow\'s Leaders',
    subtitle: 'Pre-Nursery to Grade 10',
    description: 'World-class education with certified teachers, live interactive classes, and personalized learning paths designed for academic excellence.',
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    overlayGradient: 'from-blue-500/20 to-purple-500/20',
    icon: <GraduationCap className="w-full h-full" />,
    highlights: ['1000+ Students', '50+ Teachers', '95% Success Rate']
  },
  {
    id: 2,
    category: 'Spoken English',
    title: 'Speak with Confidence',
    subtitle: 'All Age Groups Welcome',
    description: 'Master English speaking with native instructors through interactive practice, real conversations, and proven teaching methods.',
    gradient: 'from-emerald-600 via-green-600 to-teal-600',
    overlayGradient: 'from-emerald-500/20 to-teal-500/20',
    icon: <Globe className="w-full h-full" />,
    highlights: ['Native Speakers', 'Interactive Practice', '4.9/5 Rating']
  },
  {
    id: 3,
    category: 'Online Tuition',
    title: 'Excel in Your Studies',
    subtitle: 'Personalized One-on-One',
    description: 'Individual attention from expert tutors with customized learning plans, flexible scheduling, and comprehensive exam preparation.',
    gradient: 'from-purple-600 via-pink-600 to-rose-600',
    overlayGradient: 'from-purple-500/20 to-rose-500/20',
    icon: <BookOpen className="w-full h-full" />,
    highlights: ['Expert Tutors', 'Flexible Schedule', '100% Personalized']
  }
]

export default function SchoolHeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 7000)
    return () => clearInterval(timer)
  }, [])

  const goToPrevious = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  const goToNext = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const goToSlide = (index: number) => setCurrentSlide(index)

  const slide = slides[currentSlide]
  if (!slide) return null

  return (
    <section className="relative min-h-[100vh] overflow-hidden bg-gray-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {/* Dynamic Gradient Background */}
          <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`}>
            {/* Animated Mesh Gradient Overlay */}
            <motion.div
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className={`absolute inset-0 bg-gradient-to-tr ${slide.overlayGradient} opacity-50`}
              style={{ backgroundSize: '400% 400%' }}
            />

            {/* Floating Orbs */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                animate={{
                  x: [0, 100, 0],
                  y: [0, -100, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"
              />
              <motion.div
                animate={{
                  x: [0, -100, 0],
                  y: [0, 100, 0],
                  scale: [1.2, 1, 1.2],
                }}
                transition={{
                  duration: 18,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"
              />
            </div>

            {/* Geometric Pattern */}
            <div className="absolute inset-0 opacity-5" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              backgroundSize: '100px 100px'
            }} />
          </div>

          {/* Content Container */}
          <div className="relative z-10 min-h-[100vh] flex items-center py-12 sm:py-16 lg:py-20 pb-32 sm:pb-40 lg:pb-48">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
                  
                  {/* Left Content */}
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-white space-y-4 sm:space-y-5 lg:space-y-6"
                  >
                    {/* Category Badge */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
                      className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-xl rounded-full px-6 py-3 border border-white/20 hover:bg-white/20 transition-colors"
                    >
                      <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                      <span className="font-bold text-sm tracking-wide uppercase">{slide.category}</span>
                    </motion.div>

                    {/* Main Title */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                    >
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight mb-2 sm:mb-3">
                        {slide.title}
                      </h1>
                      <p className="text-lg sm:text-xl lg:text-2xl font-light text-white/90">
                        {slide.subtitle}
                      </p>
                    </motion.div>

                    {/* Description */}
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      className="text-base sm:text-lg lg:text-xl text-white/80 leading-relaxed max-w-2xl"
                    >
                      {slide.description}
                    </motion.p>

                    {/* Highlights */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                      className="flex flex-wrap gap-3"
                    >
                      {slide.highlights.map((highlight, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                          className="bg-white/10 backdrop-blur-xl rounded-xl px-5 py-2.5 border border-white/20 hover:bg-white/20 transition-colors"
                        >
                          <span className="font-bold text-base">{highlight}</span>
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* CTA Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.8, type: "spring" }}
                      className="pt-3 sm:pt-4"
                    >
                      <Link href="/auth/register">
                        <Button 
                          size="lg" 
                          className="bg-white text-gray-900 hover:bg-gray-100 text-base sm:text-lg lg:text-xl font-bold px-8 py-4 sm:px-10 sm:py-5 lg:px-12 lg:py-6 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 group hover:scale-105"
                        >
                          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3 group-hover:rotate-180 transition-transform duration-500" />
                          Enroll Now
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ml-2 sm:ml-3 group-hover:translate-x-2 transition-transform" />
                        </Button>
                      </Link>
                    </motion.div>
                  </motion.div>

                  {/* Right Content - Hexagon Design */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.4, type: "spring", bounce: 0.3 }}
                    className="hidden lg:flex items-center justify-center"
                  >
                    <div className="relative w-80 h-80 xl:w-96 xl:h-96">
                      {/* Rotating Hexagon Rings */}
                      {[0, 1, 2].map((ring) => (
                        <motion.div
                          key={ring}
                          animate={{
                            rotate: ring % 2 === 0 ? 360 : -360,
                          }}
                          transition={{
                            duration: 20 + ring * 5,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                          className="absolute inset-0 flex items-center justify-center"
                          style={{
                            transform: `scale(${1 - ring * 0.25})`
                          }}
                        >
                          <div className="w-full h-full relative">
                            {[...Array(6)].map((_, i) => {
                              const angle = (i * 60 - 90) * (Math.PI / 180)
                              const radius = 40 - ring * 5
                              return (
                                <motion.div
                                  key={i}
                                  animate={{
                                    scale: [1, 1.2, 1],
                                    opacity: [0.6, 1, 0.6]
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.2 + ring * 0.3,
                                    ease: "easeInOut"
                                  }}
                                  className="absolute w-3 h-3 bg-white rounded-full shadow-lg"
                                  style={{
                                    left: `calc(50% + ${radius}% * ${Math.cos(angle)})`,
                                    top: `calc(50% + ${radius}% * ${Math.sin(angle)})`,
                                    transform: 'translate(-50%, -50%)'
                                  }}
                                />
                              )
                            })}
                          </div>
                        </motion.div>
                      ))}

                      {/* Floating Particles */}
                      {[...Array(8)].map((_, i) => (
                        <motion.div
                          key={`particle-${i}`}
                          animate={{
                            y: [0, -30, 0],
                            x: [0, Math.sin(i) * 20, 0],
                            opacity: [0.3, 0.8, 0.3],
                            scale: [1, 1.5, 1]
                          }}
                          transition={{
                            duration: 3 + i * 0.5,
                            repeat: Infinity,
                            delay: i * 0.4,
                            ease: "easeInOut"
                          }}
                          className="absolute w-2 h-2 bg-white/60 rounded-full blur-sm"
                          style={{
                            left: `${20 + i * 10}%`,
                            top: `${30 + (i % 3) * 20}%`
                          }}
                        />
                      ))}

                      {/* Central Icon with Hexagon Container */}
                      <motion.div
                        animate={{
                          y: [0, -15, 0],
                        }}
                        transition={{
                          duration: 6,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        {/* Pulsing Glow */}
                        <motion.div
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.2, 0.4, 0.2]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="absolute w-48 h-48 bg-white/30 rounded-full blur-3xl"
                        />

                        {/* Hexagon Shape */}
                        <div className="relative w-56 h-56 flex items-center justify-center">
                          <motion.div
                            animate={{
                              rotate: [0, 360]
                            }}
                            transition={{
                              duration: 30,
                              repeat: Infinity,
                              ease: "linear"
                            }}
                            className="absolute inset-0"
                            style={{
                              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
                            }}
                          >
                            <div className="w-full h-full bg-white/10 backdrop-blur-2xl border-4 border-white/40" />
                          </motion.div>

                          {/* Icon */}
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                              rotate: [0, 5, 0, -5, 0]
                            }}
                            transition={{
                              duration: 5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="relative z-10 text-white w-32 h-32"
                          >
                            {slide.icon}
                          </motion.div>
                        </div>
                      </motion.div>

                      {/* Corner Accents */}
                      {[0, 1, 2, 3].map((corner) => (
                        <motion.div
                          key={`corner-${corner}`}
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.4, 0.8, 0.4]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: corner * 0.5,
                            ease: "easeInOut"
                          }}
                          className="absolute w-4 h-4 bg-white/50 rounded-full"
                          style={{
                            [corner < 2 ? 'top' : 'bottom']: '10%',
                            [corner % 2 === 0 ? 'left' : 'right']: '10%'
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>



      {/* Slide Indicators */}
      <div className="absolute bottom-6 sm:bottom-8 lg:bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-3 sm:space-x-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-500 rounded-full ${
              index === currentSlide
                ? 'w-12 sm:w-14 lg:w-16 h-3 sm:h-3.5 lg:h-4 bg-white shadow-lg'
                : 'w-3 sm:w-3.5 lg:w-4 h-3 sm:h-3.5 lg:h-4 bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 sm:bottom-8 lg:bottom-10 right-6 sm:right-8 lg:right-10 z-20 hidden lg:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center text-white/60 hover:text-white transition-colors"
        >
          <span className="text-xs font-medium mb-1.5 uppercase tracking-wider">Scroll</span>
          <div className="w-5 h-8 border-2 border-current rounded-full flex items-start justify-center p-1.5">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-1 bg-current rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
