'use client'

import { useState } from 'react'
import { Download, Eye, FileText, CheckCircle, Star, Users, Award, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import Link from 'next/link'

export default function EnhancedBrochureSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [downloadCount, setDownloadCount] = useState(2847)

  const handleDownload = () => {
    // Simulate download
    setDownloadCount(prev => prev + 1)
    
    // Create download link
    const link = document.createElement('a')
    link.href = '/brochures/st-haroon-complete-guide.pdf'
    link.download = 'St_Haroon_Online_School_Complete_Guide.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const features = [
    { icon: <FileText className="w-6 h-6" />, title: 'Complete Curriculum Guide', description: 'Detailed course outlines for all grades' },
    { icon: <Users className="w-6 h-6" />, title: 'Teacher Profiles', description: 'Meet our certified educators' },
    { icon: <Star className="w-6 h-6" />, title: 'Success Stories', description: 'Real student achievements' },
    { icon: <Award className="w-6 h-6" />, title: 'Certification Info', description: 'Recognized qualifications' },
    { icon: <CheckCircle className="w-6 h-6" />, title: 'Admission Process', description: 'Step-by-step enrollment guide' },
    { icon: <ArrowRight className="w-6 h-6" />, title: 'Pricing Plans', description: 'Transparent fee structure' }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            And{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Much More...
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Download our comprehensive school guide with everything you need to make an informed decision 
            about your educational journey with St Haroon Online School.
          </p>
        </div>

        {/* Main Brochure Card */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Left Side - Preview */}
              <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-8 lg:p-12">
                {/* Background Effects */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-xl" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-400 rounded-full blur-lg" />
                </div>
                
                <div className="relative z-10">
                  {/* Brochure Preview */}
                  <div 
                    className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 border border-white/30 cursor-pointer hover:bg-white/30 transition-all duration-300 group"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <div className="text-center">
                      <FileText className="w-24 h-24 text-white mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" />
                      <h3 className="text-2xl font-bold text-white mb-4">
                        Complete School Guide
                      </h3>
                      <p className="text-blue-100 mb-6">
                        50+ pages of comprehensive information about our programs, facilities, and admission process
                      </p>
                      
                      {/* Preview Button */}
                      <div className="inline-flex items-center text-white font-medium">
                        <Eye className="w-5 h-5 mr-2" />
                        Click to Preview
                      </div>
                    </div>
                  </div>
                  
                  {/* Download Stats */}
                  <div className="mt-8 text-center">
                    <div className="text-white/80 text-sm mb-2">Downloaded by</div>
                    <div className="text-3xl font-bold text-white">{downloadCount.toLocaleString()}+</div>
                    <div className="text-white/80 text-sm">Families worldwide</div>
                  </div>
                </div>
              </div>

              {/* Right Side - Content */}
              <div className="p-8 lg:p-12">
                <div className="mb-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">
                    Everything You Need to Know
                  </h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Our comprehensive guide contains detailed information about curriculum, teaching methodology, 
                    teacher profiles, success stories, and step-by-step enrollment process.
                  </p>
                </div>

                {/* Features Grid */}
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="text-indigo-600 mt-1">
                        {feature.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{feature.title}</h4>
                        <p className="text-gray-600 text-xs">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="w-full border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 group"
                      >
                        <Eye className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                        Preview Brochure
                      </Button>
                    </DialogTrigger>
                    
                    <DialogContent className="max-w-4xl h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>St Haroon Online School - Complete Guide</DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 overflow-auto">
                        <iframe
                          src="/brochures/st-haroon-complete-guide.pdf"
                          className="w-full h-full border-0 rounded-lg"
                          title="St Haroon School Guide"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    onClick={handleDownload}
                    size="lg" 
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 group"
                  >
                    <Download className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                    Download Complete Guide (PDF)
                  </Button>
                </div>

                {/* File Info */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <div className="font-semibold text-gray-900">Format</div>
                      <div className="text-gray-600">PDF</div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Size</div>
                      <div className="text-gray-600">4.2 MB</div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Pages</div>
                      <div className="text-gray-600">52</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Start Your Educational Journey?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            After reviewing our comprehensive guide, take the next step and join thousands of successful students worldwide.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-lg px-12 py-4 shadow-lg hover:shadow-xl transition-all duration-300 group">
              Enroll Now - Start Today
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}