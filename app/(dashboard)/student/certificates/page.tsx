'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Award,
  Download,
  Share2,
  Eye,
  Calendar,
  CheckCircle,
  ExternalLink,
  Mail,
  Linkedin,
  Twitter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// Mock certificates data
const mockCertificates = [
  {
    id: 'cert1',
    courseId: 'c4',
    courseName: 'World History',
    issueDate: '2024-01-15',
    completionDate: '2024-01-15',
    grade: 94,
    instructor: 'Dr. Sarah Johnson',
    certificateNumber: 'WH-2024-001234',
    skills: ['Historical Analysis', 'Critical Thinking', 'Research Methods'],
    hours: 16.5,
    verified: true
  },
  {
    id: 'cert2',
    courseId: 'c5',
    courseName: 'Chemistry Basics',
    issueDate: '2024-01-10',
    completionDate: '2024-01-10',
    grade: 90,
    instructor: 'Prof. Michael Chen',
    certificateNumber: 'CB-2024-001189',
    skills: ['Chemical Reactions', 'Lab Safety', 'Molecular Structure'],
    hours: 12.7,
    verified: true
  },
  {
    id: 'cert3',
    courseId: 'c6',
    courseName: 'Introduction to Programming',
    issueDate: '2023-12-20',
    completionDate: '2023-12-20',
    grade: 96,
    instructor: 'Dr. Emily Rodriguez',
    certificateNumber: 'IP-2023-005678',
    skills: ['Python', 'Problem Solving', 'Algorithms'],
    hours: 20.0,
    verified: true
  }
]

export default function CertificatesPage() {
  const [certificates] = useState(mockCertificates)
  const [selectedCertificate, setSelectedCertificate] = useState<typeof mockCertificates[0] | null>(null)
  const [showShareDialog, setShowShareDialog] = useState(false)

  const handleDownload = (cert: typeof mockCertificates[0]) => {
    // Download logic
    alert(`Downloading certificate for ${cert.courseName}`)
  }

  const handleShare = (cert: typeof mockCertificates[0]) => {
    setSelectedCertificate(cert)
    setShowShareDialog(true)
  }

  const handleSharePlatform = (platform: string) => {
    if (!selectedCertificate) return
    
    const shareText = `I just completed ${selectedCertificate.courseName} with a grade of ${selectedCertificate.grade}%!`
    const shareUrl = `https://example.com/certificates/${selectedCertificate.certificateNumber}`

    switch (platform) {
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
        break
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent('My Certificate')}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`
        break
    }
  }

  const handleView = (cert: typeof mockCertificates[0]) => {
    setSelectedCertificate(cert)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Certificates</h1>
          <p className="text-gray-600">View and share your earned certificates</p>
        </div>
        <div className="flex items-center gap-2">
          <Award className="w-8 h-8 text-yellow-600" />
          <div>
            <p className="text-2xl font-bold">{certificates.length}</p>
            <p className="text-sm text-gray-600">Earned</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Certificates</p>
                <p className="text-3xl font-bold">{certificates.length}</p>
              </div>
              <Award className="w-12 h-12 text-yellow-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Grade</p>
                <p className="text-3xl font-bold">
                  {Math.round(certificates.reduce((sum, c) => sum + c.grade, 0) / certificates.length)}%
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Study Hours</p>
                <p className="text-3xl font-bold">
                  {certificates.reduce((sum, c) => sum + c.hours, 0).toFixed(1)}h
                </p>
              </div>
              <Calendar className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {certificates.map((cert, index) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{cert.courseName}</CardTitle>
                    <p className="text-sm opacity-90">Certificate of Completion</p>
                  </div>
                  <Award className="w-12 h-12 opacity-50" />
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                {/* Certificate Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Issue Date</p>
                    <p className="font-semibold">
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Final Grade</p>
                    <p className="font-semibold text-green-600">{cert.grade}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Instructor</p>
                    <p className="font-semibold text-sm">{cert.instructor}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Study Hours</p>
                    <p className="font-semibold">{cert.hours}h</p>
                  </div>
                </div>

                {/* Certificate Number */}
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-600 mb-1">Certificate Number</p>
                  <div className="flex items-center justify-between">
                    <code className="text-sm font-mono">{cert.certificateNumber}</code>
                    {cert.verified && (
                      <Badge variant="default" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <p className="text-sm text-gray-600 mb-2">Skills Acquired</p>
                  <div className="flex flex-wrap gap-2">
                    {cert.skills.map((skill, idx) => (
                      <Badge key={idx} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(cert)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(cert)}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(cert)}
                    className="flex-1"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {certificates.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">No Certificates Yet</h3>
            <p className="text-gray-600 mb-4">
              Complete courses to earn certificates and showcase your achievements
            </p>
            <Button>Browse Courses</Button>
          </CardContent>
        </Card>
      )}

      {/* Certificate Preview Dialog */}
      {selectedCertificate && !showShareDialog && (
        <Dialog open={!!selectedCertificate} onOpenChange={() => setSelectedCertificate(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Certificate Preview</DialogTitle>
            </DialogHeader>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-lg border-4 border-double border-blue-600">
              <div className="text-center space-y-6">
                <Award className="w-20 h-20 mx-auto text-yellow-600" />
                <div>
                  <h2 className="text-3xl font-bold mb-2">Certificate of Completion</h2>
                  <p className="text-gray-600">This is to certify that</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-blue-600 mb-2">John Doe</p>
                  <p className="text-gray-600">has successfully completed</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold mb-2">{selectedCertificate.courseName}</p>
                  <p className="text-gray-600">
                    with a final grade of <span className="font-bold text-green-600">{selectedCertificate.grade}%</span>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto pt-8">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Date of Completion</p>
                    <p className="font-semibold">
                      {new Date(selectedCertificate.completionDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Instructor</p>
                    <p className="font-semibold">{selectedCertificate.instructor}</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Certificate Number: {selectedCertificate.certificateNumber}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Verify at: example.com/verify/{selectedCertificate.certificateNumber}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => handleDownload(selectedCertificate)} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowShareDialog(true)
                }}
                className="flex-1"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Share Dialog */}
      {showShareDialog && selectedCertificate && (
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share Certificate</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-600">
                Share your achievement on social media or via email
              </p>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleSharePlatform('linkedin')}
                >
                  <Linkedin className="w-5 h-5 mr-3 text-blue-700" />
                  Share on LinkedIn
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleSharePlatform('twitter')}
                >
                  <Twitter className="w-5 h-5 mr-3 text-blue-400" />
                  Share on Twitter
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleSharePlatform('email')}
                >
                  <Mail className="w-5 h-5 mr-3 text-gray-600" />
                  Share via Email
                </Button>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Certificate Link</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`https://example.com/certificates/${selectedCertificate.certificateNumber}`}
                    readOnly
                    className="flex-1 px-3 py-2 border rounded text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `https://example.com/certificates/${selectedCertificate.certificateNumber}`
                      )
                      alert('Link copied to clipboard!')
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
