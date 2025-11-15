'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { 
  Settings, 
  Globe, 
  CreditCard, 
  Mail, 
  Video, 
  Search,
  Shield,
  Wrench,
  Save,
  Upload,
  TestTube
} from 'lucide-react'
import PaymentGatewayConfig from '@/components/admin/settings/PaymentGatewayConfig'
import EmailConfigTest from '@/components/admin/settings/EmailConfigTest'
import BackupManager from '@/components/admin/settings/BackupManager'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    general: {
      siteName: 'St Haroon Online School',
      siteDescription: 'Quality online education platform',
      contactEmail: 'support@stharoon.com',
      contactPhone: '+1 234 567 8900',
      contactAddress: '123 Education St, Learning City',
      timezone: 'UTC',
      language: 'en',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      maxFileSize: '10',
      allowedFileTypes: 'pdf,doc,docx,jpg,png'
    },
    payment: {
      defaultGateway: 'stripe',
      taxRate: '10',
      processingFee: '2.5',
      autoRefund: true
    },
    email: {
      provider: 'resend',
      fromEmail: 'noreply@stharoon.com',
      fromName: 'St Haroon School',
      replyTo: 'support@stharoon.com'
    },
    liveClasses: {
      defaultProvider: 'zoom',
      defaultDuration: '60',
      autoRecord: true,
      waitingRoom: true
    },
    seo: {
      siteTitle: 'St Haroon Online School - Quality Education',
      metaDescription: 'Learn from the best teachers online',
      metaKeywords: 'online school, education, learning',
      googleAnalyticsId: '',
      facebookPixel: ''
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: '30',
      passwordMinLength: '8',
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      loginAttemptLimit: '5'
    },
    maintenance: {
      maintenanceMode: false,
      maintenanceMessage: 'We are currently performing maintenance. Please check back soon.',
      autoBackupFrequency: 'daily',
      backupRetention: '30'
    }
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        // Merge with existing settings
        setSettings(prev => ({ ...prev, ...data }))
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    }
  }

  const handleSave = async (section: string) => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [section]: settings[section as keyof typeof settings] })
      })

      if (response.ok) {
        alert('Settings saved successfully!')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-600">Manage platform settings and configuration</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="general">
            <Globe className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="w-4 h-4 mr-2" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="liveClasses">
            <Video className="w-4 h-4 mr-2" />
            Live Classes
          </TabsTrigger>
          <TabsTrigger value="seo">
            <Search className="w-4 h-4 mr-2" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="maintenance">
            <Wrench className="w-4 h-4 mr-2" />
            Maintenance
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Platform Name</Label>
                  <Input
                    value={settings.general.siteName}
                    onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) => updateSetting('general', 'contactEmail', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Contact Phone</Label>
                  <Input
                    value={settings.general.contactPhone}
                    onChange={(e) => updateSetting('general', 'contactPhone', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Timezone</Label>
                  <select
                    value={settings.general.timezone}
                    onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Europe/London">London</option>
                    <option value="Asia/Dubai">Dubai</option>
                  </select>
                </div>
                <div>
                  <Label>Default Language</Label>
                  <select
                    value={settings.general.language}
                    onChange={(e) => updateSetting('general', 'language', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                  </select>
                </div>
                <div>
                  <Label>Currency</Label>
                  <select
                    value={settings.general.currency}
                    onChange={(e) => updateSetting('general', 'currency', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="AED">AED - UAE Dirham</option>
                  </select>
                </div>
                <div>
                  <Label>Max File Upload Size (MB)</Label>
                  <Input
                    type="number"
                    value={settings.general.maxFileSize}
                    onChange={(e) => updateSetting('general', 'maxFileSize', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Allowed File Types</Label>
                  <Input
                    value={settings.general.allowedFileTypes}
                    onChange={(e) => updateSetting('general', 'allowedFileTypes', e.target.value)}
                    placeholder="pdf,doc,docx,jpg,png"
                  />
                </div>
              </div>
              <div>
                <Label>Site Description</Label>
                <textarea
                  value={settings.general.siteDescription}
                  onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <Label>Contact Address</Label>
                <textarea
                  value={settings.general.contactAddress}
                  onChange={(e) => updateSetting('general', 'contactAddress', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={2}
                />
              </div>
              <Button onClick={() => handleSave('general')} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save General Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Gateways */}
        <TabsContent value="payment">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Gateway Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Configure your payment gateways. Payment gateway configuration components are available.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Tax Rate (%)</Label>
                    <Input
                      type="number"
                      value={settings.payment.taxRate}
                      onChange={(e) => updateSetting('payment', 'taxRate', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Processing Fee (%)</Label>
                    <Input
                      type="number"
                      value={settings.payment.processingFee}
                      onChange={(e) => updateSetting('payment', 'processingFee', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Default Gateway</Label>
                    <select
                      value={settings.payment.defaultGateway}
                      onChange={(e) => updateSetting('payment', 'defaultGateway', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="stripe">Stripe</option>
                      <option value="paypal">PayPal</option>
                      <option value="razorpay">Razorpay</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.payment.autoRefund}
                    onCheckedChange={(checked) => updateSetting('payment', 'autoRefund', checked)}
                  />
                  <Label>Enable Auto-Refund Policy</Label>
                </div>
                <Button onClick={() => handleSave('payment')} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Payment Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Email Configuration */}
        <TabsContent value="email">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email Provider</Label>
                    <select
                      value={settings.email.provider}
                      onChange={(e) => updateSetting('email', 'provider', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="resend">Resend</option>
                      <option value="sendgrid">SendGrid</option>
                      <option value="smtp">SMTP</option>
                    </select>
                  </div>
                  <div>
                    <Label>From Email</Label>
                    <Input
                      type="email"
                      value={settings.email.fromEmail}
                      onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>From Name</Label>
                    <Input
                      value={settings.email.fromName}
                      onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Reply-To Email</Label>
                    <Input
                      type="email"
                      value={settings.email.replyTo}
                      onChange={(e) => updateSetting('email', 'replyTo', e.target.value)}
                    />
                  </div>
                </div>
                <Button onClick={() => handleSave('email')} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Email Settings
                </Button>
              </CardContent>
            </Card>

            <EmailConfigTest />
          </div>
        </TabsContent>

        {/* Live Classes */}
        <TabsContent value="liveClasses">
          <Card>
            <CardHeader>
              <CardTitle>Live Classes Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Default Provider</Label>
                  <select
                    value={settings.liveClasses.defaultProvider}
                    onChange={(e) => updateSetting('liveClasses', 'defaultProvider', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="zoom">Zoom</option>
                    <option value="googlemeet">Google Meet</option>
                  </select>
                </div>
                <div>
                  <Label>Default Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={settings.liveClasses.defaultDuration}
                    onChange={(e) => updateSetting('liveClasses', 'defaultDuration', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.liveClasses.autoRecord}
                    onCheckedChange={(checked) => updateSetting('liveClasses', 'autoRecord', checked)}
                  />
                  <Label>Auto-Record Classes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.liveClasses.waitingRoom}
                    onCheckedChange={(checked) => updateSetting('liveClasses', 'waitingRoom', checked)}
                  />
                  <Label>Enable Waiting Room</Label>
                </div>
              </div>
              <Button onClick={() => handleSave('liveClasses')} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                Save Live Classes Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO & Meta */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO & Meta Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Site Title</Label>
                <Input
                  value={settings.seo.siteTitle}
                  onChange={(e) => updateSetting('seo', 'siteTitle', e.target.value)}
                />
              </div>
              <div>
                <Label>Meta Description</Label>
                <textarea
                  value={settings.seo.metaDescription}
                  onChange={(e) => updateSetting('seo', 'metaDescription', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <Label>Meta Keywords</Label>
                <Input
                  value={settings.seo.metaKeywords}
                  onChange={(e) => updateSetting('seo', 'metaKeywords', e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Google Analytics ID</Label>
                  <Input
                    value={settings.seo.googleAnalyticsId}
                    onChange={(e) => updateSetting('seo', 'googleAnalyticsId', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
                <div>
                  <Label>Facebook Pixel ID</Label>
                  <Input
                    value={settings.seo.facebookPixel}
                    onChange={(e) => updateSetting('seo', 'facebookPixel', e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={() => handleSave('seo')} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                Save SEO Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) => updateSetting('security', 'twoFactorAuth', checked)}
                />
                <Label>Enable Two-Factor Authentication</Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Session Timeout (minutes)</Label>
                  <Input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Login Attempt Limit</Label>
                  <Input
                    type="number"
                    value={settings.security.loginAttemptLimit}
                    onChange={(e) => updateSetting('security', 'loginAttemptLimit', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label className="text-lg font-semibold">Password Policy</Label>
                <div className="mt-2 space-y-2">
                  <div>
                    <Label>Minimum Length</Label>
                    <Input
                      type="number"
                      value={settings.security.passwordMinLength}
                      onChange={(e) => updateSetting('security', 'passwordMinLength', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.security.requireUppercase}
                      onCheckedChange={(checked) => updateSetting('security', 'requireUppercase', checked)}
                    />
                    <Label>Require Uppercase Letters</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.security.requireNumbers}
                      onCheckedChange={(checked) => updateSetting('security', 'requireNumbers', checked)}
                    />
                    <Label>Require Numbers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={settings.security.requireSpecialChars}
                      onCheckedChange={(checked) => updateSetting('security', 'requireSpecialChars', checked)}
                    />
                    <Label>Require Special Characters</Label>
                  </div>
                </div>
              </div>
              <Button onClick={() => handleSave('security')} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance */}
        <TabsContent value="maintenance">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Mode</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.maintenance.maintenanceMode}
                    onCheckedChange={(checked) => updateSetting('maintenance', 'maintenanceMode', checked)}
                  />
                  <Label>Enable Maintenance Mode</Label>
                </div>
                <div>
                  <Label>Maintenance Message</Label>
                  <textarea
                    value={settings.maintenance.maintenanceMessage}
                    onChange={(e) => updateSetting('maintenance', 'maintenanceMessage', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={3}
                  />
                </div>
                <Button onClick={() => handleSave('maintenance')} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Maintenance Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Backups</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Auto-Backup Frequency</Label>
                    <select
                      value={settings.maintenance.autoBackupFrequency}
                      onChange={(e) => updateSetting('maintenance', 'autoBackupFrequency', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <Label>Backup Retention (days)</Label>
                    <Input
                      type="number"
                      value={settings.maintenance.backupRetention}
                      onChange={(e) => updateSetting('maintenance', 'backupRetention', e.target.value)}
                    />
                  </div>
                </div>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Create Manual Backup
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
