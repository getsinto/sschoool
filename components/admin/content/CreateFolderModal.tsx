'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X, Folder, AlertCircle } from 'lucide-react'

interface FolderOption {
  id: string
  name: string
  path: string
}

interface CreateFolderModalProps {
  isOpen: boolean
  onClose: () => void
  folders: FolderOption[]
  onCreateFolder: (name: string, parentId: string | null) => Promise<void>
}

export default function CreateFolderModal({
  isOpen,
  onClose,
  folders,
  onCreateFolder
}: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState('')
  const [parentId, setParentId] = useState<string>('root')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleCreate = async () => {
    setError('')

    // Validation
    if (!folderName.trim()) {
      setError('Folder name is required')
      return
    }

    if (folderName.length < 2) {
      setError('Folder name must be at least 2 characters')
      return
    }

    if (folderName.length > 50) {
      setError('Folder name must be less than 50 characters')
      return
    }

    // Check for invalid characters
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(folderName)) {
      setError('Folder name can only contain letters, numbers, spaces, hyphens, and underscores')
      return
    }

    setIsCreating(true)

    try {
      await onCreateFolder(folderName.trim(), parentId === 'root' ? null : parentId)
      
      // Reset form
      setFolderName('')
      setParentId('root')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create folder')
    } finally {
      setIsCreating(false)
    }
  }

  const handleClose = () => {
    if (!isCreating) {
      setFolderName('')
      setParentId('root')
      setError('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <Folder className="w-5 h-5 text-blue-600" />
            <CardTitle>Create New Folder</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose}
            disabled={isCreating}
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Folder Name Input */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Folder Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter folder name"
              value={folderName}
              onChange={(e) => {
                setFolderName(e.target.value)
                setError('')
              }}
              disabled={isCreating}
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              {folderName.length}/50 characters
            </p>
          </div>

          {/* Parent Folder Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Parent Folder
            </label>
            <Select 
              value={parentId} 
              onValueChange={setParentId}
              disabled={isCreating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parent folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">Root (No Parent)</SelectItem>
                {folders
                  .filter(f => f.id !== 'root')
                  .map(folder => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.path}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Choose where to create this folder
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Preview */}
          {folderName && !error && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-medium text-blue-900 mb-1">Preview:</p>
              <p className="text-sm text-blue-700">
                {parentId === 'root' 
                  ? `/${folderName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
                  : `${folders.find(f => f.id === parentId)?.path}/${folderName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
                }
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating || !folderName.trim()}
              className="flex-1"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating...
                </>
              ) : (
                'Create Folder'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
