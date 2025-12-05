'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Save, RefreshCw } from 'lucide-react'
import { WebsiteContent } from '@/types/website-content'

export default function ContentEditorPage() {
  const [content, setContent] = useState<WebsiteContent[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')

  // Hero section state
  const [heroHeading, setHeroHeading] = useState('')
  const [heroSubheading, setHeroSubheading] = useState('')
  const [heroCtaText, setHeroCtaText] = useState('')
  const [heroCtaLink, setHeroCtaLink] = useState('')

  // About section state
  const [missionStatement, setMissionStatement] = useState('')
  const [visionStatement, setVisionStatement] = useState('')

  // Contact section state
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactAddress, setContactAddress] = useState('')

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/admin/website-content/content')
      const data = await response.json()
      const contentArray = data.content || []
      setContent(contentArray)

      // Populate form fields
      contentArray.forEach((item: WebsiteContent) => {
        switch (item.content_key) {
          case 'hero_heading':
            setHeroHeading(item.content_value || '')
            break
          case 'hero_subheading':
            setHeroSubheading(item.content_value || '')
            break
          case 'hero_cta_text':
            setHeroCtaText(item.content_value || '')
            break
          case 'hero_cta_link':
            setHeroCtaLink(item.content_value || '')
            break
          case 'mission_statement':
            setMissionStatement(item.content_value || '')
            break
          case 'vision_statement':
            setVisionStatement(item.content_value || '')
            break
          case 'contact_email':
            setContactEmail(item.content_value || '')
            break
          case 'contact_phone':
            setContactPhone(item.content_value || '')
            break
          case 'contact_address':
            setContactAddress(item.content_value || '')
            break
        }
      })
    } catch (error) {
      console.error('Error fetching content:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveContent = async (key: string, value: string, type: string, section: string) => {
    try {
      const response = await fetch('/api/admin/website-content/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_key: key,
          content_value: value,
          content_type: type,
          section
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save content')
      }

      return true
    } catch (error) {
      console.error('Error saving content:', error)
      return false
    }
  }

  const handleSaveHero = async () => {
    setSaving(true)
    try {
      await Promise.all([
        saveContent('hero_heading', heroHeading, 'text', 'hero'),
        saveContent('hero_subheading', heroSubheading, 'text', 'hero'),
        saveContent('hero_cta_text', heroCtaText, 'text', 'hero'),
        saveContent('hero_cta_link', heroCtaLink, 'url', 'hero')
      ])
      alert('Hero section saved successfully!')
    } catch (error) {
      alert('Error saving hero section')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAbout = async () => {
    setSaving(true)
    try {
      await Promise.all([
        saveContent('mission_statement', missionStatement, 'text', 'about'),
        saveContent('vision_statement', visionStatement, 'text', 'about')
      ])
      alert('About section saved successfully!')
    } catch (error) {
      alert('Error saving about section')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveContact = async () => {
    setSaving(true)
    try {
      await Promise.all([
        saveContent('contact_email', contactEmail, 'text', 'contact'),
        saveContent('contact_phone', contactPhone, 'text', 'contact'),
        saveContent('contact_address', contactAddress, 'text', 'contact')
      ])
      alert('Contact section saved successfully!')
    } catch (error) {
      alert('Error saving contact section')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Website Content Editor</h1>
          <p className="text-gray-600">Edit global website content</p>
        </div>
        <Button onClick={fetchContent} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="about">About Us</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>
                Edit the main hero section on your homepage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Main Heading</Label>
                <Input
                  value={heroHeading}
                  onChange={(e) => setHeroHeading(e.target.value)}
                  placeholder="Discover Excellence at St Haroon Online School"
                />
                <p className="text-sm text-gray-500">
                  The main headline displayed prominently on your homepage
                </p>
              </div>

              <div className="space-y-2">
                <Label>Subheading</Label>
                <Textarea
                  value={heroSubheading}
                  onChange={(e) => setHeroSubheading(e.target.value)}
                  placeholder="Quality education from the comfort of your home"
                  rows={2}
                />
                <p className="text-sm text-gray-500">
                  Supporting text below the main heading
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Call-to-Action Button Text</Label>
                  <Input
                    value={heroCtaText}
                    onChange={(e) => setHeroCtaText(e.target.value)}
                    placeholder="Enroll Now"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Call-to-Action Button Link</Label>
                  <Input
                    value={heroCtaLink}
                    onChange={(e) => setHeroCtaLink(e.target.value)}
                    placeholder="/register"
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3">Preview</h3>
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg">
                  <h1 className="text-4xl font-bold mb-4">{heroHeading || 'Your Heading Here'}</h1>
                  <p className="text-xl mb-6">{heroSubheading || 'Your subheading here'}</p>
                  <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold">
                    {heroCtaText || 'Button Text'}
                  </button>
                </div>
              </div>

              <Button onClick={handleSaveHero} disabled={saving} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Hero Section'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About Us Section</CardTitle>
              <CardDescription>
                Edit your mission and vision statements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Mission Statement</Label>
                <Textarea
                  value={missionStatement}
                  onChange={(e) => setMissionStatement(e.target.value)}
                  placeholder="To provide world-class education accessible to everyone"
                  rows={4}
                />
                <p className="text-sm text-gray-500">
                  Your organization's mission and purpose
                </p>
              </div>

              <div className="space-y-2">
                <Label>Vision Statement</Label>
                <Textarea
                  value={visionStatement}
                  onChange={(e) => setVisionStatement(e.target.value)}
                  placeholder="Empowering students globally through innovative online learning"
                  rows={4}
                />
                <p className="text-sm text-gray-500">
                  Your long-term vision and goals
                </p>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3">Preview</h3>
                <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Our Mission</h3>
                    <p className="text-gray-700">{missionStatement || 'Your mission statement here'}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Our Vision</h3>
                    <p className="text-gray-700">{visionStatement || 'Your vision statement here'}</p>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveAbout} disabled={saving} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save About Section'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Edit your contact details displayed on the website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="info@stharoon.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+1234567890"
                />
              </div>

              <div className="space-y-2">
                <Label>Physical Address</Label>
                <Textarea
                  value={contactAddress}
                  onChange={(e) => setContactAddress(e.target.value)}
                  placeholder="123 Education Street, Learning City"
                  rows={3}
                />
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3">Preview</h3>
                <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge>Email</Badge>
                    <span>{contactEmail || 'your-email@example.com'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge>Phone</Badge>
                    <span>{contactPhone || '+1234567890'}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge>Address</Badge>
                    <span>{contactAddress || 'Your address here'}</span>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveContact} disabled={saving} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Contact Info'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>All Content Keys</CardTitle>
          <CardDescription>
            View all content keys in the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {content.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <span className="font-mono text-sm">{item.content_key}</span>
                  <Badge variant="outline" className="ml-2">{item.content_type}</Badge>
                </div>
                <Badge variant="secondary">{item.section}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
