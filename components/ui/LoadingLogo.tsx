'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface LoadingLogoProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  className?: string
}

export default function LoadingLogo({
  size = 'md',
  message = 'Loading...',
  className = ''
}: LoadingLogoProps) {
  const sizeConfig = {
    sm: { container: 'w-16 h-16', text: 'text-sm' },
    md: { container: 'w-24 h-24', text: 'text-base' },
    lg: { container: 'w-32 h-32', text: 'text-lg' }
  }

  const config = sizeConfig[size]

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-4', className)}>
      {/* Animated Logo Spinner */}
      <div className="relative">
        {/* Outer rotating ring */}
        <motion.div
          className={cn(
            config.container,
            'rounded-full border-4 border-transparent border-t-blue-600 border-r-purple-600'
          )}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear'
          }}
        />

        {/* Middle rotating ring */}
        <motion.div
          className={cn(
            config.container,
            'absolute inset-0 rounded-full border-4 border-transparent border-b-indigo-600 border-l-purple-600'
          )}
          animate={{ rotate: -360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear'
          }}
        />

        {/* Center logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="relative w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-xl shadow-lg"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            {/* Animated glow */}
            <motion.div
              className="absolute -inset-2 bg-gradient-to-r from-blue-500/50 to-purple-500/50 rounded-2xl blur-xl"
              animate={{
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />

            {/* Logo content */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-3/4 h-3/4">
                <motion.path
                  d="M 30 25 Q 50 15, 70 25 Q 75 30, 70 35 L 50 50 L 30 65 Q 25 70, 30 75 Q 50 85, 70 75"
                  fill="none"
                  stroke="white"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  animate={{
                    pathLength: [0, 1, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              </svg>
            </div>
          </motion.div>
        </div>

        {/* Pulsing dots */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(8)].map((_, i) => {
            const angle = (i * 360) / 8
            const radius = size === 'sm' ? 40 : size === 'md' ? 60 : 80
            const x = Math.cos((angle * Math.PI) / 180) * radius
            const y = Math.sin((angle * Math.PI) / 180) * radius

            return (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  marginLeft: `${x}px`,
                  marginTop: `${y}px`
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.25,
                  ease: 'easeInOut'
                }}
              />
            )
          })}
        </div>
      </div>

      {/* Loading message */}
      {message && (
        <div className="flex flex-col items-center space-y-2">
          <motion.p
            className={cn('font-medium text-gray-700', config.text)}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            {message}
          </motion.p>

          {/* Animated dots */}
          <div className="flex space-x-1">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-blue-600 rounded-full"
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
