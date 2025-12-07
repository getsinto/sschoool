# Homepage Restoration - Design

## Architecture Overview

The homepage follows a component-based architecture with a focus on animations and user engagement. The page is server-rendered with client-side hydration for interactive elements.

```
app/(public)/page.tsx (Server Component)
└── SharedLayout (Client Component)
    ├── SchoolHeroSlider (Client Component)
    ├── VideoSection (Client Component)
    ├── FeaturesSection (Client Component)
    ├── CourseCards with animations (Client Component)
    ├── EnhancedTestimonialsSection (Client Component)
    ├── EnhancedBrochureSection (Client Component)
    ├── EnhancedWhyChooseSection (Client Component)
    ├── AchievementsAndTeachersSection (Client Component)
    └── Multiple CTA Sections (Client Component)
```

## Component Design

### 1. Page Structure (`app/(public)/page.tsx`)

**Purpose:** Main homepage server component that fetches data and renders the layout

**Key Features:**
- Server-side data fetching for courses, testimonials, features
- SEO metadata
- Structured layout with SharedLayout wrapper

**Data Flow:**
```typescript
Server Component (page.tsx)
  ↓ (fetch data from Supabase)
  ↓ (pass as props)
Client Components (SharedLayout, sections)
  ↓ (render with animations)
Browser (user interaction)
```

### 2. SharedLayout Component

**Purpose:** Wrapper component that provides consistent layout and floating background elements

**Key Features:**
- Floating background elements with CSS animations
- Consistent padding and spacing
- Responsive container

**Animation Classes:**
- `float` - Continuous floating animation
- `pulse-glow` - Pulsing glow effect
- `gradient-shift` - Animated gradient background

### 3. SchoolHeroSlider Component

**Purpose:** Hero section with animated slider showcasing key messages

**Key Features:**
- Multiple slides with auto-rotation
- Manual navigation controls
- Smooth transitions
- Responsive images
- CTA buttons

**State Management:**
```typescript
const [currentSlide, setCurrentSlide] = useState(0);
const [isAutoPlaying, setIsAutoPlaying] = useState(true);
```

### 4. VideoSection Component

**Purpose:** Embedded video showcase section

**Key Features:**
- YouTube/Vimeo embed support
- Responsive iframe
- Fallback for loading errors
- Accessible controls

### 5. Scroll-Triggered Animations

**Purpose:** Animate sections as they enter the viewport

**Implementation:**
```typescript
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      });
    },
    { threshold: 0.1 }
  );

  // Observe all sections
  document.querySelectorAll('.animate-on-scroll').forEach((el) => {
    observer.observe(el);
  });

  return () => observer.disconnect();
}, []);
```

## Animation Design

### CSS Animations (globals.css)

#### 1. Float Animation
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.float {
  animation: float 6s ease-in-out infinite;
}
```

#### 2. Pulse Glow Animation
```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
  50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
}

.pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}
```

#### 3. Gradient Shift Animation
```css
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.gradient-shift {
  background-size: 200% 200%;
  animation: gradient-shift 15s ease infinite;
}
```

#### 4. Fade In Animation
```css
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.6s ease-out forwards;
}
```

#### 5. Staggered Animations
```css
.stagger-1 { animation-delay: 0.1s; }
.stagger-2 { animation-delay: 0.2s; }
.stagger-3 { animation-delay: 0.3s; }
.stagger-4 { animation-delay: 0.4s; }
```

## Section Layout Design

### Hero Section
- Full viewport height
- Centered content
- Animated background
- CTA buttons with hover effects

### Video Section
- 16:9 aspect ratio
- Centered on page
- Padding for breathing room
- Responsive scaling

### Course Cards Section
- Grid layout (responsive)
- Staggered entrance animations
- Hover effects
- Clear CTAs

### Testimonials Section
- Carousel or grid layout
- Profile images
- Quote styling
- Star ratings

### Features Section
- Icon + text layout
- Grid or flex layout
- Hover animations
- Clear hierarchy

### CTA Sections
- Bold headlines
- Contrasting colors
- Animated buttons
- Clear value proposition

## Responsive Design

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Mobile Optimizations
- Single column layouts
- Reduced animation complexity
- Touch-friendly buttons
- Optimized image sizes

### Tablet Optimizations
- Two-column layouts where appropriate
- Balanced spacing
- Medium animation complexity

### Desktop Optimizations
- Multi-column layouts
- Full animation effects
- Larger images
- Enhanced hover states

## Performance Considerations

### Animation Performance
- Use `transform` and `opacity` for animations (GPU-accelerated)
- Avoid animating `width`, `height`, `top`, `left`
- Use `will-change` sparingly
- Debounce scroll events

### Image Optimization
- Next.js Image component for automatic optimization
- Lazy loading for below-the-fold images
- Responsive image sizes
- WebP format with fallbacks

### Code Splitting
- Dynamic imports for heavy components
- Lazy load non-critical sections
- Bundle size optimization

## Accessibility

### Keyboard Navigation
- All interactive elements keyboard accessible
- Visible focus indicators
- Logical tab order

### Screen Readers
- Semantic HTML
- ARIA labels where needed
- Alt text for images
- Descriptive link text

### Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Error Handling

### Video Loading Errors
- Fallback image or message
- Retry mechanism
- User-friendly error message

### Image Loading Errors
- Placeholder images
- Graceful degradation
- Loading states

### Data Fetching Errors
- Empty state handling
- Retry mechanisms
- User feedback

## Testing Strategy

### Visual Testing
- Screenshot comparison
- Cross-browser testing
- Responsive testing

### Performance Testing
- Lighthouse audits
- Animation frame rate monitoring
- Load time testing

### Accessibility Testing
- WAVE tool
- Keyboard navigation testing
- Screen reader testing

## Migration Notes

### From Component-Based to Animated Version
1. Replace page.tsx content with animated version
2. Ensure all animation styles are in globals.css
3. Verify all components are properly imported
4. Test scroll animations
5. Verify responsive behavior
6. Check Vercel deployment

### Rollback Plan
If issues arise:
1. Revert to previous commit
2. Identify specific failing component
3. Fix in isolation
4. Redeploy incrementally
