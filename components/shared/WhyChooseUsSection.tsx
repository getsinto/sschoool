'use client'

import { motion } from 'framer-motion'
import { 
  Globe, 
  Users, 
  Clock, 
  BookOpen, 
  Award, 
  MessageCircle, 
  Shield, 
  Zap,
  Heart,
  Target,
  Lightbulb,
  CheckCircle
} from 'lucide-react'

const features = [
  {
    icon: <Globe className="w-8 h-8" />,
    title: 'Global Accessibility',
    description: 'Learn from anywhere in the world with our cutting-edge online platform designed for seamless global education.',
    color: 'from-blue-500 to-cyan-500',
    delay: 0
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Expert Teachers',
    description: 'Certified and experienced educators dedicated to your success with personalized attention and proven teaching methods.',
    color: 'from-green-500 to-emerald-500',
    delay: 0.1
  },
  {
    icon: <Clock className="w-8 h-8" />,
    title: 'Flexible Timing',
    description: 'Choose class timings that perfectly fit your schedule with multiple time zones and weekend options available.',
    color: 'from-purple-500 to-pink-500',
    delay: 0.2
  },
  {
    icon: <BookOpen className="w-8 h-8" />,
    title: 'Comprehensive Curriculum',
    description: 'Well-structured courses aligned with international educational standards and updated with latest industry trends.',
    color: 'from-orange-500 to-red-500',
    delay: 0.3
  },
  {
    icon: <Award className="w-8 h-8" />,
    title: 'Certified Programs',
    description: 'Earn recognized certificates upon course completion that add value to your academic and professional journey.',
    color: 'from-indigo-500 to-blue-500',
    delay: 0.4
  },
  {
    icon: <MessageCircle className="w-8 h-8" />,
    title: '24/7 Support',
    description: 'Round-the-clock support for all your learning needs with dedicated student success managers.',
    color: 'from-teal-500 to-green-500',
    delay: 0.5
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: 'Safe Learning Environment',
    description: 'Secure and monitored online classrooms ensuring a safe and focused learning environment for all students.',
    color: 'from-yellow-500 to-orange-500',
    delay: 0.6
  },
  {
    icon: <Zap className="w-8 h-8" />,
    title: 'Interactive Technology',
    description: 'State-of-the-art learning management system with interactive whiteboards, breakout rooms, and engagement tools.',
    color: 'from-pink-500 to-rose-500',
    delay: 0.7
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Personalized Care',
    description: 'Individual attention and customized learning paths tailored to each student\'s unique needs and learning style.',
    color: 'from-red-500 to-pink-500',
    delay: 0.8
  }
]

const benefits = [
  'Live Interactive Classes',
  'Recorded Session Access',
  'Regular Progress Reports',
  'Parent-Teacher Meetings',
  'Homework Assistance',
  'Exam Preparation Support'
]

export default function WhyChooseUsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-10" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
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
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6"
          >
            <Target className="w-8 h-8 text-white" />
          </motion.div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            Why Choose{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              St Haroon Online School?
            </span>
          </h2>
          
          <p className="text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
            We're committed to providing the best online education experience with innovative teaching methods, 
            cutting-edge technology, and unwavering support for every student's success.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: feature.delay }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group"
            >
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500 overflow-hidden">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-xl mb-6 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-4 group-hover:text-blue-300 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-blue-100 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Hover Effect */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className={`w-2 h-2 bg-gradient-to-r ${feature.color} rounded-full animate-pulse`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
        >
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center mb-6">
                <Lightbulb className="w-8 h-8 text-yellow-400 mr-3" />
                <h3 className="text-2xl font-bold">What You Get With Us</h3>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <span className="text-blue-100">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="text-center lg:text-right">
              <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8">
                <div className="text-4xl font-bold mb-2">Join 1000+</div>
                <div className="text-blue-100">Happy Students Worldwide</div>
                <div className="mt-4 flex justify-center lg:justify-end space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.div
                      key={star}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.1 * star }}
                    >
                      <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-xs">★</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}