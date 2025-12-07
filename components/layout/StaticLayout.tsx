'use client'

import PublicHeader from '@/components/public/Header'
import PublicFooter from '@/components/public/Footer'

interface StaticLayoutProps {
  children: React.ReactNode
}

export default function StaticLayout({ children }: StaticLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Use the same header as homepage */}
      <PublicHeader />

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Use the same footer as homepage */}
      <PublicFooter />
    </div>
  )
}
