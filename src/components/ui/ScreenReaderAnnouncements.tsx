import { useScreenReader } from '@/hooks/useScreenReader'

/**
 * Screen reader announcement regions
 * Renders ARIA live regions for dynamic content announcements
 * Should be included once at the app level
 */
export function ScreenReaderAnnouncements() {
  const { politeMessages, assertiveMessages } = useScreenReader()

  return (
    <>
      {/* Polite announcements - wait for user to finish current activity */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {politeMessages.map(message => (
          <div key={message.id}>
            {message.message}
          </div>
        ))}
      </div>

      {/* Assertive announcements - interrupt user for important updates */}
      <div
        aria-live="assertive" 
        aria-atomic="true"
        className="sr-only"
        role="alert"
      >
        {assertiveMessages.map(message => (
          <div key={message.id}>
            {message.message}
          </div>
        ))}
      </div>
    </>
  )
}