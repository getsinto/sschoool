'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ChatInterface from './ChatInterface'

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    // Load chat state from localStorage
    const savedState = localStorage.getItem('chatWidgetState')
    if (savedState) {
      const { isOpen: savedIsOpen } = JSON.parse(savedState)
      setIsOpen(savedIsOpen)
    }
  }, [])

  useEffect(() => {
    // Save chat state
    localStorage.setItem('chatWidgetState', JSON.stringify({ isOpen }))
  }, [isOpen])

  const handleToggle = () => {
    setIsOpen(!isOpen)
    setIsMinimized(false)
    if (!isOpen) {
      setUnreadCount(0)
    }
  }

  const handleMinimize = () => {
    setIsMinimized(true)
    setIsOpen(false)
  }

  const handleNewMessage = () => {
    if (!isOpen) {
      setUnreadCount(prev => prev + 1)
    }
  }

  return (
    <>
      {/* Chat Interface */}
      {isOpen && !isMinimized && (
        <div className="fixed bottom-20 right-4 w-full sm:w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-8rem)] bg-white rounded-lg shadow-2xl z-50 flex flex-col border border-gray-200 animate-in slide-in-from-bottom-5">
          <ChatInterface
            onClose={handleToggle}
            onMinimize={handleMinimize}
            onNewMessage={handleNewMessage}
          />
        </div>
      )}

      {/* Floating Chat Button */}
      <Button
        onClick={handleToggle}
        className="fixed bottom-4 right-4 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg z-50 bg-blue-600 hover:bg-blue-700"
        size="icon"
      >
        {isOpen ? (
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        ) : (
          <>
            <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </>
        )}
      </Button>
    </>
  )
}
