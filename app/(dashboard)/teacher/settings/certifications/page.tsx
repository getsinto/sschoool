'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Upload, Trash2, Award, FileText } from 'lucide-react'
import Link from 'next/link'

interface Certification {
  id: string
  name: string
  issuer: string
  issueDate: string
  expiryDate?: string
  credentialId?: string
  status: 'active' | 'expired' | 'pending'
}

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([
    {
      id: '1',
      name: 'Master of Science in Mathematics',
      issuer: 'University Name',
      issueDate: '2018-05-15',
      status: 'active'
    },
    {
      id: '2',
      name: 'Teaching Certification',
      issuer: 'State Board of Education',
      issueDate: '2019-06-20',
      expiryDate: '2029-06-20',
      credentialId: 'TC-2019-12345',
      status: 'active'
    },
    {
      id: '3',
      name: 'Online Teaching Certificate',
      issuer: 'EdTech Institute',
      issueDate: '2020-03-10',
      credentialId: 'OTC-2020-67890',
      status: 'active'
    }
  ])

  const [showAddForm, setShowAddForm] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDelete = (id: string) => {
    setCertifications(prev => prev.filter(cert => cert.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/teacher/profile">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certifications</h1>
          <p className="text-gray-600 mt-1">Manage your teaching certifications and credentials</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Certification
        </Button>
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Certification</CardTitle>
            <CardDescription>Enter your certification details</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="certName">Certification Name</Label>
                  <Input id="certName" placeholder="e.g., Teaching License" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="issuer">Issuing Organization</Label>
                  <Input id="issuer" placeholder="e.g., State Board" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input id="issueDate" type="date" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                  <Input id="expiryDate" type="date" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="credentialId">Credential ID (Optional)</Label>
                <Input id="credentialId" placeholder="e.g., TC-2024-12345" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="document">Upload Document</Label>
                <div className="flex items-center gap-2">
                  <Input id="document" type="file" accept=".pdf,.jpg,.jpeg,.png" />
                  <Button type="button" variant="outline">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500">PDF, JPG, or PNG. Max size 5MB.</p>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Certification
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {certifications.map((cert) => (
          <Card key={cert.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{cert.name}</h3>
                        <p className="text-sm text-gray-600">{cert.issuer}</p>
                      </div>
                      <Badge className={getStatusColor(cert.status)}>
                        {cert.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-gray-500">Issue Date</p>
                        <p className="font-medium">
                          {new Date(cert.issueDate).toLocaleDateString()}
                        </p>
                      </div>
                      {cert.expiryDate && (
                        <div>
                          <p className="text-gray-500">Expiry Date</p>
                          <p className="font-medium">
                            {new Date(cert.expiryDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      {cert.credentialId && (
                        <div>
                          <p className="text-gray-500">Credential ID</p>
                          <p className="font-medium">{cert.credentialId}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <FileText className="w-3 h-3 mr-1" />
                        View Document
                      </Button>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(cert.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {certifications.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No certifications yet</h3>
            <p className="text-gray-600 mb-4">
              Add your teaching certifications and credentials to showcase your qualifications
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Certification
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
