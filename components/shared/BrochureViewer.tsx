'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, ZoomIn, ZoomOut, X, FileText, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface BrochureViewerProps {
  pdfUrl: string
  title?: string
  description?: string
  thumbnailUrl?: string
  previewImage?: string
  className?: string
}

export default function BrochureViewer({
  pdfUrl,
  title = "School Brochure",
  description = "Download our comprehensive brochure to learn more about our programs and facilities.",
  thumbnailUrl,
  previewImage,
  className = ''
}: BrochureViewerProps) {
  // Use previewImage or thumbnailUrl, with previewImage taking priority
  const imageUrl = previewImage || thumbnailUrl
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = `${title.replace(/\s+/g, '_')}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 25, 200))
  }

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 25, 50))
  }

  const resetZoom = () => {
    setZoomLevel(100)
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}>
      <div className="p-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
          <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Brochure Preview */}
          <div className="flex-1">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => setIsModalOpen(true)}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Brochure Preview"
                  className="w-full h-64 object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <FileText className="w-24 h-24 text-blue-400 mb-4" />
                  <p className="text-blue-600 font-medium">Click to preview brochure</p>
                </div>
              )}
              
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 rounded-xl flex items-center justify-center">
                <div className="opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <Eye className="w-12 h-12 text-white" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-4 lg:w-64">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="w-full group">
                  <Eye className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Preview Brochure
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl h-[80vh]">
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span>{title}</span>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={zoomOut}>
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                      <span className="text-sm font-medium min-w-[60px] text-center">
                        {zoomLevel}%
                      </span>
                      <Button variant="outline" size="sm" onClick={zoomIn}>
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={resetZoom}>
                        Reset
                      </Button>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-auto">
                  <iframe
                    src={`${pdfUrl}#zoom=${zoomLevel}`}
                    className="w-full h-full border-0 rounded-lg"
                    title={title}
                  />
                </div>
              </DialogContent>
            </Dialog>

            <Button onClick={handleDownload} size="lg" className="w-full group">
              <Download className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Download PDF
            </Button>

            <div className="text-center text-sm text-gray-500 mt-4">
              <p>PDF • High Quality</p>
              <p>Compatible with all devices</p>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Comprehensive Info</h4>
            <p className="text-sm text-gray-600">Complete details about our programs</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Download className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Easy Download</h4>
            <p className="text-sm text-gray-600">Instant PDF download available</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Eye className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-900">Preview First</h4>
            <p className="text-sm text-gray-600">View before downloading</p>
          </div>
        </div>
      </div>
    </div>
  )
}