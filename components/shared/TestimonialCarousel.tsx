'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Testimonial {
  id: string
  name: string
  role: string
  childGrade?: string
  photo?: string
  quote: string
  rating: number
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[]
  autoRotate?: boolean
  rotateInterval?: number
  className?: string
}

export default function TestimonialCarousel({
  testimonials,
  autoRotate = true,
  rotateInterval = 5000,
  className = ''
}: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoRotate)

  useEffect(() => {
    if (!isAutoPlaying || testimonials.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      )
    }, rotateInterval)

    return () => clearInterval(interval)
  }, [isAutoPlaying, testimonials.length, rotateInterval])

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1)
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1)
  }

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  const swipeConfidenceThreshold = 10000
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
  }

  if (testimonials.length === 0) {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative overflow-hidden">
        <AnimatePresence initial={false} custom={1}>
          <motion.div
            key={currentIndex}
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(_, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x)

              if (swipe < -swipeConfidenceThreshold) {
                goToNext()
              } else if (swipe > swipeConfidenceThreshold) {
                goToPrevious()
              }
            }}
            className="absolute w-full"
          >
            {testimonials[currentIndex] && (
              <TestimonialCard testimonial={testimonials[currentIndex]} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <div className="flex justify-center items-center mt-8 space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevious}
          className="rounded-full w-10 h-10 p-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        {/* Dots Indicator */}
        <div className="flex space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-blue-600 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={goToNext}
          className="rounded-full w-10 h-10 p-0"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Auto-play Toggle */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          {isAutoPlaying ? 'Pause' : 'Play'} Auto-rotation
        </button>
      </div>
    </div>
  )
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mx-4 relative">
      {/* Quote Icon */}
      <div className="absolute top-4 right-4 text-blue-100">
        <Quote className="w-12 h-12" />
      </div>

      {/* Rating */}
      <div className="flex items-center mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < testimonial.rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Quote */}
      <blockquote className="text-gray-700 text-lg leading-relaxed mb-6 italic">
        "{testimonial.quote}"
      </blockquote>

      {/* Author */}
      <div className="flex items-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4">
          {testimonial.photo ? (
            <img
              src={testimonial.photo}
              alt={testimonial.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            testimonial.name.charAt(0)
          )}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 text-lg">{testimonial.name}</h4>
          <p className="text-gray-600">{testimonial.role}</p>
          {testimonial.childGrade && (
            <p className="text-sm text-blue-600">Child in {testimonial.childGrade}</p>
          )}
        </div>
      </div>
    </div>
  )
}