'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'light' | 'dark' | 'gradient'
  showText?: boolean
  animated?: boolean
  className?: string
}

export default function BrandLogo({
  size = 'md',
  variant = 'gradient',
  showText = true,
  animated = true,
  className = ''
}: BrandLogoProps) {
  const sizeConfig = {
    sm: { icon: 'w-8 h-8', text: 'text-sm', subtext: 'text-xs', spacing: 'space-x-2' },
    md: { icon: 'w-12 h-12', text: 'text-xl', subtext: 'text-sm', spacing: 'space-x-3' },
    lg: { icon: 'w-16 h-16', text: 'text-2xl', subtext: 'text-base', spacing: 'space-x-4' },
    xl: { icon: 'w-20 h-20', text: 'text-3xl', subtext: 'text-lg', spacing: 'space-x-4' }
  }

  const config = sizeConfig[size]

  const iconVariants = {
    initial: { scale: 0, rotate: -180, opacity: 0 },
    animate: {
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15,
        duration: 0.8
      }
    },
    hover: {
      scale: 1.05,
      rotate: [0, -5, 5, 0],
      transition: { duration: 0.5 }
    }
  }

  const textVariants = {
    initial: { x: -20, opacity: 0 },
    animate: {
      x: 0,
      opacity: 1,
      transition: { delay: 0.3, duration: 0.6 }
    }
  }

  const glowVariants = {
    animate: {
      opacity: [0.5, 0.8, 0.5],
      scale: [1, 1.1, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'light':
        return {
          bg: 'bg-white',
          text: 'text-gray-900',
          subtext: 'text-gray-600',
          glow: 'from-blue-400/30 to-purple-400/30'
        }
      case 'dark':
        return {
          bg: 'bg-gray-900',
          text: 'text-white',
          subtext: 'text-gray-300',
          glow: 'from-blue-500/40 to-purple-500/40'
        }
      case 'gradient':
      default:
        return {
          bg: 'bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600',
          text: 'text-gray-900',
          subtext: 'text-gray-600',
          glow: 'from-blue-500/50 to-purple-500/50'
        }
    }
  }

  const colors = getVariantClasses()

  const LogoIcon = () => (
    <motion.div
      className="relative"
      variants={animated ? iconVariants : undefined}
      initial={animated ? 'initial' : undefined}
      animate={animated ? 'animate' : undefined}
      whileHover={animated ? 'hover' : undefined}
    >
      {/* Animated glow effect */}
      {animated && (
        <motion.div
          className={cn(
            'absolute -inset-2 rounded-2xl blur-xl opacity-50',
            `bg-gradient-to-r ${colors.glow}`
          )}
          variants={glowVariants}
          animate={animated ? 'animate' : undefined}
        />
      )}

      {/* Main logo container */}
      <div className={cn('relative', config.icon, colors.bg, 'rounded-2xl shadow-2xl overflow-hidden')}>
        {/* Animated background pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100">
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="white"
            strokeWidth="0.5"
            animate={animated ? {
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            } : undefined}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <motion.circle
            cx="50"
            cy="50"
            r="30"
            fill="none"
            stroke="white"
            strokeWidth="0.5"
            animate={animated ? {
              scale: [1, 0.8, 1],
              opacity: [0.3, 0.6, 0.3]
            } : undefined}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5
            }}
          />
        </svg>

        {/* Logo content */}
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-3/4 h-3/4">
            {/* S letter with modern design */}
            <motion.path
              d="M 30 25 Q 50 15, 70 25 Q 75 30, 70 35 L 50 50 L 30 65 Q 25 70, 30 75 Q 50 85, 70 75"
              fill="none"
              stroke="white"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={animated ? { pathLength: 0, opacity: 0 } : undefined}
              animate={animated ? { pathLength: 1, opacity: 1 } : undefined}
              transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.5 }}
            />
            
            {/* H letter integrated */}
            <motion.path
              d="M 35 30 L 35 70 M 35 50 L 65 50 M 65 30 L 65 70"
              fill="none"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.7"
              initial={animated ? { pathLength: 0, opacity: 0 } : undefined}
              animate={animated ? { pathLength: 1, opacity: 0.7 } : undefined}
              transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.8 }}
            />

            {/* Decorative dots */}
            {[...Array(4)].map((_, i) => (
              <motion.circle
                key={i}
                cx={20 + i * 20}
                cy={15}
                r="2"
                fill="white"
                initial={animated ? { scale: 0, opacity: 0 } : undefined}
                animate={animated ? {
                  scale: [0, 1, 1],
                  opacity: [0, 1, 0.6],
                  y: [0, -5, 0]
                } : undefined}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2 + 1
                }}
              />
            ))}
          </svg>
        </div>

        {/* Shine effect overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"
          animate={animated ? {
            x: ['-100%', '100%']
          } : undefined}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
            ease: 'easeInOut'
          }}
        />
      </div>
    </motion.div>
  )

  return (
    <div className={cn('flex items-center', config.spacing, className)}>
      <LogoIcon />
      
      {showText && (
        <motion.div
          className="flex flex-col"
          variants={animated ? textVariants : undefined}
          initial={animated ? 'initial' : undefined}
          animate={animated ? 'animate' : undefined}
        >
          <motion.h1
            className={cn('font-bold leading-tight', config.text, colors.text)}
            whileHover={animated ? { scale: 1.02 } : undefined}
          >
            St Haroon
          </motion.h1>
          <motion.p
            className={cn('font-medium leading-tight', config.subtext, colors.subtext)}
            initial={animated ? { opacity: 0 } : undefined}
            animate={animated ? { opacity: 1 } : undefined}
            transition={{ delay: 0.6 }}
          >
            Online School
          </motion.p>
        </motion.div>
      )}
    </div>
  )
}
