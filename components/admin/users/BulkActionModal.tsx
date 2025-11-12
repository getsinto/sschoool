'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle, UserX, Trash2, Download, X } from 'lucide-react'

interface BulkActionModalProps {
  isOpen: boolean
  onClose: () => void
  action: 'suspend' | 'delete' | 'export'
  selectedCount: number
  onConfirm: (reason?: string) => void
}

export default function BulkActionModal({ 
  isOpen, 
  onClose, 
  action, 
  selectedCount, 
  onConfirm 
}: BulkActionModalProps) {
  const [reason, setReason] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const getActionConfig = () => {
    switch (action) {
      case 'suspend':
        return {
          title: 'Suspend Users',
          description: 'Suspended users will not be able to access their accounts until reactivated.',
          icon: UserX,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          buttonColor: 'bg-orange-600 hover:bg-orange-700',
          requiresReason: true
        }
      case 'delete':
        return {
          title: 'Delete Users',
          description: 'This action cannot be undone. All user data will be permanently removed.',
          icon: Trash2,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          requiresReason: true
        }
      case 'export':
        return {
          title: 'Export Users',
          description: 'Export selected user data to CSV format for external use.',
          icon: Download,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
          requiresReason: false
        }
    }
  }

  const config = getActionConfig()
  const Icon = config.icon

  const handleConfirm = async () => {
    if (config.requiresReason && !reason.trim()) {
      return
    }

    setIsLoading(true)
    try {
      await onConfirm(reason)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className={`${config.bgColor} rounded-t-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 ${config.bgColor} rounded-full flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${config.color}`} />
              </div>
              <div>
                <CardTitle className="text-lg">{config.title}</CardTitle>
                <Badge variant="outline" className="mt-1">
                  {selectedCount} user{selectedCount !== 1 ? 's' : ''} selected
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {/* Warning Message */}
          {action === 'delete' && (
            <div className="flex items-start space-x-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Warning: Irreversible Action</p>
                <p className="text-sm text-red-700 mt-1">
                  This will permanently delete all user data including profiles, courses, and payment history.
                </p>
              </div>
            </div>
          )}

          <p className="text-gray-600">{config.description}</p>

          {/* Reason Input */}
          {config.requiresReason && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Reason {action === 'delete' ? '(Required)' : '(Optional)'}
              </label>
              <Textarea
                placeholder={`Enter reason for ${action}ing these users...`}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="resize-none"
              />
              {action === 'delete' && !reason.trim() && (
                <p className="text-sm text-red-600">Reason is required for user deletion.</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              className={config.buttonColor}
              onClick={handleConfirm}
              disabled={isLoading || (config.requiresReason && action === 'delete' && !reason.trim())}
            >
              {isLoading ? 'Processing...' : `${config.title.split(' ')[0]} ${selectedCount} User${selectedCount !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}