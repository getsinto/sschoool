'use client'

import Header from '@/components/landing/Header'
import Footer from '@/components/shared/Footer'

interface SharedLayoutProps {
  children: React.ReactNode
}

export default function SharedLayout({ children }: SharedLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}