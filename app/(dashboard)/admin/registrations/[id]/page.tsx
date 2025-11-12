'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft,
  CheckCircle, 
  XCircle, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  FileText,
  Download,
  Eye,
  User,
  Shield,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'

interface RegistrationDetail {
  id: string
  first_name: string
  last_name: string
  email: string
  role: 'student' | 'teacher' | 'parent' | 'spoken_english'
  account_status: string
  email_verified: boolean
  created_at: string
  mobile_number?: string
  whatsapp_number?: string
  date_of_birth?: string
  gender?: string
  country?: string
  state?: string
  city?: string
  address?: string
  postal_code?: string
  category_specific_data: any
  consent_data: any
  id_type?: string
  id_number?: string
  id_front_url?: string
  id_back_url?: string
  profile_photo_url?: string
  selfie_with_id_url?: string
}

export default function RegistrationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [registration, setRegistration] = useState<RegistrationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadRegistration(params.id as string)
    }
  }, [params.id])

  const loadRegistration = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/registrations/${id}`)
      if (response.ok) {
        const data = await response.json()
        setRegistration(data.registration)
      }
    } catch (error) {
      console.error('Failed to load registration:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!registration) return
    
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/registrations/${registration.id}/approve`, {
        method: 'POST'
      })
      if (response.ok) {
        setRegistration({ ...registration, account_status: 'active' })
      }
    } catch (error) {
      console.error('Failed to approve registration:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!registration || !rejectionReason.trim()) return
    
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/registrations/${registration.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason })
      })
      if (response.ok) {
        setRegistration({ ...registration, account_status: 'rejected' })
        setShowRejectForm(false)
        setRejectionReason('')
      }
    } catch (error) {
      console.error('Failed to reject registration:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string, emailVerified: boolean) => {
    if (!emailVerified) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Email Pending</Badge>
    }
    
    switch (status) {
      case 'pending_verification':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Pending Verification</Badge>
      case 'pending_review':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Pending Review</Badge>
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student': return '🎓'
      case 'teacher': return '👨‍🏫'
      case 'parent': return '👨‍👩‍👧'
      case 'spoken_english': return '🗣️'
      default: return '👤'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading registration details...</p>
        </div>
      </div>
    )
  }

  if (!registration) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertDescription>Registration not found.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Registrations
        </Button>
        
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{getRoleIcon(registration.role)}</span>
            <div>
              <h1 className="text-3xl font-bold">
                {registration.first_name} {registration.last_name}
              </h1>
              <p className="text-muted-foreground capitalize">
                {registration.role.replace('_', ' ')} Registration
              </p>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge(registration.account_status, registration.email_verified)}
                <Badge variant="outline">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(registration.created_at), 'MMM dd, yyyy')}
                </Badge>
              </div>
            </div>
          </div>
          
          {registration.account_status === 'pending_review' && (
            <div className="flex gap-2">
              <Button
                onClick={handleApprove}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Registration
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowRejectForm(true)}
                disabled={actionLoading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Registration
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Form */}
      {showRejectForm && (
        <Card className="mb-6 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">Reject Registration</CardTitle>
            <CardDescription>
              Please provide a reason for rejecting this registration. This will be sent to the applicant.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">Rejection Reason</Label>
                <Textarea
                  id="reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please explain why this registration is being rejected..."
                  rows={4}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || actionLoading}
                >
                  Confirm Rejection
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectForm(false)
                    setRejectionReason('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Details Tabs */}
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="address">Address</TabsTrigger>
          <TabsTrigger value="specific">Role Specific</TabsTrigger>
          <TabsTrigger value="verification">ID Verification</TabsTrigger>
          <TabsTrigger value="consents">Consents</TabsTrigger>
        </TabsList>

        {/* Personal Information */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                  <p className="text-lg">{registration.first_name} {registration.last_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <p>{registration.email}</p>
                    {registration.email_verified ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700">Verified</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Unverified</Badge>
                    )}
                  </div>
                </div>
                {registration.mobile_number && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Mobile Number</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <p>{registration.mobile_number}</p>
                    </div>
                  </div>
                )}
                {registration.whatsapp_number && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">WhatsApp Number</Label>
                    <p>{registration.whatsapp_number}</p>
                  </div>
                )}
                {registration.date_of_birth && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                    <p>{format(new Date(registration.date_of_birth), 'MMMM dd, yyyy')}</p>
                  </div>
                )}
                {registration.gender && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Gender</Label>
                    <p className="capitalize">{registration.gender.replace('_', ' ')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Address Information */}
        <TabsContent value="address">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {registration.country && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Country</Label>
                    <p>{registration.country}</p>
                  </div>
                )}
                {registration.state && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">State/Province</Label>
                    <p>{registration.state}</p>
                  </div>
                )}
                {registration.city && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">City</Label>
                    <p>{registration.city}</p>
                  </div>
                )}
                {registration.postal_code && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Postal Code</Label>
                    <p>{registration.postal_code}</p>
                  </div>
                )}
                {registration.address && (
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-muted-foreground">Full Address</Label>
                    <p>{registration.address}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Role Specific Information */}
        <TabsContent value="specific">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-xl">{getRoleIcon(registration.role)}</span>
                {registration.role === 'teacher' && 'Teaching Information'}
                {registration.role === 'student' && 'Student Information'}
                {registration.role === 'parent' && 'Parent Information'}
                {registration.role === 'spoken_english' && 'English Learning Information'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {registration.category_specific_data && (
                <div className="space-y-4">
                  {Object.entries(registration.category_specific_data).map(([key, value]) => (
                    <div key={key}>
                      <Label className="text-sm font-medium text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </Label>
                      <p className="mt-1">
                        {Array.isArray(value) ? value.join(', ') : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ID Verification */}
        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                ID Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {registration.id_type && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">ID Type</Label>
                    <p>{registration.id_type}</p>
                  </div>
                )}
                {registration.id_number && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">ID Number</Label>
                    <p>{registration.id_number}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {registration.id_front_url && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">ID Front</Label>
                      <div className="mt-2">
                        <img 
                          src={registration.id_front_url} 
                          alt="ID Front" 
                          className="max-w-full h-48 object-cover rounded border"
                        />
                        <Button variant="outline" size="sm" className="mt-2">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}
                  {registration.id_back_url && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">ID Back</Label>
                      <div className="mt-2">
                        <img 
                          src={registration.id_back_url} 
                          alt="ID Back" 
                          className="max-w-full h-48 object-cover rounded border"
                        />
                        <Button variant="outline" size="sm" className="mt-2">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}
                  {registration.profile_photo_url && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Profile Photo</Label>
                      <div className="mt-2">
                        <img 
                          src={registration.profile_photo_url} 
                          alt="Profile" 
                          className="w-32 h-32 object-cover rounded-full border"
                        />
                      </div>
                    </div>
                  )}
                  {registration.selfie_with_id_url && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Selfie with ID</Label>
                      <div className="mt-2">
                        <img 
                          src={registration.selfie_with_id_url} 
                          alt="Selfie with ID" 
                          className="max-w-full h-48 object-cover rounded border"
                        />
                        <Button variant="outline" size="sm" className="mt-2">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consents */}
        <TabsContent value="consents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Consents & Agreements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {registration.consent_data && (
                <div className="space-y-4">
                  {Object.entries(registration.consent_data).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded">
                      <span className="capitalize">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </span>
                      <Badge variant={value ? "outline" : "secondary"} className={
                        value 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : "bg-red-50 text-red-700 border-red-200"
                      }>
                        {value ? 'Accepted' : 'Declined'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
