import type { Metadata } from 'next'

// Force dynamic rendering for all public pages to avoid serialization issues
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0

export const metadata: Metadata = {
  metadataBase: new URL('https://stharoonschool.com'),
  title: {
    default: 'St Haroon Online School - Excellence in Online Education | Pre-Nursery to Grade 10',
    template: '%s | St Haroon Online School',
  },
  description: 'Discover excellence at St Haroon Online School. World-class education for Pre-Nursery to 10th Grade & Spoken English Courses. 200,000+ teaching hours, certified teachers, 95% success rate.',
  keywords: 'online school, online education, live classes, certified teachers, Pre-Nursery to Grade 10, spoken English, St Haroon, virtual classroom, interactive learning',
  authors: [{ name: 'St Haroon Online School' }],
  creator: 'St Haroon Online School',
  publisher: 'St Haroon Online School',
  openGraph: {
    title: 'St Haroon Online School - Excellence in Online Education',
    description: 'World-class education for Pre-Nursery to 10th Grade & Spoken English Courses with certified teachers and interactive live classes.',
    url: 'https://stharoonschool.com',
    siteName: 'St Haroon Online School',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'St Haroon Online School - Excellence in Education',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'St Haroon Online School - Excellence in Online Education',
    description: 'World-class education for Pre-Nursery to 10th Grade & Spoken English Courses',
    images: ['/twitter-image.jpg'],
    creator: '@stharoonschool',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}