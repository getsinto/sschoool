'use client'

import { useState } from 'react'
import { Search, Facebook, Twitter, Linkedin, Globe } from 'lucide-react'

interface SEOPreviewProps {
  title: string
  metaTitle?: string
  description: string
  metaDescription?: string
  urlSlug: string
  thumbnail?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
}

type PreviewType = 'google' | 'facebook' | 'twitter' | 'linkedin'

export default function SEOPreview({
  title,
  metaTitle,
  description,
  metaDescription,
  urlSlug,
  thumbnail,
  ogTitle,
  ogDescription,
  ogImage
}: SEOPreviewProps) {
  const [activePreview, setActivePreview] = useState<PreviewType>('google')

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://stharoon.com'
  const fullUrl = `${baseUrl}/courses/${urlSlug || 'your-course'}`
  
  const displayTitle = metaTitle || title || 'Your Course Title'
  const displayDescription = metaDescription || description || 'Your course description'
  const displayImage = ogImage || thumbnail || '/images/course-placeholder.svg'
  const socialTitle = ogTitle || displayTitle
  const socialDescription = ogDescription || displayDescription

  const previewTabs = [
    { id: 'google', label: 'Google', icon: Search },
    { id: 'facebook', label: 'Facebook', icon: Facebook },
    { id: 'twitter', label: 'Twitter', icon: Twitter },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  ] as const

  return (
    <div className="space-y-4">
      {/* Preview Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {previewTabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActivePreview(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 border-b-2 transition-colors
                ${activePreview === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Preview Content */}
      <div className="bg-gray-50 rounded-lg p-6">
        {activePreview === 'google' && (
          <GooglePreview
            title={displayTitle}
            description={displayDescription}
            url={fullUrl}
          />
        )}

        {activePreview === 'facebook' && (
          <FacebookPreview
            title={socialTitle}
            description={socialDescription}
            image={displayImage}
            url={fullUrl}
          />
        )}

        {activePreview === 'twitter' && (
          <TwitterPreview
            title={socialTitle}
            description={socialDescription}
            image={displayImage}
            url={fullUrl}
          />
        )}

        {activePreview === 'linkedin' && (
          <LinkedInPreview
            title={socialTitle}
            description={socialDescription}
            image={displayImage}
            url={fullUrl}
          />
        )}
      </div>

      {/* Character Counts */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">Meta Title</span>
            <span className={`font-medium ${
              displayTitle.length > 60 ? 'text-red-600' : 
              displayTitle.length > 50 ? 'text-yellow-600' : 
              'text-green-600'
            }`}>
              {displayTitle.length}/60
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${
                displayTitle.length > 60 ? 'bg-red-500' : 
                displayTitle.length > 50 ? 'bg-yellow-500' : 
                'bg-green-500'
              }`}
              style={{ width: `${Math.min((displayTitle.length / 60) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <span className="text-gray-600">Meta Description</span>
            <span className={`font-medium ${
              displayDescription.length > 160 ? 'text-red-600' : 
              displayDescription.length > 140 ? 'text-yellow-600' : 
              'text-green-600'
            }`}>
              {displayDescription.length}/160
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${
                displayDescription.length > 160 ? 'bg-red-500' : 
                displayDescription.length > 140 ? 'bg-yellow-500' : 
                'bg-green-500'
              }`}
              style={{ width: `${Math.min((displayDescription.length / 160) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function GooglePreview({ title, description, url }: { title: string; description: string; url: string }) {
  const domain = new URL(url).hostname
  
  return (
    <div className="bg-white rounded-lg p-4 max-w-2xl">
      <div className="flex items-center gap-2 mb-2">
        <Globe className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600">{domain}</span>
      </div>
      <h3 className="text-xl text-blue-600 hover:underline cursor-pointer mb-1">
        {title}
      </h3>
      <p className="text-sm text-gray-600 line-clamp-2">
        {description}
      </p>
    </div>
  )
}

function FacebookPreview({ title, description, image, url }: { title: string; description: string; image: string; url: string }) {
  const domain = new URL(url).hostname
  
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 max-w-lg">
      <div className="aspect-[1.91/1] bg-gray-200 relative">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3 bg-gray-50">
        <div className="text-xs text-gray-500 uppercase mb-1">{domain}</div>
        <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{title}</h4>
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
      </div>
    </div>
  )
}

function TwitterPreview({ title, description, image, url }: { title: string; description: string; image: string; url: string }) {
  const domain = new URL(url).hostname
  
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 max-w-lg">
      <div className="aspect-[2/1] bg-gray-200 relative">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3">
        <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{title}</h4>
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{description}</p>
        <div className="text-xs text-gray-500">{domain}</div>
      </div>
    </div>
  )
}

function LinkedInPreview({ title, description, image, url }: { title: string; description: string; image: string; url: string }) {
  const domain = new URL(url).hostname
  
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-300 max-w-lg">
      <div className="aspect-[1.91/1] bg-gray-200 relative">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-3">
        <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{title}</h4>
        <div className="text-xs text-gray-500 mb-2">{domain}</div>
      </div>
    </div>
  )
}
