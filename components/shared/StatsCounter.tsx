'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface StatsCounterProps {
  value: number
  label: string
  suffix?: string
  prefix?: string
  duration?: number
  icon?: React.ReactNode
  className?: string
  delay?: number
}

export default function StatsCounter({
  value,
  label,
  suffix = '',
  prefix = '',
  duration = 2000,
  icon,
  className = '',
  delay = 0
}: StatsCounterProps) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true)
      
      const timer = setTimeout(() => {
        let startTime: number
        const startValue = 0
        const endValue = value

        const animate = (currentTime: number) => {
          if (!startTime) startTime = currentTime
          const progress = Math.min((currentTime - startTime) / duration, 1)
          
          // Easing function for smooth animation
          const easeOutQuart = 1 - Math.pow(1 - progress, 4)
          const currentValue = Math.floor(startValue + (endValue - startValue) * easeOutQuart)
          
          setCount(currentValue)
          
          if (progress < 1) {
            requestAnimationFrame(animate)
          } else {
            setCount(endValue)
          }
        }
        
        requestAnimationFrame(animate)
      }, delay)

      return () => clearTimeout(timer)
    }
    // Return undefined for the else case
    return undefined
  }, [isInView, hasAnimated, value, duration, delay])

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        delay: delay / 1000
      }
    }
  }

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={`text-center ${className}`}
    >
      <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8">
        {icon && (
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
              {icon}
            </div>
          </div>
        )}
        
        <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {prefix}{count.toLocaleString()}{suffix}
          </span>
        </div>
        
        <p className="text-gray-600 font-medium text-lg">{label}</p>
      </div>
    </motion.div>
  )
}

// Preset counter components for common use cases
export function TeachingHoursCounter({ className }: { className?: string }) {
  return (
    <StatsCounter
      value={200000}
      suffix="+"
      label="Teaching Hours"
      icon={<span className="text-2xl">⏰</span>}
      className={className}
    />
  )
}

export function StudentsCounter({ value = 1000, className }: { value?: number; className?: string }) {
  return (
    <StatsCounter
      value={value}
      suffix="+"
      label="Happy Students"
      icon={<span className="text-2xl">🎓</span>}
      className={className}
      delay={200}
    />
  )
}

export function TeachersCounter({ value = 50, className }: { value?: number; className?: string }) {
  return (
    <StatsCounter
      value={value}
      suffix="+"
      label="Certified Teachers"
      icon={<span className="text-2xl">👨‍🏫</span>}
      className={className}
      delay={400}
    />
  )
}

export function SuccessRateCounter({ className }: { className?: string }) {
  return (
    <StatsCounter
      value={95}
      suffix="%"
      label="Success Rate"
      icon={<span className="text-2xl">🏆</span>}
      className={className}
      delay={600}
    />
  )
}