'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { 
  X, 
  CheckCircle, 
  XCircle, 
  ZoomIn, 
  Download,
  Shield,
  User,
  Calendar,
  MapPin
} from 'lucide-react'

interface UserDetails {
  id: string
  fullName: string
  email: string
  role: string
  registrationDate: string
  verificationStatus: 'pending' | 'verified' | 'rejected'
  idDocuments?: {
    front: string
    back: string
    uploadDate: string
  }
  address?: {
    street: string
    city: string
    state: string
    country: string
    zipCode: string
  }
}

interface VerificationModalProps {
  isOpen: boolean
  onClose: () => void
  user: UserDetails
  onVerificationUpdate: (status: 'verified' | 'rejected', reason?: string) => void
}

export default function VerificationModal({ 
  isOpen, 
  onClose, 
  user, 
  onVerificationUpdate 
}: VerificationModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const handleVerification = async (status: 'verified' | 'rejected') => {
    if (status === 'rejected' && !reason.trim()) {
      return
    }

    setIsProcessing(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      onVerificationUpdate(status, reason)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold">ID Verification Review</h2>
              <p className="text-gray-600">{user.fullName} - {user.email}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Panel - User Info */}
          <div className="w-1/3 p-6 border-r bg-gray-50 overflow-y-auto">
            <div className="space-y-6">
              {/* User Profile */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-blue-100 text-blue-800">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Registered</p>
                      <p className="font-medium">{new Date(user.registrationDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {user.address && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium text-sm">
                          {user.address.street}<br />
                          {user.address.city}, {user.address.state} {user.address.zipCode}<br />
                          {user.address.country}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Verification Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Verification Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Add notes about the verification (required for rejection)..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handleVerification('verified')}
                  disabled={isProcessing}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Approve Verification'}
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-300 hover:bg-red-50"
                  onClick={() => handleVerification('rejected')}
                  disabled={isProcessing || !reason.trim()}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Reject Verification'}
                </Button>

                {!reason.trim() && (
                  <p className="text-xs text-red-600 text-center">
                    Reason is required for rejection
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Document Review */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">ID Documents</h3>
                {user.idDocuments ? (
                  <div className="space-y-6">
                    <p className="text-sm text-gray-600">
                      Uploaded on {new Date(user.idDocuments.uploadDate).toLocaleDateString()}
                    </p>

                    {/* Document Images */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Front Side */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">Front Side</h4>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedImage(user.idDocuments!.front)}
                            >
                              <ZoomIn className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-2">
                          <img
                            src={user.idDocuments.front}
                            alt="ID Front"
                            className="w-full h-64 object-contain rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setSelectedImage(user.idDocuments!.front)}
                          />
                        </div>
                      </div>

                      {/* Back Side */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">Back Side</h4>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedImage(user.idDocuments!.back)}
                            >
                              <ZoomIn className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-2">
                          <img
                            src={user.idDocuments.back}
                            alt="ID Back"
                            className="w-full h-64 object-contain rounded cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setSelectedImage(user.idDocuments!.back)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Verification Checklist */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Verification Checklist</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Document is clear and readable</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Name matches user profile</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Document is not expired</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">No signs of tampering or forgery</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Address matches (if applicable)</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm">Photo matches user (if applicable)</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No documents uploaded</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Image Zoom Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={() => setSelectedImage(null)}
          >
            <div className="max-w-4xl max-h-4xl p-4">
              <img
                src={selectedImage}
                alt="Zoomed ID Document"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}