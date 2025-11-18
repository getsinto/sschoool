'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Award, Download, Eye } from 'lucide-react'

interface CertificateSettingsProps {
  value?: any
  onChange: (settings: any) => void
}

const CERTIFICATE_TEMPLATES = [
  { id: 'classic', name: 'Classic' },
  { id: 'modern', name: 'Modern' },
  { id: 'elegant', name: 'Elegant' },
  { id: 'professional', name: 'Professional' }
]

export function CertificateSettings({ value, onChange }: CertificateSettingsProps) {
  const [settings, setSettings] = useState({
    awardCertificate: value?.awardCertificate || false,
    template: value?.template || 'classic',
    minimumCompletionPercentage: value?.minimumCompletionPercentage || 80,
    minimumQuizAverage: value?.minimumQuizAverage || 70,
    requireAllLessons: value?.requireAllLessons || true,
    certificateTitle: value?.certificateTitle || 'Certificate of Completion',
    certificateText: value?.certificateText || 'This is to certify that {STUDENT_NAME} has successfully completed the course {COURSE_NAME} on {COMPLETION_DATE}.',
    customMessage: value?.customMessage || '',
    enableDownload: value?.enableDownload || true,
    enableSharing: value?.enableSharing || true,
    watermark: value?.watermark || ''
  })

  const updateSetting = (key: string, value: any) => {
    const updated = { ...settings, [key]: value }
    setSettings(updated)
    onChange(updated)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              <CardTitle>Certificate of Completion</CardTitle>
            </div>
            <Switch
              checked={settings.awardCertificate}
              onCheckedChange={(checked) => updateSetting('awardCertificate', checked)}
            />
          </div>
        </CardHeader>
        
        {settings.awardCertificate && (
          <CardContent className="space-y-6">
            <div>
              <Label>Certificate Template</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {CERTIFICATE_TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    className={`
                      border-2 rounded-lg p-3 cursor-pointer transition-colors
                      ${settings.template === template.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'}
                    `}
                    onClick={() => updateSetting('template', template.id)}
                  >
                    <div className="aspect-[4/3] bg-gray-100 rounded mb-2 flex items-center justify-center">
                      <Award className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-center">{template.name}</p>
                    {settings.template === template.id && (
                      <Badge className="w-full justify-center mt-1">Selected</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Certificate Requirements</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Minimum Completion Percentage *</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="number"
                      value={settings.minimumCompletionPercentage}
                      onChange={(e) => updateSetting('minimumCompletionPercentage', parseInt(e.target.value) || 80)}
                      min="0"
                      max="100"
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                </div>
                <div>
                  <Label>Minimum Quiz Average (Optional)</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      type="number"
                      value={settings.minimumQuizAverage}
                      onChange={(e) => updateSetting('minimumQuizAverage', parseInt(e.target.value) || 70)}
                      min="0"
                      max="100"
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Leave at 0 to ignore quiz scores
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Require All Lessons Completed</Label>
                  <p className="text-sm text-gray-500">
                    Student must complete every lesson to earn certificate
                  </p>
                </div>
                <Switch
                  checked={settings.requireAllLessons}
                  onCheckedChange={(checked) => updateSetting('requireAllLessons', checked)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Certificate Content</h4>
              <div>
                <Label>Certificate Title</Label>
                <Input
                  value={settings.certificateTitle}
                  onChange={(e) => updateSetting('certificateTitle', e.target.value)}
                  placeholder="Certificate of Completion"
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Certificate Text</Label>
                <Textarea
                  value={settings.certificateText}
                  onChange={(e) => updateSetting('certificateText', e.target.value)}
                  placeholder="This is to certify that {STUDENT_NAME} has successfully completed..."
                  rows={3}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use placeholders: {'{STUDENT_NAME}'}, {'{COURSE_NAME}'}, {'{COMPLETION_DATE}'}, {'{INSTRUCTOR_NAME}'}
                </p>
              </div>
              <div>
                <Label>Custom Message (Optional)</Label>
                <Textarea
                  value={settings.customMessage}
                  onChange={(e) => updateSetting('customMessage', e.target.value)}
                  placeholder="Add a personal message from the instructor..."
                  rows={2}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Certificate Options</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Download</Label>
                    <p className="text-sm text-gray-500">
                      Allow students to download their certificate as PDF
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableDownload}
                    onCheckedChange={(checked) => updateSetting('enableDownload', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Social Sharing</Label>
                    <p className="text-sm text-gray-500">
                      Allow students to share their achievement on social media
                    </p>
                  </div>
                  <Switch
                    checked={settings.enableSharing}
                    onCheckedChange={(checked) => updateSetting('enableSharing', checked)}
                  />
                </div>
              </div>
              <div>
                <Label>Watermark Text (Optional)</Label>
                <Input
                  value={settings.watermark}
                  onChange={(e) => updateSetting('watermark', e.target.value)}
                  placeholder="e.g., Your School Name"
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Subtle watermark text that appears on the certificate
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1">
                <Eye className="w-4 h-4 mr-2" />
                Preview Certificate
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download Sample
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {!settings.awardCertificate && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">No Certificate Awarded</h3>
              <p className="text-sm text-gray-600 mb-4">
                Enable certificates to motivate students and recognize their achievements
              </p>
              <Button onClick={() => updateSetting('awardCertificate', true)}>
                Enable Certificates
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
