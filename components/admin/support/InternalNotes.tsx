'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { StickyNote, Plus, Trash2, User, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface InternalNote {
  id: string
  content: string
  created_by: string
  created_by_name: string
  created_at: string
  is_important: boolean
}

interface InternalNotesProps {
  ticketId: string
  notes?: InternalNote[]
  onAddNote?: (note: string, isImportant: boolean) => Promise<void>
  onDeleteNote?: (noteId: string) => Promise<void>
}

export function InternalNotes({
  ticketId,
  notes = [],
  onAddNote,
  onDeleteNote
}: InternalNotesProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [noteContent, setNoteContent] = useState('')
  const [isImportant, setIsImportant] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!noteContent.trim()) return

    setSaving(true)
    try {
      await onAddNote?.(noteContent, isImportant)
      setNoteContent('')
      setIsImportant(false)
      setShowAddForm(false)
    } catch (error) {
      console.error('Failed to save note:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this internal note?')) return

    try {
      await onDeleteNote?.(noteId)
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <StickyNote className="h-4 w-4" />
            Internal Notes
            {notes.length > 0 && (
              <Badge variant="outline">{notes.length}</Badge>
            )}
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Note
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showAddForm && (
          <div className="mb-4 p-3 border rounded-lg bg-yellow-50 space-y-3">
            <Textarea
              placeholder="Add an internal note (only visible to staff)..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={3}
              className="bg-white"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isImportant}
                  onChange={(e) => setIsImportant(e.target.checked)}
                  className="rounded"
                />
                Mark as important
              </label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false)
                    setNoteContent('')
                    setIsImportant(false)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving || !noteContent.trim()}
                >
                  {saving ? 'Saving...' : 'Save Note'}
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {notes.length > 0 ? (
            notes.map((note) => (
              <div
                key={note.id}
                className={`border rounded-lg p-3 ${
                  note.is_important ? 'border-orange-300 bg-orange-50' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-gray-500" />
                    <span className="text-xs font-medium text-gray-700">
                      {note.created_by_name}
                    </span>
                    {note.is_important && (
                      <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-300">
                        Important
                      </Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(note.id)}
                    className="h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">
                  {note.content}
                </p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(note.created_at))} ago
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500 text-sm">
              <StickyNote className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No internal notes yet</p>
              <p className="text-xs mt-1">Add notes to keep track of important information</p>
            </div>
          )}
        </div>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> Internal notes are only visible to staff members and will not be shown to customers.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
