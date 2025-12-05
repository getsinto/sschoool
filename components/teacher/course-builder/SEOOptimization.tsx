'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Search, TrendingUp, Link as LinkIcon, Tag, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react'
import { calculateSEOScore, validateSlug, generateSlugFromTitle, suggestKeywords } from '@/lib/seo/analyzer'

interface SEOOptimizationProps {
  courseId?: string
  initialData?: {
    title: string
    description?: string
    meta_title?: string
    meta_description?: string
    seo_keywords?: string[]
    url_slug?: string
    og_title?: string
    og_description?: string
    og_image_url?: string
    category?: string
  }
  onChange?: (data: any) => void
}

export default function SEOOptimization({ courseId, initialData, onChange }: SEOOptimizationProps) {
  const [metaTitle, setMetaTitle] = useState(initialData?.meta_title || '')
  const [metaDescription, setMetaDescription] = useState(initialData?.meta_description || '')
  const [keywords, setKeywords] = useState<string[]>(initialData?.seo_keywords || [])
  const [urlSlug, setUrlSlug] = useState(initialData?.url_slug || '')
  const [ogTitle, setOgTitle] = useState(initialData?.og_title || '')
  const [ogDescription, setOgDescription] = useState(initialData?.og_description || '')
  const [newKeyword, setNewKeyword] = useState('')
  const [slugError, setSlugError] = useState('')
  const [seoScore, setSeoScore] = useState(0)
  const [seoBreakdown, setSeoBreakdown] = useState<any>({})
  const [issues, setIssues] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])

  // Calculate SEO score whenever data changes
  useEffect(() => {
    const courseData = {
      title: initialData?.title || '',
      description: initialData?.description || '',
      meta_title: metaTitle,
      meta_description: metaDescription,
      seo_keywords: keywords,
      url_slug: urlSlug,
      og_title: ogTitle,
      og_description: ogDescription,
      thumbnail: initialData?.og_image_url,
      category: initialData?.category,
    }

    const score = calculateSEOScore(courseData)
    setSeoScore(score.total)
    setSeoBreakdown(score.breakdown)
    setIssues(score.issues)
    setSuggestions(score.suggestions)
  }, [metaTitle, metaDescription, keywords, urlSlug, ogTitle, ogDescription, initialData])

  const handleMetaTitleChange = (value: string) => {
    setMetaTitle(value)
    onChange?.({ meta_title: value })
  }

  const handleMetaDescriptionChange = (value: string) => {
    setMetaDescription(value)
    onChange?.({ meta_description: value })
  }

  const handleSlugChange = (value: string) => {
    setUrlSlug(value)
    const validation = validateSlug(value)
    if (!validation.valid) {
      setSlugError(validation.error || '')
    } else {
      setSlugError('')
      onChange?.({ url_slug: value })
    }
  }

  const generateSlug = () => {
    if (initialData?.title) {
      const slug = generateSlugFromTitle(initialData.title)
      setUrlSlug(slug)
      setSlugError('')
      onChange?.({ url_slug: slug })
    }
  }

  const addKeyword = () => {
    if (newKeyword && !keywords.includes(newKeyword.toLowerCase())) {
      const updated = [...keywords, newKeyword.toLowerCase()]
      setKeywords(updated)
      setNewKeyword('')
      onChange?.({ seo_keywords: updated })
    }
  }

  const removeKeyword = (keyword: string) => {
    const updated = keywords.filter(k => k !== keyword)
    setKeywords(updated)
    onChange?.({ seo_keywords: updated })
  }

  const autoSuggestKeywords = () => {
    if (initialData?.title && initialData?.description) {
      const suggested = suggestKeywords(
        initialData.title,
        initialData.description,
        initialData.category
      )
      const newKeywords = suggested.filter(k => !keywords.includes(k))
      if (newKeywords.length > 0) {
        const updated = [...keywords, ...newKeywords.slice(0, 5)]
        setKeywords(updated)
        onChange?.({ seo_keywords: updated })
      }
    }
  }

  const getSEOScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSEOScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  return (
    <div className="space-y-6">
      {/* SEO Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            SEO Score
          </CardTitle>
          <CardDescription>
            Overall search engine optimization quality
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-4xl font-bold ${getSEOScoreColor(seoScore)}`}>
                {seoScore}/100
              </div>
              <div className="text-sm text-gray-600">{getSEOScoreLabel(seoScore)}</div>
            </div>
            <div className="text-right">
              <Progress value={seoScore} className="w-32 h-3" />
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            {Object.entries(seoBreakdown).map(([key, value]: [string, any]) => (
              <div key={key} className="text-center">
                <div className="text-2xl font-semibold">{value}</div>
                <div className="text-xs text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Issues & Suggestions */}
      {(issues.length > 0 || suggestions.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Optimization Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Issues Found
                </h4>
                <ul className="space-y-1">
                  {issues.map((issue, index) => (
                    <li key={index} className="text-sm text-red-600 flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-600 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Suggestions
                </h4>
                <ul className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm text-blue-600 flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Meta Title */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Meta Title
          </CardTitle>
          <CardDescription>
            Custom title for search engines (50-60 characters optimal)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input
            placeholder={initialData?.title || 'Enter meta title'}
            value={metaTitle}
            onChange={(e) => handleMetaTitleChange(e.target.value)}
            maxLength={60}
          />
          <div className="flex justify-between text-sm">
            <span className={metaTitle.length >= 50 && metaTitle.length <= 60 ? 'text-green-600' : 'text-gray-600'}>
              {metaTitle.length}/60 characters
            </span>
            {!metaTitle && (
              <Button
                variant="link"
                size="sm"
                onClick={() => handleMetaTitleChange(initialData?.title || '')}
              >
                Use course title
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Meta Description */}
      <Card>
        <CardHeader>
          <CardTitle>Meta Description</CardTitle>
          <CardDescription>
            Custom description for search results (120-160 characters optimal)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            placeholder={initialData?.description || 'Enter meta description'}
            value={metaDescription}
            onChange={(e) => handleMetaDescriptionChange(e.target.value)}
            maxLength={160}
            rows={3}
          />
          <div className="flex justify-between text-sm">
            <span className={metaDescription.length >= 120 && metaDescription.length <= 160 ? 'text-green-600' : 'text-gray-600'}>
              {metaDescription.length}/160 characters
            </span>
            {!metaDescription && (
              <Button
                variant="link"
                size="sm"
                onClick={() => handleMetaDescriptionChange(initialData?.description || '')}
              >
                Use course description
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* URL Slug */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5" />
            URL Slug
          </CardTitle>
          <CardDescription>
            SEO-friendly URL for your course
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="course-url-slug"
              value={urlSlug}
              onChange={(e) => handleSlugChange(e.target.value.toLowerCase())}
              className={slugError ? 'border-red-500' : ''}
            />
            <Button onClick={generateSlug} variant="outline">
              Generate
            </Button>
          </div>
          {slugError && (
            <p className="text-sm text-red-600">{slugError}</p>
          )}
          {urlSlug && !slugError && (
            <p className="text-sm text-gray-600">
              URL: /courses/{urlSlug}
            </p>
          )}
        </CardContent>
      </Card>

      {/* SEO Keywords */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            SEO Keywords
          </CardTitle>
          <CardDescription>
            Relevant keywords for search engines (3-10 recommended)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter keyword"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
            />
            <Button onClick={addKeyword}>Add</Button>
            <Button onClick={autoSuggestKeywords} variant="outline">
              Auto-Suggest
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {keywords.map(keyword => (
              <Badge key={keyword} variant="secondary">
                {keyword}
                <button
                  onClick={() => removeKeyword(keyword)}
                  className="ml-2 text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>

          <p className="text-sm text-gray-600">
            {keywords.length}/10 keywords
            {keywords.length < 3 && ' (Add at least 3 keywords)'}
            {keywords.length > 10 && ' (Too many keywords may dilute effectiveness)'}
          </p>
        </CardContent>
      </Card>

      {/* Open Graph Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Open Graph Tags</CardTitle>
          <CardDescription>
            Optimize how your course appears when shared on social media
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>OG Title</Label>
            <Input
              placeholder={metaTitle || initialData?.title || 'Enter OG title'}
              value={ogTitle}
              onChange={(e) => {
                setOgTitle(e.target.value)
                onChange?.({ og_title: e.target.value })
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>OG Description</Label>
            <Textarea
              placeholder={metaDescription || initialData?.description || 'Enter OG description'}
              value={ogDescription}
              onChange={(e) => {
                setOgDescription(e.target.value)
                onChange?.({ og_description: e.target.value })
              }}
              rows={2}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setOgTitle(metaTitle || initialData?.title || '')
                setOgDescription(metaDescription || initialData?.description || '')
                onChange?.({
                  og_title: metaTitle || initialData?.title || '',
                  og_description: metaDescription || initialData?.description || ''
                })
              }}
            >
              Copy from Meta Tags
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
