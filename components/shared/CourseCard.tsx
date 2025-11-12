'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Users, Clock, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface CourseCardProps {
  title: string
  description: string
  icon: React.ReactNode
  image?: string
  href?: string
  features?: string[]
  studentCount?: number
  duration?: string
  rating?: number
  price?: string
  ctaText?: string
  ctaLink?: string
  className?: string
  variant?: 'default' | 'featured' | 'compact'
  stats?: {
    students?: number
    duration?: string
    rating?: number
  }
}

export default function CourseCard({
  title,
  description,
  icon,
  image,
  href,
  features = [],
  studentCount,
  duration,
  rating,
  price,
  ctaText = 'Enroll Now',
  ctaLink,
  className = '',
  variant = 'default',
  stats
}: CourseCardProps) {
  // Use href or ctaLink, with href taking priority
  const linkUrl = href || ctaLink || '#'
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const hoverVariants = {
    hover: { 
      y: -8,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  }

  if (variant === 'compact') {
    return (
      <motion.div
        variants={cardVariants}
        whileHover="hover"
        className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${className}`}
      >
        <motion.div variants={hoverVariants}>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white mr-4">
                {icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                {studentCount && (
                  <p className="text-sm text-gray-500 flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {studentCount.toLocaleString()} students
                  </p>
                )}
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
            
            <Link href={linkUrl}>
              <Button variant="outline" size="sm" className="w-full group">
                {ctaText}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  if (variant === 'featured') {
    return (
      <motion.div
        variants={cardVariants}
        whileHover="hover"
        className={`bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden text-white ${className}`}
      >
        <motion.div variants={hoverVariants}>
          {image && (
            <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <div className="text-6xl">{icon}</div>
            </div>
          )}
          
          <div className="p-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">{title}</h3>
              {rating && (
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="ml-1 font-semibold">{rating}</span>
                </div>
              )}
            </div>
            
            <p className="text-blue-100 mb-6 leading-relaxed">{description}</p>
            
            {features.length > 0 && (
              <ul className="space-y-2 mb-6">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center text-blue-100">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            )}
            
            <div className="flex items-center justify-between mb-6">
              {studentCount && (
                <div className="flex items-center text-blue-200">
                  <Users className="w-5 h-5 mr-2" />
                  <span>{studentCount.toLocaleString()} students</span>
                </div>
              )}
              {duration && (
                <div className="flex items-center text-blue-200">
                  <Clock className="w-5 h-5 mr-2" />
                  <span>{duration}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              {price && (
                <div className="text-2xl font-bold text-yellow-400">{price}</div>
              )}
              <Link href={linkUrl}>
                <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 group">
                  {ctaText}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${className}`}
    >
      <motion.div variants={hoverVariants}>
        {image && (
          <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <div className="text-5xl">{icon}</div>
          </div>
        )}
        
        <div className="p-6">
          <div className="flex items-center mb-4">
            {!image && (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white mr-4">
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
              {rating && (
                <div className="flex items-center mt-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="ml-1 text-sm text-gray-600">{rating}</span>
                </div>
              )}
            </div>
          </div>
          
          <p className="text-gray-600 mb-4 leading-relaxed">{description}</p>
          
          {features.length > 0 && (
            <ul className="space-y-2 mb-6">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center text-gray-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  {feature}
                </li>
              ))}
            </ul>
          )}
          
          <div className="flex items-center justify-between mb-6 text-sm text-gray-500">
            {studentCount && (
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>{studentCount.toLocaleString()} students</span>
              </div>
            )}
            {duration && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{duration}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            {price && (
              <div className="text-xl font-bold text-blue-600">{price}</div>
            )}
            <Link href={linkUrl}>
              <Button className="group">
                {ctaText}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}