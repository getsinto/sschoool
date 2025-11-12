'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Database,
  Download,
  Upload,
  Trash2,
  Calendar,
  HardDrive,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react'

interface BackupFile {
  id: string
  filename: string
  size: number
  createdAt: string
  type: 'manual' | 'automatic'
  status: 'completed' | 'in_progress' | 'failed'
  downloadUrl?: string
}

interface BackupManagerProps {
  backupFrequency: 'daily' | 'weekly' | 'monthly'
  backupRetention: number
  onUpdateSettings: (settings: { backupFrequency: string; backupRetention: number }) => void
}

const mockBackups: BackupFile[] = [
  {
    id: 'backup_1',
    filename: 'eduplatform_backup_2024-01-18_14-30.sql',
    size: 45678901,
    createdAt: '2024-01-18T14:30:00Z',
    type: 'automatic',
    status: 'completed',
    downloadUrl: '/backups/eduplatform_backup_2024-01-18_14-30.sql'
  },
  {
    id: 'backup_2',
    filename: 'eduplatform_backup_2024-01-17_02-00.sql',
    size: 44892345,
    createdAt: '2024-01-17T02:00:00Z',
    type: 'automatic',
    status: 'completed',
    downloadUrl: '/backups/eduplatform_backup_2024-01-17_02-00.sql'
  },
  {
    id: 'backup_3',
    filename: 'eduplatform_manual_backup_2024-01-16_16-45.sql',
    size: 44123456,
    createdAt: '2024-01-16T16:45:00Z',
    type: 'manual',
    status: 'completed',
    downloadUrl: '/backups/eduplatform_manual_backup_2024-01-16_16-45.sql'
  },
  {
    id: 'backup_4',
    filename: 'eduplatform_backup_2024-01-16_02-00.sql',
    size: 0,
    createdAt: '2024-01-16T02:00:00Z',
    type: 'automatic',
    status: 'failed'
  }
]

export default function BackupManager({ 
  backupFrequency, 
  backupRetention, 
  onUpdateSettings 
}: BackupManagerProps) {
  const [backups, setBackups] = useState<BackupFile[]>(mockBackups)
  const [creatingBackup, setCreatingBackup] = useState(false)
  const [restoringBackup, setRestoringBackup] = useState<string | null>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'in_progress': return <Clock className="w-4 h-4" />
      case 'failed': return <AlertCircle className="w-4 h-4" />
      default: return <Database className="w-4 h-4" />
    }
  }

  const handleCreateBackup = async () => {
    setCreatingBackup(true)
    
    try {
      // In real app, make API call to create backup
      const response = await fetch('/api/admin/settings/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'manual' })
      })
      
      if (response.ok) {
        const result = await response.json()
        
        // Add new backup to list
        const newBackup: BackupFile = {
          id: `backup_${Date.now()}`,
          filename: `eduplatform_manual_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.sql`,
          size: Math.floor(Math.random() * 50000000) + 40000000,
          createdAt: new Date().toISOString(),
          type: 'manual',
          status: 'completed',
          downloadUrl: result.downloadUrl
        }
        
        setBackups(prev => [newBackup, ...prev])
      }
    } catch (error) {
      console.error('Error creating backup:', error)
    } finally {
      setCreatingBackup(false)
    }
  }

  const handleRestoreBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to restore this backup? This will overwrite all current data.')) {
      return
    }
    
    setRestoringBackup(backupId)
    
    try {
      // In real app, make API call to restore backup
      const response = await fetch('/api/admin/settings/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupId })
      })
      
      if (response.ok) {
        alert('Backup restored successfully. Please refresh the page.')
      }
    } catch (error) {
      console.error('Error restoring backup:', error)
      alert('Failed to restore backup. Please try again.')
    } finally {
      setRestoringBackup(null)
    }
  }

  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      return
    }
    
    try {
      // In real app, make API call to delete backup
      const response = await fetch(`/api/admin/settings/backup/${backupId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setBackups(prev => prev.filter(backup => backup.id !== backupId))
      }
    } catch (error) {
      console.error('Error deleting backup:', error)
    }
  }

  const handleDownloadBackup = (backup: BackupFile) => {
    if (backup.downloadUrl) {
      const link = document.createElement('a')
      link.href = backup.downloadUrl
      link.download = backup.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const completedBackups = backups.filter(b => b.status === 'completed')
  const totalBackupSize = completedBackups.reduce((sum, backup) => sum + backup.size, 0)

  return (
    <div className="space-y-6">
      {/* Backup Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Backup Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Backup Frequency
              </label>
              <select
                value={backupFrequency}
                onChange={(e) => onUpdateSettings({ 
                  backupFrequency: e.target.value, 
                  backupRetention 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Retention Period (days)
              </label>
              <input
                type="number"
                value={backupRetention}
                onChange={(e) => onUpdateSettings({ 
                  backupFrequency, 
                  backupRetention: parseInt(e.target.value) 
                })}
                min="1"
                max="365"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div>
              <h4 className="font-medium text-gray-900">Next Automatic Backup</h4>
              <p className="text-sm text-gray-600">
                {backupFrequency === 'daily' ? 'Tomorrow at 2:00 AM' :
                 backupFrequency === 'weekly' ? 'Next Sunday at 2:00 AM' :
                 'Next month on the 1st at 2:00 AM'}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      {/* Backup Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Backups</p>
                <p className="text-2xl font-bold text-gray-900">{backups.length}</p>
              </div>
              <Database className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Storage Used</p>
                <p className="text-2xl font-bold text-gray-900">{formatFileSize(totalBackupSize)}</p>
              </div>
              <HardDrive className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round((completedBackups.length / backups.length) * 100)}%
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Manual Backup */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Manual Backup</CardTitle>
            <Button onClick={handleCreateBackup} disabled={creatingBackup}>
              {creatingBackup ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating Backup...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Create Backup Now
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Create an immediate backup of your database. This backup will be stored alongside your automatic backups.
          </p>
        </CardContent>
      </Card>

      {/* Backup List */}
      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {backups.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(backup.status)}
                    <Badge className={getStatusColor(backup.status)}>
                      {backup.status}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{backup.filename}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{formatDate(backup.createdAt)}</span>
                      <span>{backup.size > 0 ? formatFileSize(backup.size) : 'N/A'}</span>
                      <Badge variant="outline" className="capitalize">
                        {backup.type}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {backup.status === 'completed' && backup.downloadUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadBackup(backup)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {backup.status === 'completed' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRestoreBackup(backup.id)}
                      disabled={restoringBackup === backup.id}
                    >
                      {restoringBackup === backup.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteBackup(backup.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}