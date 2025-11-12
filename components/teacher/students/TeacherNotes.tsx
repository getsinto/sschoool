'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { StickyNote, Trash2, Edit2 } from 'lucide-react'

interface Note {
  id: string
  text: string
  tag: 'general' | 'achievement' | 'concern' | 'improvement' | 'follow-up'
  createdAt: string
  updatedAt: string
}

interface TeacherNotesProps {
  studentId: string
  notes: Note[]
  onAddNote?: (text: string, tag: string) => void
  onUpdateNote?: (noteId: string, text: string, tag: string) => void
  onDeleteNote?: (noteId: string) => void
}

export default function TeacherNotes({ 
  studentId, 
  notes, 
  onAddNote, 
  onUpdateNote, 
  onDeleteNote 
}: TeacherNotesProps) {
  const [newNote, setNewNote] = useState('')
  const [noteTag, setNoteTag] = useState<string>('general')
  const [editingNote, setEditingNote] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [editTag, setEditTag] = useState('')

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'achievement': return 'bg-green-100 text-green-800'
      case 'concern': return 'bg-red-100 text-red-800'
      case 'improvement': return 'bg-yellow-100 text-yellow-800'
      case 'follow-up': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote?.(newNote, noteTag)
      setNewNote('')
      setNoteTag('general')
    }
  }

  const handleStartEdit = (note: Note) => {
    setEditingNote(note.id)
    setEditText(note.text)
    setEditTag(note.tag)
  }

  const handleSaveEdit = (noteId: string) => {
    if (editText.trim()) {
      onUpdateNote?.(noteId, editText, editTag)
      setEditingNote(null)
      setEditText('')
      setEditTag('')
    }
  }

  const handleCancelEdit = () => {
    setEditingNote(null)
    setEditText('')
    setEditTag('')
  }

  return (
    <div className="space-y-6">
      {/* Add New Note */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="w-5 h-5" />
            Add New Note
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter your note about this student..."
              rows={4}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="tag">Tag</Label>
              <select
                id="tag"
                value={noteTag}
                onChange={(e) => setNoteTag(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="general">General</option>
                <option value="achievement">Achievement</option>
                <option value="concern">Concern</option>
                <option value="improvement">Improvement</option>
                <option value="follow-up">Follow-up Needed</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                Add Note
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes History */}
      <Card>
        <CardHeader>
          <CardTitle>Notes History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="border rounded-lg p-4">
                {editingNote === note.id ? (
                  <div className="space-y-3">
                    <Textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <select
                        value={editTag}
                        onChange={(e) => setEditTag(e.target.value)}
                        className="border rounded-md px-3 py-1 text-sm"
                      >
                        <option value="general">General</option>
                        <option value="achievement">Achievement</option>
                        <option value="concern">Concern</option>
                        <option value="improvement">Improvement</option>
                        <option value="follow-up">Follow-up Needed</option>
                      </select>
                      <Button size="sm" onClick={() => handleSaveEdit(note.id)}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getTagColor(note.tag)}>{note.tag}</Badge>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(note)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteNote?.(note.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm">{note.text}</p>
                    {note.updatedAt !== note.createdAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Updated: {new Date(note.updatedAt).toLocaleDateString()}
                      </p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
          
          {notes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <StickyNote className="w-12 h-12 mx-auto mb-2 text-gray-400" />
              <p>No notes yet</p>
              <p className="text-sm">Add your first note about this student</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
