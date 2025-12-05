/**
 * SEO Analyzer - Calculate SEO scores and generate meta tags
 */

export interface SEOScore {
  total: number
  breakdown: {
    title: number
    metaTitle: number
    description: number
    metaDescription: number
    urlSlug: number
    keywords: number
    thumbnail: number
    openGraph: number
    category: number
  }
  issues: string[]
  suggestions: string[]
}

export interface MetaTags {
  title: string
  description: string
  keywords: string
  canonical?: string
  robots: string
  openGraph: {
    title: string
    description: string
    image: string
    type: string
    url: string
  }
  twitter: {
    card: string
    title: string
    description: string
    image: string
  }
}

export interface SchemaMarkup {
  '@context': string
  '@type': string
  name: string
  description: string
  provider: {
    '@type': string
    name: string
  }
  image?: string
  offers?: {
    '@type': string
    price: string
    priceCurrency: string
  }
  aggregateRating?: {
    '@type': string
    ratingValue: number
    reviewCount: number
  }
}

/**
 * Calculate comprehensive SEO score for a course
 */
export function calculateSEOScore(course: any): SEOScore {
  const breakdown = {
    title: 0,
    metaTitle: 0,
    description: 0,
    metaDescription: 0,
    urlSlug: 0,
    keywords: 0,
    thumbnail: 0,
    openGraph: 0,
    category: 0,
  }

  const issues: string[] = []
  const suggestions: string[] = []

  // Title (20 points)
  if (course.title) {
    const titleLength = course.title.length
    if (titleLength >= 30 && titleLength <= 60) {
      breakdown.title = 20
    } else if (titleLength > 0) {
      breakdown.title = 10
      if (titleLength < 30) {
        issues.push('Course title is too short (< 30 characters)')
        suggestions.push('Expand your course title to 30-60 characters for better SEO')
      } else {
        issues.push('Course title is too long (> 60 characters)')
        suggestions.push('Shorten your course title to 30-60 characters')
      }
    }
  } else {
    issues.push('Course title is missing')
    suggestions.push('Add a descriptive course title')
  }

  // Meta Title (10 points)
  if (course.meta_title) {
    const metaTitleLength = course.meta_title.length
    if (metaTitleLength >= 50 && metaTitleLength <= 60) {
      breakdown.metaTitle = 10
    } else if (metaTitleLength > 0) {
      breakdown.metaTitle = 5
      if (metaTitleLength < 50) {
        suggestions.push('Meta title could be longer (50-60 characters optimal)')
      } else {
        issues.push('Meta title is too long (> 60 characters)')
        suggestions.push('Shorten meta title to 50-60 characters')
      }
    }
  } else {
    suggestions.push('Add a custom meta title for better search engine visibility')
  }

  // Description (15 points)
  if (course.description) {
    const descLength = course.description.length
    if (descLength >= 120 && descLength <= 300) {
      breakdown.description = 15
    } else if (descLength > 50) {
      breakdown.description = 8
      if (descLength < 120) {
        suggestions.push('Course description could be more detailed (120-300 characters optimal)')
      }
    } else {
      issues.push('Course description is too short')
      suggestions.push('Write a comprehensive course description (120-300 characters)')
    }
  } else {
    issues.push('Course description is missing')
    suggestions.push('Add a detailed course description')
  }

  // Meta Description (10 points)
  if (course.meta_description) {
    const metaDescLength = course.meta_description.length
    if (metaDescLength >= 120 && metaDescLength <= 160) {
      breakdown.metaDescription = 10
    } else if (metaDescLength > 0) {
      breakdown.metaDescription = 5
      if (metaDescLength < 120) {
        suggestions.push('Meta description could be longer (120-160 characters optimal)')
      } else {
        issues.push('Meta description is too long (> 160 characters)')
        suggestions.push('Shorten meta description to 120-160 characters')
      }
    }
  } else {
    suggestions.push('Add a custom meta description for better search snippets')
  }

  // URL Slug (10 points)
  if (course.url_slug) {
    breakdown.urlSlug = 10
    if (course.url_slug.length > 100) {
      issues.push('URL slug is too long')
      suggestions.push('Shorten URL slug to under 100 characters')
    }
  } else {
    issues.push('URL slug is missing')
    suggestions.push('Add a custom URL slug')
  }

  // Keywords (10 points)
  if (course.seo_keywords && course.seo_keywords.length > 0) {
    if (course.seo_keywords.length >= 3 && course.seo_keywords.length <= 10) {
      breakdown.keywords = 10
    } else if (course.seo_keywords.length > 0) {
      breakdown.keywords = 5
      if (course.seo_keywords.length < 3) {
        suggestions.push('Add more SEO keywords (3-10 recommended)')
      } else {
        suggestions.push('Too many keywords may dilute SEO effectiveness (3-10 recommended)')
      }
    }
  } else {
    issues.push('No SEO keywords defined')
    suggestions.push('Add 3-10 relevant keywords for better search visibility')
  }

  // Thumbnail (10 points)
  if (course.thumbnail) {
    breakdown.thumbnail = 10
  } else {
    issues.push('Course thumbnail is missing')
    suggestions.push('Add an attractive course thumbnail image')
  }

  // Open Graph Tags (10 points)
  if (course.og_title && course.og_description) {
    breakdown.openGraph = 10
    if (!course.og_image_url) {
      suggestions.push('Add a custom Open Graph image for better social media sharing')
    }
  } else if (course.og_title || course.og_description) {
    breakdown.openGraph = 5
    suggestions.push('Complete Open Graph tags (title, description, image) for social media')
  } else {
    suggestions.push('Add Open Graph tags for better social media sharing')
  }

  // Category (5 points)
  if (course.category) {
    breakdown.category = 5
  } else {
    issues.push('Course category is missing')
    suggestions.push('Assign a category to your course')
  }

  const total = Object.values(breakdown).reduce((sum, val) => sum + val, 0)

  return {
    total,
    breakdown,
    issues,
    suggestions,
  }
}

/**
 * Generate meta tags for a course
 */
export function generateMetaTags(course: any, baseUrl: string = ''): MetaTags {
  const title = course.meta_title || course.title || 'Course'
  const description = course.meta_description || course.description || ''
  const keywords = course.seo_keywords?.join(', ') || ''
  const canonical = course.canonical_url || `${baseUrl}/courses/${course.url_slug || course.id}`
  const robots = course.robots_meta || 'index,follow'
  const image = course.og_image_url || course.thumbnail || `${baseUrl}/images/course-placeholder.svg`

  return {
    title,
    description,
    keywords,
    canonical,
    robots,
    openGraph: {
      title: course.og_title || title,
      description: course.og_description || description,
      image,
      type: 'website',
      url: canonical,
    },
    twitter: {
      card: course.twitter_card_type || 'summary_large_image',
      title: course.twitter_title || course.og_title || title,
      description: course.twitter_description || course.og_description || description,
      image,
    },
  }
}

/**
 * Generate Schema.org JSON-LD markup for a course
 */
export function generateSchemaMarkup(course: any, baseUrl: string = ''): SchemaMarkup {
  const schema: SchemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description || '',
    provider: {
      '@type': 'Organization',
      name: 'St Haroon Online School',
    },
  }

  if (course.thumbnail) {
    schema.image = course.thumbnail
  }

  if (course.price !== undefined && course.price !== null) {
    schema.offers = {
      '@type': 'Offer',
      price: course.price.toString(),
      priceCurrency: course.currency || 'USD',
    }
  }

  if (course.rating && course.review_count) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: course.rating,
      reviewCount: course.review_count,
    }
  }

  return schema
}

/**
 * Generate sitemap XML for courses
 */
export function generateSitemap(courses: any[], baseUrl: string): string {
  const urls = courses
    .filter(course => course.status === 'published')
    .map(course => {
      const loc = `${baseUrl}/courses/${course.url_slug || course.id}`
      const lastmod = course.updated_at || course.created_at
      const priority = course.is_featured ? '1.0' : '0.8'
      const changefreq = 'weekly'

      return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    })
    .join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}

/**
 * Validate URL slug format
 */
export function validateSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug) {
    return { valid: false, error: 'Slug cannot be empty' }
  }

  if (slug.length > 100) {
    return { valid: false, error: 'Slug must be 100 characters or less' }
  }

  // Check for valid characters (lowercase letters, numbers, hyphens)
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  if (!slugRegex.test(slug)) {
    return {
      valid: false,
      error: 'Slug can only contain lowercase letters, numbers, and hyphens',
    }
  }

  // Check for consecutive hyphens
  if (slug.includes('--')) {
    return { valid: false, error: 'Slug cannot contain consecutive hyphens' }
  }

  // Check for leading/trailing hyphens
  if (slug.startsWith('-') || slug.endsWith('-')) {
    return { valid: false, error: 'Slug cannot start or end with a hyphen' }
  }

  return { valid: true }
}

/**
 * Generate slug from title
 */
export function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    .substring(0, 100) // Limit length
}

/**
 * Suggest keywords based on course content
 */
export function suggestKeywords(title: string, description: string, category?: string): string[] {
  const keywords: Set<string> = new Set()

  // Extract words from title
  const titleWords = title
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3)

  titleWords.forEach(word => keywords.add(word))

  // Extract words from description
  const descWords = description
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 4)
    .slice(0, 10)

  descWords.forEach(word => keywords.add(word))

  // Add category if provided
  if (category) {
    keywords.add(category.toLowerCase())
  }

  // Common educational keywords
  const educationalKeywords = ['online', 'course', 'learning', 'education', 'tutorial', 'class']
  educationalKeywords.forEach(word => {
    if (title.toLowerCase().includes(word) || description.toLowerCase().includes(word)) {
      keywords.add(word)
    }
  })

  return Array.from(keywords).slice(0, 10)
}
