'use client'

/**
 * Client Layout Wrapper
 * 
 * This component wraps all page content to prevent serialization errors.
 * By making this a Client Component, we ensure that all children (including
 * pages with Links and event handlers) are rendered in a client context,
 * avoiding the Server Component serialization issue.
 */
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
