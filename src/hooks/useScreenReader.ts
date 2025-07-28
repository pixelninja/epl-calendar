import { useState, useCallback, useRef, useEffect } from 'react'

interface ScreenReaderMessage {
  id: string
  message: string
  priority: 'polite' | 'assertive'
  timestamp: number
}

/**
 * Custom hook for managing screen reader announcements
 * Provides controlled way to announce dynamic content changes to screen readers
 */
export function useScreenReader() {
  const [messages, setMessages] = useState<ScreenReaderMessage[]>([])
  const messageIdRef = useRef(0)

  /**
   * Announce a message to screen readers
   * @param message - The text to announce
   * @param priority - 'polite' (wait for user to finish) or 'assertive' (interrupt)
   */
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const id = `sr-message-${messageIdRef.current++}`
    const newMessage: ScreenReaderMessage = {
      id,
      message,
      priority,
      timestamp: Date.now()
    }

    setMessages(prev => [...prev, newMessage])

    // Auto-remove message after it's been announced (3 seconds)
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== id))
    }, 3000)
  }, [])

  /**
   * Announce loading state
   */
  const announceLoading = useCallback((message: string = 'Loading content') => {
    announce(message, 'polite')
  }, [announce])

  /**
   * Announce error state
   */
  const announceError = useCallback((message: string = 'An error occurred') => {
    announce(message, 'assertive')
  }, [announce])

  /**
   * Announce success/completion
   */
  const announceSuccess = useCallback((message: string) => {
    announce(message, 'polite')
  }, [announce])

  /**
   * Announce score update
   */
  const announceScoreUpdate = useCallback((homeTeam: string, awayTeam: string, homeScore: number, awayScore: number) => {
    const message = `Score update: ${homeTeam} ${homeScore}, ${awayTeam} ${awayScore}`
    announce(message, 'polite')
  }, [announce])

  /**
   * Announce match status change
   */
  const announceMatchStatus = useCallback((homeTeam: string, awayTeam: string, status: string) => {
    const statusText = {
      'live': 'has started',
      'finished': 'has finished',
      'postponed': 'has been postponed'
    }[status] || `status changed to ${status}`
    
    const message = `${homeTeam} vs ${awayTeam} ${statusText}`
    announce(message, 'polite')
  }, [announce])

  // Get current messages for rendering
  const politeMessages = messages.filter(msg => msg.priority === 'polite')
  const assertiveMessages = messages.filter(msg => msg.priority === 'assertive')

  return {
    announce,
    announceLoading,
    announceError,
    announceSuccess,
    announceScoreUpdate,
    announceMatchStatus,
    politeMessages,
    assertiveMessages
  }
}