import { useState, useEffect, useCallback } from 'react'
import type { ProcessedFixture } from '@/types/api'

interface NotificationOptions {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
}

interface UseNotificationsReturn {
  permission: NotificationPermission
  requestPermission: () => Promise<NotificationPermission>
  sendNotification: (options: NotificationOptions) => Promise<Notification | null>
  scheduleFixtureNotifications: (fixtures: ProcessedFixture[]) => void
  clearScheduledNotifications: () => void
  isSupported: boolean
}

export function useNotifications(): UseNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [scheduledTimeouts, setScheduledTimeouts] = useState<Set<NodeJS.Timeout>>(new Set())

  const isSupported = 'Notification' in window && 'serviceWorker' in navigator

  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission)
    }
  }, [isSupported])

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      return 'denied'
    }

    if (permission === 'granted') {
      return 'granted'
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return 'denied'
    }
  }, [isSupported, permission])

  const sendNotification = useCallback(async (options: NotificationOptions): Promise<Notification | null> => {
    if (!isSupported || permission !== 'granted') {
      return null
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon || '/pwa-192x192.png',
        badge: options.badge || '/pwa-192x192.png',
        tag: options.tag,
        requireInteraction: options.requireInteraction || false,
        silent: false,
      })

      // Auto-close after 5 seconds unless requireInteraction is true
      if (!options.requireInteraction) {
        setTimeout(() => {
          try {
            notification.close()
          } catch {
            // Notification might already be closed
          }
        }, 5000)
      }

      return notification
    } catch (error) {
      console.error('Error sending notification:', error)
      return null
    }
  }, [isSupported, permission])

  const clearScheduledNotifications = useCallback(() => {
    scheduledTimeouts.forEach(timeout => clearTimeout(timeout))
    setScheduledTimeouts(new Set())
  }, [scheduledTimeouts])

  const scheduleFixtureNotifications = useCallback((fixtures: ProcessedFixture[]) => {
    if (!isSupported || permission !== 'granted') {
      return
    }

    // Clear existing scheduled notifications
    clearScheduledNotifications()

    const now = new Date()
    const newTimeouts = new Set<NodeJS.Timeout>()

    fixtures.forEach(fixture => {
      if (fixture.match_status.status !== 'scheduled') {
        return
      }

      const kickoffTime = new Date(fixture.kickoff_time)
      const timeDiff = kickoffTime.getTime() - now.getTime()

      // Schedule notifications for fixtures within the next 24 hours
      if (timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000) {
        // Notification 15 minutes before kickoff
        const notification15min = timeDiff - (15 * 60 * 1000)
        if (notification15min > 0) {
          const timeout15 = setTimeout(() => {
            sendNotification({
              title: 'Match Starting Soon!',
              body: `${fixture.team_h_short_name} vs ${fixture.team_a_short_name} kicks off in 15 minutes`,
              tag: `fixture-${fixture.id}-15min`,
              icon: '/pwa-192x192.png',
            })
          }, notification15min)
          newTimeouts.add(timeout15)
        }

        // Notification at kickoff
        if (timeDiff > 0) {
          const timeoutKickoff = setTimeout(() => {
            sendNotification({
              title: 'Match Kicked Off!',
              body: `${fixture.team_h_short_name} vs ${fixture.team_a_short_name} has started`,
              tag: `fixture-${fixture.id}-kickoff`,
              icon: '/pwa-192x192.png',
              requireInteraction: false,
            })
          }, timeDiff)
          newTimeouts.add(timeoutKickoff)
        }
      }
    })

    setScheduledTimeouts(newTimeouts)
  }, [isSupported, permission, sendNotification, clearScheduledNotifications])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearScheduledNotifications()
    }
  }, [clearScheduledNotifications])

  return {
    permission,
    requestPermission,
    sendNotification,
    scheduleFixtureNotifications,
    clearScheduledNotifications,
    isSupported,
  }
}