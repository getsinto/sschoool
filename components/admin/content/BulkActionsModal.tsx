'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { 
  X, 
  AlertTriangle, 
  Trash2, 
  FolderInput,
  Download,
  Copy,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface BulkActionsModalProps {
  isOpen: boolean
  onClose: () => void
  action: 'move' | 'delete' | 'download' | 'copy'
  selectedFiles: string[]
  files: Array<{ id: string; name: string; size: number }>
  folders: Array<{ id: string; name: string; path: string }>
  onConfirm: (action: string, fileIds: string[], targetFolderId?: string) => Promise<void>
}

export default function BulkActionsModal({
  isOpen,
  onClose,
  action,
  selectedFiles,
  files,
  folders,
  onConfirm
}: BulkActionsModalProps) {
  const [targetFolderId, setTargetFolderId] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const selectedFileDetails = files.filter(f => selectedFiles.includes(f.id))
  const totalSize = selectedFileDetails.reduce((sum, f) => sum + f.size, 0)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getActionConfig = () => {
    switch (action) {
      case 'delete':
        return {
          title: 'Delete Files',
          icon: Trash2,
          iconColor: 'text-red-600',
          description: 'Are you sure you want to delete these files? This action cannot be undone.',
          confirmText: 'Delete Files',
          confirmColor: 'bg-red-600 hover:bg-red-700',
          requiresFolder: false
        }
      case 'move':
        return {
          title: 'Move Files',
          icon: FolderInput,
          iconColor: 'text-blue-600',
          description: 'Select the destination folder for the selected files.',
          confirmText: 'Move Files',
          confirmColor: 'bg-blue-600 hover:bg-blue-700',
          requiresFolder: true
        }
      case 'copy':
        return {
          title: 'Copy Files',
          icon: Copy,
          iconColor: 'text-green-600',
          description: 'Select the destination folder to copy the selected files.',
          confirmText: 'Copy Files',
          confirmColor: 'bg-green-600 hover:bg-green-700',
          requiresFolder: true
        }
      case 'download':
        return {
          title: 'Download Files',
          icon: Download,
          iconColor: 'text-purple-600',
          description: 'Download selected files as a ZIP archive.',
          confirmText: 'Download Files',
          confirmColor: 'bg-purple-600 hover:bg-purple-700',
          requiresFolder: false
        }
      default:
        return {
          title: 'Bulk Action',
          icon: AlertTriangle,
          iconColor: 'text-gray-600',
          description: 'Perform action on selected files.',
          confirmText: 'Confirm',
          confirmColor: 'bg-gray-600 hover:bg-gray-700',
          requiresFolder: false
        }
    }
  }

  const config = getActionConfig()
  const Icon = config.icon

  const handleConfirm = async () => {
    setError('')

    // Validation
    if (config.requiresFolder && !targetFolderId) {
      setError('Please select a destination folder')
      return
    }

    setIsProcessing(true)
    setProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      await onConfirm(action, selectedFiles, targetFolderId || undefined)

      clearInterval(progressInterval)
      setProgress(100)
      setCompleted(true)

      // Auto-close after success
      setTimeout(() => {
        handleClose()
      }, 1500)
    } catch (err: any) {
      setError(err.message || `Failed to ${action} files`)
      setProgress(0)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (!isProcessing) {
      setTargetFolderId('')
      setProgress(0)
      setCompleted(false)
      setError('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
            <CardTitle>{config.title}</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose}
            disabled={isProcessing}
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!completed ? (
            <>
              {/* Description */}
              <p className="text-sm text-gray-600">{config.description}</p>

              {/* Selected Files Summary */}
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Selected Files:</span>
                  <span className="font-medium text-gray-900">{selectedFiles.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Size:</span>
                  <span className="font-medium text-gray-900">{formatFileSize(totalSize)}</span>
                </div>
              </div>

              {/* File List */}
              <div className="max-h-40 overflow-y-auto space-y-1">
                {selectedFileDetails.map(file => (
                  <div key={file.id} className="flex items-center justify-between p-2 bg-white border rounded text-sm">
                    <span className="truncate flex-1">{file.name}</span>
                    <span className="text-gray-500 ml-2">{formatFileSize(file.size)}</span>
                  </div>
                ))}
              </div>

              {/* Folder Selection (for move/copy) */}
              {config.requiresFolder && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Destination Folder <span className="text-red-500">*</span>
                  </label>
                  <Select 
                    value={targetFolderId} 
                    onValueChange={setTargetFolderId}
                    disabled={isProcessing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination folder" />
                    </SelectTrigger>
                    <SelectContent>
                      {folders.map(folder => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.path}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Progress Bar */}
              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-sm text-gray-600 text-center">
                    Processing... {progress}%
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Warning for Delete */}
              {action === 'delete' && (
                <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                  <p className="text-sm text-yellow-700">
                    This action cannot be undone. Files will be permanently deleted.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={isProcessing || (config.requiresFolder && !targetFolderId)}
                  className={`flex-1 ${config.confirmColor}`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    config.confirmText
                  )}
                </Button>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {action === 'delete' ? 'Files Deleted' : 
                 action === 'move' ? 'Files Moved' :
                 action === 'copy' ? 'Files Copied' :
                 'Download Ready'}
              </h3>
              <p className="text-sm text-gray-600">
                Successfully processed {selectedFiles.length} file(s)
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
