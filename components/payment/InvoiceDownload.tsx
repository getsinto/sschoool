'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, FileText, Loader2, Mail, Printer } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
// Toast notifications removed for simplicity - can be added back with your preferred toast library

interface InvoiceDownloadProps {
  paymentId: string
  orderId?: string
  invoiceNumber?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showDropdown?: boolean
  onDownloadSuccess?: () => void
  onDownloadError?: (error: Error) => void
}

export default function InvoiceDownload({
  paymentId,
  orderId,
  invoiceNumber,
  variant = 'outline',
  size = 'sm',
  showDropdown = true,
  onDownloadSuccess,
  onDownloadError,
}: InvoiceDownloadProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const downloadInvoice = async (format: 'pdf' | 'csv' = 'pdf') => {
    setIsDownloading(true)
    setError(null)

    try {
      const endpoint = orderId 
        ? `/api/payments/invoice/${orderId}?format=${format}`
        : `/api/admin/payments/invoice/${paymentId}?format=${format}`

      const response = await fetch(endpoint)

      if (!response.ok) {
        throw new Error('Failed to download invoice')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoiceNumber || paymentId}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setSuccessMessage('Invoice downloaded successfully')
      setTimeout(() => setSuccessMessage(null), 3000)
      onDownloadSuccess?.()
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to download invoice'
      setError(errorMessage)
      setTimeout(() => setError(null), 5000)
      onDownloadError?.(err)
    } finally {
      setIsDownloading(false)
    }
  }

  const sendInvoiceEmail = async () => {
    setIsSending(true)
    setError(null)

    try {
      const response = await fetch('/api/payments/invoice/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          orderId,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to send invoice')
      }

      setSuccessMessage('Invoice sent to your email')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send invoice'
      setError(errorMessage)
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsSending(false)
    }
  }

  const printInvoice = async () => {
    try {
      const endpoint = orderId 
        ? `/api/payments/invoice/${orderId}?format=pdf`
        : `/api/admin/payments/invoice/${paymentId}?format=pdf`

      const response = await fetch(endpoint)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      
      const printWindow = window.open(url, '_blank')
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
        }
      }
    } catch (err: any) {
      setError('Failed to print invoice')
      setTimeout(() => setError(null), 5000)
    }
  }

  if (!showDropdown) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={() => downloadInvoice('pdf')}
        disabled={isDownloading}
      >
        {isDownloading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Downloading...
          </>
        ) : (
          <>
            <Download className="mr-2 h-4 w-4" />
            Download Invoice
          </>
        )}
      </Button>
    )
  }

  return (
    <div className="space-y-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} disabled={isDownloading || isSending}>
            {isDownloading || isSending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="mr-2 h-4 w-4" />
            )}
            Invoice
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Invoice Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => downloadInvoice('pdf')}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => downloadInvoice('csv')}>
            <Download className="mr-2 h-4 w-4" />
            Download CSV
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={printInvoice}>
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={sendInvoiceEmail}>
            <Mail className="mr-2 h-4 w-4" />
            Email Invoice
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {successMessage && (
        <Alert className="mt-2 bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
