'use client'

import { motion } from 'framer-motion'
import { Clock, Users, GraduationCap, Award, TrendingUp, Globe, BookOpen, Star } from 'lucide-react'
import StatsCounter from './StatsCounter'

const achievements = [
  {
    icon: <Clock className="w-8 h-8" />,
    value: 200000,
    suffix: '+',
    label: 'Teaching Hours',
    description: 'Delivered with excellence',
    color: 'from-blue-500 to-cyan-500',
    delay: 0
  },
  {
    icon: <Users className="w-8 h-8" />,
    value: 50,
    suffix: '+',
    label: 'Expert Teachers',
    description: 'Certified & experienced',
    color: 'from-green-500 to-emerald-500',
    delay: 0.1
  },
  {
    icon: <GraduationCap className="w-8 h-8" />,
    value: 1000,
    suffix: '+',
    label: 'Happy Students',
    description: 'Across the globe',
    color: 'from-purple-500 to-pink-500',
    delay: 0.2
  },
  {
    icon: <Award className="w-8 h-8" />,
    value: 95,
    suffix: '%',
    label: 'Success Rate',
    description: 'Student achievement',
    color: 'from-orange-500 to-red-500',
    delay: 0.3
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    value: 98,
    suffix: '%',
    label: 'Satisfaction Rate',
    description: 'Parent feedback',
    color: 'from-indigo-500 to-blue-500',
    delay: 0.4
  },
  {
    icon: <Globe className="w-8 h-8" />,
    value: 25,
    suffix: '+',
    label: 'Countries',
    description: 'Global reach',
    color: 'from-teal-500 to-green-500',
    delay: 0.5
  },
  {
    icon: <BookOpen className="w-8 h-8" />,
    value: 100,
    suffix: '+',
    label: 'Courses',
    description: 'Comprehensive curriculum',
    color: 'from-yellow-500 to-orange-500',
    delay: 0.6
  },
  {
    icon: <Star className="w-8 h-8" />,
    value: 4.9,
    suffix: '/5',
    label: 'Average Rating',
    description: 'Student reviews',
    color: 'from-pink-500 to-rose-500',
    delay: 0.7,
    decimals: 1
  }
]

export default function AchievementsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6"
          >
            <TrendingUp className="w-8 h-8 text-white" />
          </motion.div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Our{' '}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Achievements
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Numbers that speak for our unwavering commitment to excellence in online education. 
            Every statistic represents our dedication to transforming lives through quality learning.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: achievement.delay }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${achievement.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${achievement.color} rounded-xl mb-6 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {achievement.icon}
                </div>
                
                {/* Stats */}
                <div className="space-y-2">
                  <div className={`text-4xl font-bold bg-gradient-to-r ${achievement.color} bg-clip-text text-transparent`}>
                    <StatsCounter 
                      end={achievement.value} 
                      suffix={achievement.suffix}
                      decimals={achievement.decimals || 0}
                    />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                    {achievement.label}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {achievement.description}
                  </p>
                </div>

                {/* Hover Effect */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className={`w-2 h-2 bg-gradient-to-r ${achievement.color} rounded-full animate-pulse`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 items-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">ISO 9001</div>
                <p className="text-gray-600">Certified Quality</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
                <p className="text-gray-600">Student Support</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
                <p className="text-gray-600">Online Learning</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}