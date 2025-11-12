'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Phone, Mail, Calendar, Gift, Star, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function EnhancedCTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute top-32 right-20 w-24 h-24 bg-yellow-400/20 rounded-full blur-lg animate-bounce" />
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl" />
          <div className="absolute bottom-10 right-10 w-28 h-28 bg-pink-400/20 rounded-full blur-xl animate-pulse" />
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
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
              className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-8 border border-white/30"
            >
              <Star className="w-10 h-10 text-yellow-300" />
            </motion.div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Ready to Start Your{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Learning Journey?
              </span>
            </h2>
            
            <p className="text-xl text-indigo-100 max-w-4xl mx-auto leading-relaxed mb-8">
              Join thousands of students who have transformed their education with St Haroon Online School. 
              Experience world-class learning with personalized attention and proven results.
            </p>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap justify-center items-center gap-8 mb-12"
            >
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <Users className="w-5 h-5 text-green-300" />
                <span className="text-sm font-medium">1000+ Students</span>
              </div>
              
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <Star className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-medium">4.9/5 Rating</span>
              </div>
              
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <Gift className="w-5 h-5 text-pink-300" />
                <span className="text-sm font-medium">Free Trial Available</span>
              </div>
            </motion.div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-6 justify-center mb-16"
          >
            <Link href="/auth/register">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  className="bg-white text-indigo-600 hover:bg-gray-100 text-lg px-12 py-6 shadow-2xl hover:shadow-3xl transition-all duration-300 group"
                >
                  <Gift className="w-6 h-6 mr-3 group-hover:animate-bounce" />
                  Start Free Trial
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </Link>
            
            <Link href="/contact">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white hover:text-indigo-600 text-lg px-12 py-6 backdrop-blur-sm group"
                >
                  <Phone className="w-6 h-6 mr-3 group-hover:animate-pulse" />
                  Schedule Demo
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid md:grid-cols-3 gap-8 mb-16"
          >
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Calendar className="w-12 h-12 text-blue-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Flexible Schedule</h3>
              <p className="text-indigo-100 text-sm">Choose your preferred class timings</p>
            </div>
            
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Users className="w-12 h-12 text-green-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Expert Teachers</h3>
              <p className="text-indigo-100 text-sm">Learn from certified professionals</p>
            </div>
            
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <Star className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Proven Results</h3>
              <p className="text-indigo-100 text-sm">95% student success rate</p>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-center bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
          >
            <h3 className="text-2xl font-bold mb-6">Need Help? We're Here for You!</h3>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-center justify-center space-x-3">
                <Phone className="w-6 h-6 text-green-300" />
                <div>
                  <div className="font-semibold">Call Us</div>
                  <div className="text-indigo-200">+1 (555) 123-4567</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-3">
                <Mail className="w-6 h-6 text-blue-300" />
                <div>
                  <div className="font-semibold">Email Us</div>
                  <div className="text-indigo-200">info@stharoon.com</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}