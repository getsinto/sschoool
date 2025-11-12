'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Star, Award, Users, Sparkles, TrendingUp } from 'lucide-react'

export default function VideoSection() {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-32 right-32 w-40 h-40 bg-purple-200/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-200/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6 shadow-xl"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </motion.div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 mb-4 sm:mb-6">
              Experience Our{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Online Learning
              </span>
            </h2>
            
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Watch how our innovative online education platform transforms learning experiences 
              with interactive classes, expert teachers, and personalized attention.
            </p>
          </motion.div>
        </div>

        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Video Container */}
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-600 to-purple-600 p-1">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-black">
                <AnimatePresence mode="wait">
                  {!isPlaying ? (
                    // Thumbnail with Play Button
                    <motion.div
                      key="thumbnail"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative aspect-video bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 cursor-pointer group"
                      onClick={() => setIsPlaying(true)}
                    >
                      {/* Animated Background Pattern */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute inset-0" style={{
                          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
                                           radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                                           radial-gradient(circle at 40% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)`
                        }} />
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center z-10">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative"
                          >
                            <motion.div 
                              className="absolute inset-0 bg-white/20 rounded-full blur-2xl"
                              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                            <div className="relative bg-white rounded-full p-8 sm:p-10 lg:p-12 shadow-2xl group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300">
                              <Play className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-blue-600 group-hover:text-white transition-colors ml-2" />
                            </div>
                          </motion.div>
                          <motion.p 
                            className="text-white text-xl sm:text-2xl lg:text-3xl font-bold mt-8 drop-shadow-lg"
                            animate={{ opacity: [0.8, 1, 0.8] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            See Our School in Action
                          </motion.p>
                          <p className="text-white/80 text-sm sm:text-base mt-3 drop-shadow-md">
                            Discover St Haroon's Interactive Learning Experience
                          </p>
                        </div>
                      </div>
                      
                      {/* Decorative Elements */}
                      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 border border-white/20">
                        <p className="text-white text-xs sm:text-sm font-semibold flex items-center gap-2">
                          <Play className="w-3 h-3" />
                          2:30 min
                        </p>
                      </div>

                      {/* Quality Badge */}
                      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-gradient-to-r from-yellow-400 to-orange-500 backdrop-blur-md rounded-xl px-3 py-1.5 border border-white/20">
                        <p className="text-white text-xs sm:text-sm font-bold flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          HD
                        </p>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.div>
                  ) : (
                    // Vimeo Player (Clean - No Branding)
                    <motion.div
                      key="video"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="relative aspect-video bg-black"
                    >
                      <iframe 
                        src="https://player.vimeo.com/video/1133830073?h=add9abffac&autoplay=1&title=0&byline=0&portrait=0&badge=0&controls=1&autopause=0&player_id=0&app_id=58479" 
                        className="absolute inset-0 w-full h-full"
                        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" 
                        allowFullScreen
                        title="St Haroon Online School Demo"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Enhanced Floating Elements */}
            <motion.div
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-sm"
            >
              <Star className="w-5 h-5 sm:w-7 sm:h-7" />
            </motion.div>
            
            <motion.div
              animate={{ 
                y: [0, 15, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-sm"
            >
              <Award className="w-5 h-5 sm:w-7 sm:h-7" />
            </motion.div>
            
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/2 -right-6 sm:-right-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-2 sm:p-3 shadow-xl"
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.div>
          </motion.div>

          {/* Enhanced Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mt-12 sm:mt-16"
          >
            {[
              { icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" />, value: '1000+', label: 'Happy Students', color: 'from-blue-500 to-cyan-500', bgColor: 'from-blue-50 to-cyan-50' },
              { icon: <Star className="w-6 h-6 sm:w-8 sm:h-8" />, value: '4.9/5', label: 'Average Rating', color: 'from-yellow-500 to-orange-500', bgColor: 'from-yellow-50 to-orange-50' },
              { icon: <Award className="w-6 h-6 sm:w-8 sm:h-8" />, value: '95%', label: 'Success Rate', color: 'from-green-500 to-emerald-500', bgColor: 'from-green-50 to-emerald-50' },
              { icon: <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />, value: '50+', label: 'Expert Teachers', color: 'from-purple-500 to-pink-500', bgColor: 'from-purple-50 to-pink-50' },
            ].map((stat, index) => (
              <motion.div 
                key={index} 
                className={`text-center bg-gradient-to-br ${stat.bgColor} rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/50 backdrop-blur-sm group`}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r ${stat.color} rounded-xl mb-4 text-white shadow-lg group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
                <div className={`text-2xl sm:text-3xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                  {stat.value}
                </div>
                <div className="text-gray-700 font-semibold text-sm sm:text-base">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
