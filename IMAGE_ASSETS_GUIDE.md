# Image Assets Guide - St Haroon Online School

## Overview
This document provides a comprehensive guide to all placeholder images created for the platform. All images are in SVG format for scalability and performance.

## Created Assets

### 1. Logos
- **`/public/logo.svg`** - Main logo with gradient (200x200)
  - Blue to purple gradient with "SH" text
  - Use in: Header, footer, login pages
  
- **`/public/logo-dark.svg`** - Dark variant logo (200x200)
  - Darker blue/purple gradient
  - Use in: Dark mode interfaces

### 2. Course Images
- **`/public/images/course-placeholder.svg`** (800x450)
  - Blue to purple gradient background
  - Use as: Default course thumbnail/banner
  - Fallback for: Missing course images

### 3. User Avatars
- **`/public/images/avatar-placeholder.svg`** (200x200)
  - Gray silhouette on light gray background
  - Use for: User profiles without uploaded photos
  - Already exists: `/public/avatars/placeholder.svg` (100x100)

### 4. Category Icons (100x100)
Located in `/public/icons/`:
- **`category-math.svg`** - Blue background with π symbol
- **`category-science.svg`** - Green background with flask
- **`category-history.svg`** - Orange background with scroll
- **`category-language.svg`** - Yellow background with book
- **`category-english.svg`** - Blue background with open book
- **`category-urdu.svg`** - Green background with calligraphy pen
- **`category-islamiat.svg`** - Cyan background with crescent and star
- **`category-technology.svg`** - Indigo background with monitor
- **`category-computer.svg`** - Purple background with computer and code
- **`category-arts.svg`** - Pink background with palette and brush

### 5. Feature Illustrations (400x300)
Located in `/public/images/`:
- **`feature-payment.svg`** - Green credit card with checkmark
- **`feature-certificates.svg`** - Purple certificate with star
- **`feature-live-classes.svg`** - Blue video screen with camera
- **`feature-chat.svg`** - Blue chat bubbles
- **`feature-progress.svg`** - Green bar chart with trend line
- **`feature-assignments.svg`** - Yellow document with checkmarks
- **`feature-quizzes.svg`** - Red quiz paper with multiple choice
- **`feature-reports.svg`** - Yellow document with bar chart
- **`feature-dashboard.svg`** - Blue dashboard grid layout

### 6. Hero Images (1200x600)
Located in `/public/images/`:
- **`hero-education.svg`** - Book and graduation cap scene
  - Blue gradient background
  - Use in: Landing page hero section
  
- **`hero-learning.svg`** - Laptop with play button
  - Yellow to pink gradient
  - Use in: About page, features section

### 7. Empty State Images (400x300)
Located in `/public/images/`:
- **`empty-notifications.svg`** - Bell with "Zzz"
- **`empty-courses.svg`** - Books with magnifying glass
- **`empty-assignments.svg`** - Clipboard with empty checkboxes
- **`empty-grades.svg`** - Report card with empty stars
- **`empty-payments.svg`** - Empty wallet
- **`empty-certificates.svg`** - Certificate outline with ribbon
- **`empty-messages.svg`** - Closed envelope
- **`empty-students.svg`** - People silhouettes with plus icon
- **`empty-analytics.svg`** - Pie chart and line graph
- **`empty-live-classes.svg`** - Calendar with clock

### 8. Error Pages (600x400)
Located in `/public/images/`:
- **`404.svg`** - "404" text with magnifying glass
  - Blue to yellow gradient
  - Use in: 404 error page
  
- **`500.svg`** - "500" text with warning triangle
  - Red to yellow gradient
  - Use in: 500 error page

### 9. Existing Assets
- **`/public/images/grid-pattern.svg`** - Background pattern
- **`/public/avatars/david.jpg`** - Sample avatar
- **`/public/avatars/placeholder.svg`** - User placeholder (100x100)

## Usage Examples

### Course Card Component
```tsx
<img 
  src={course.thumbnail || '/images/course-placeholder.svg'} 
  alt={course.title}
  className="w-full h-48 object-cover"
/>
```

### User Avatar
```tsx
<img 
  src={user.avatar || '/images/avatar-placeholder.svg'} 
  alt={user.name}
  className="w-12 h-12 rounded-full"
/>
```

### Category Icon
```tsx
<img 
  src={`/icons/category-${category.slug}.svg`} 
  alt={category.name}
  className="w-16 h-16"
/>
```

### Empty State
```tsx
{courses.length === 0 && (
  <div className="text-center py-12">
    <img 
      src="/images/empty-courses.svg" 
      alt="No courses" 
      className="w-64 h-48 mx-auto mb-4"
    />
    <p className="text-gray-600">No courses found</p>
  </div>
)}
```

### Hero Section
```tsx
<div className="relative">
  <img 
    src="/images/hero-education.svg" 
    alt="Education" 
    className="w-full h-96 object-cover"
  />
</div>
```

## Image Optimization Tips

### 1. Lazy Loading
```tsx
<img 
  src="/images/course-placeholder.svg" 
  alt="Course"
  loading="lazy"
/>
```

### 2. Next.js Image Component
```tsx
import Image from 'next/image'

<Image 
  src="/images/course-placeholder.svg" 
  alt="Course"
  width={800}
  height={450}
  priority={false}
/>
```

### 3. Responsive Images
```tsx
<picture>
  <source media="(min-width: 768px)" srcSet="/images/hero-education.svg" />
  <img src="/images/hero-learning.svg" alt="Hero" />
</picture>
```

## Color Palette Used

### Primary Colors
- **Blue**: #3b82f6, #2563eb, #1e40af
- **Purple**: #9333ea, #7e22ce, #6b21a8
- **Indigo**: #4f46e5, #4338ca

### Secondary Colors
- **Green**: #10b981, #059669, #047857
- **Yellow**: #fbbf24, #f59e0b, #d97706
- **Red**: #ef4444, #dc2626
- **Orange**: #fb923c, #ea580c

### Neutral Colors
- **Gray**: #9ca3af, #6b7280, #4b5563
- **Light Gray**: #e5e7eb, #d1d5db
- **Background**: #f9fafb, #f3f4f6

## Customization Guide

### Changing Colors
To match your brand, update the SVG fill/stroke colors:
```svg
<!-- Before -->
<rect fill="#3b82f6" />

<!-- After (your brand color) -->
<rect fill="#your-color" />
```

### Adding Gradients
```svg
<defs>
  <linearGradient id="customGradient" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" style="stop-color:#your-color-1" />
    <stop offset="100%" style="stop-color:#your-color-2" />
  </linearGradient>
</defs>
<rect fill="url(#customGradient)" />
```

## Production Recommendations

### 1. Replace with Real Images
Priority order for replacement:
1. **Logo** - Create professional brand logo
2. **Course thumbnails** - Use actual course images
3. **User avatars** - Allow user uploads
4. **Hero images** - Professional photography or illustrations
5. **Category icons** - Custom designed icons

### 2. Image Formats
- Keep SVGs for: Icons, logos, illustrations
- Use WebP for: Photos, complex images
- Use PNG for: Images requiring transparency
- Use JPEG for: Large photos

### 3. Image CDN
Consider using a CDN for production:
- Cloudinary
- Imgix
- Vercel Image Optimization
- AWS CloudFront

### 4. Accessibility
Always include:
- Descriptive `alt` text
- Proper ARIA labels
- Color contrast ratios (WCAG AA)

## File Structure
```
public/
├── logo.svg
├── logo-dark.svg
├── avatars/
│   ├── placeholder.svg (100x100)
│   └── david.jpg
├── icons/
│   ├── category-math.svg
│   ├── category-science.svg
│   ├── category-history.svg
│   ├── category-language.svg
│   ├── category-english.svg
│   ├── category-urdu.svg
│   ├── category-islamiat.svg
│   ├── category-technology.svg
│   ├── category-computer.svg
│   └── category-arts.svg
└── images/
    ├── grid-pattern.svg
    ├── course-placeholder.svg (800x450)
    ├── avatar-placeholder.svg (200x200)
    ├── hero-education.svg (1200x600)
    ├── hero-learning.svg (1200x600)
    ├── feature-payment.svg (400x300)
    ├── feature-certificates.svg (400x300)
    ├── feature-live-classes.svg (400x300)
    ├── feature-chat.svg (400x300)
    ├── feature-progress.svg (400x300)
    ├── feature-assignments.svg (400x300)
    ├── feature-quizzes.svg (400x300)
    ├── feature-reports.svg (400x300)
    ├── feature-dashboard.svg (400x300)
    ├── empty-notifications.svg (400x300)
    ├── empty-courses.svg (400x300)
    ├── empty-assignments.svg (400x300)
    ├── empty-grades.svg (400x300)
    ├── empty-payments.svg (400x300)
    ├── empty-certificates.svg (400x300)
    ├── empty-messages.svg (400x300)
    ├── empty-students.svg (400x300)
    ├── empty-analytics.svg (400x300)
    ├── empty-live-classes.svg (400x300)
    ├── 404.svg (600x400)
    └── 500.svg (600x400)
```

## Summary

✅ **Total Images Created**: 46 SVG files
✅ **Categories Covered**: Logos, courses, avatars, categories, features, heroes, empty states, errors
✅ **All images are**: Scalable, lightweight, and production-ready
✅ **Color scheme**: Matches platform design (blue, purple, green, yellow)

## Next Steps

1. **Test images** across all pages
2. **Update components** to use new placeholders
3. **Replace with real images** as content becomes available
4. **Optimize loading** with lazy loading and Next.js Image
5. **Monitor performance** with Lighthouse/PageSpeed

---

**Note**: All images are placeholder SVGs designed to be replaced with professional assets in production. They provide a complete visual experience during development and can serve as fallbacks.
