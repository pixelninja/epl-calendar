import { useEffect, useCallback } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { getTeamById } from '@/utils/teamHelpers'
import type { ProcessedFixture } from '@/types/api'
import type { NotificationSettings } from '@/contexts/SettingsContext'

interface UseNotificationSchedulerProps {
  fixtures: ProcessedFixture[]
  favoriteTeamId: number | null
  notificationSettings: NotificationSettings
  timezone: string
}

export function useNotificationScheduler({
  fixtures,
  favoriteTeamId,
  notificationSettings,
  timezone
}: UseNotificationSchedulerProps) {
  const { sendNotification, isSupported, permission } = useNotifications()

  // Generate notification content for daily summaries
  const generateDailySummaryNotification = useCallback((
    targetDate: Date,
    type: 'today' | 'tomorrow'
  ) => {
    const dateStr = targetDate.toDateString()
    const dayFixtures = fixtures.filter(fixture => {
      const fixtureDate = new Date(fixture.kickoff_time)
      return fixtureDate.toDateString() === dateStr && fixture.match_status.status === 'scheduled'
    })

    if (dayFixtures.length === 0) return null

    const favoriteTeam = getTeamById(favoriteTeamId)
    const favoriteTeamFixture = favoriteTeam 
      ? dayFixtures.find(f => f.team_h === favoriteTeamId || f.team_a === favoriteTeamId)
      : null

    // timePrefix variable removed as it's not used in the notification generation
    
    if (favoriteTeamFixture && favoriteTeam) {
      const opponent = favoriteTeamFixture.team_h === favoriteTeamId 
        ? favoriteTeamFixture.team_a_short_name 
        : favoriteTeamFixture.team_h_short_name
      const venue = favoriteTeamFixture.team_h === favoriteTeamId ? 'vs' : 'at'
      const kickoffTime = new Date(favoriteTeamFixture.kickoff_time).toLocaleTimeString('en-GB', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit'
      })

      return {
        title: `⚽ ${favoriteTeam.short_name} plays ${type}!`,
        body: `${favoriteTeam.short_name} ${venue} ${opponent} at ${kickoffTime}${dayFixtures.length > 1 ? ` • ${dayFixtures.length} games total` : ''}`,
        tag: `daily-${type}-favorite`,
        icon: '/android-chrome-192x192.png'
      }
    }

    // Generic daily summary
    const firstGame = dayFixtures[0]
    const firstKickoff = new Date(firstGame.kickoff_time).toLocaleTimeString('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit'
    })

    return {
      title: `⚽ ${dayFixtures.length} EPL game${dayFixtures.length > 1 ? 's' : ''} ${type}`,
      body: `First match: ${firstGame.team_h_short_name} vs ${firstGame.team_a_short_name} at ${firstKickoff}`,
      tag: `daily-${type}`,
      icon: '/pwa-192x192.png'
    }
  }, [fixtures, favoriteTeamId, timezone])

  // Generate favorite team specific notifications
  const generateFavoriteTeamNotification = useCallback((
    fixture: ProcessedFixture,
    type: 'day-before' | 'kickoff'
  ) => {
    const favoriteTeam = getTeamById(favoriteTeamId)
    if (!favoriteTeam) return null

    const opponent = fixture.team_h === favoriteTeamId 
      ? fixture.team_a_short_name 
      : fixture.team_h_short_name
    const venue = fixture.team_h === favoriteTeamId ? 'vs' : 'at'
    const kickoffTime = new Date(fixture.kickoff_time).toLocaleTimeString('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit'
    })

    if (type === 'day-before') {
      return {
        title: `⚽ ${favoriteTeam.short_name} plays tomorrow`,
        body: `${favoriteTeam.short_name} ${venue} ${opponent} at ${kickoffTime}`,
        tag: `favorite-team-${fixture.id}-day-before`,
        icon: '/android-chrome-192x192.png'
      }
    } else {
      return {
        title: `⚽ ${favoriteTeam.short_name} kicks off soon!`,
        body: `${favoriteTeam.short_name} ${venue} ${opponent} starts in 1 hour`,
        tag: `favorite-team-${fixture.id}-kickoff`,
        icon: '/android-chrome-192x192.png'
      }
    }
  }, [favoriteTeamId, timezone])

  // Schedule daily notifications
  const scheduleDailyNotifications = useCallback(() => {
    if (!notificationSettings.dailyReminders || !isSupported || permission !== 'granted') {
      return
    }

    const now = new Date()
    const today = new Date(now)
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Schedule today's games notification
    const todayTime = notificationSettings.todayGamesTime.split(':')
    const todayHour = parseInt(todayTime[0])
    const todayMinute = parseInt(todayTime[1])
    
    const todayNotificationTime = new Date(today)
    todayNotificationTime.setHours(todayHour, todayMinute, 0, 0)
    
    if (todayNotificationTime > now) {
      const todayDelay = todayNotificationTime.getTime() - now.getTime()
      setTimeout(() => {
        const notification = generateDailySummaryNotification(today, 'today')
        if (notification) {
          sendNotification(notification)
        }
      }, todayDelay)
    }

    // Schedule tomorrow's games notification
    const tomorrowTime = notificationSettings.tomorrowGamesTime.split(':')
    const tomorrowHour = parseInt(tomorrowTime[0])
    const tomorrowMinute = parseInt(tomorrowTime[1])
    
    const tomorrowNotificationTime = new Date(today)
    tomorrowNotificationTime.setHours(tomorrowHour, tomorrowMinute, 0, 0)
    
    if (tomorrowNotificationTime > now) {
      const tomorrowDelay = tomorrowNotificationTime.getTime() - now.getTime()
      setTimeout(() => {
        const notification = generateDailySummaryNotification(tomorrow, 'tomorrow')
        if (notification) {
          sendNotification(notification)
        }
      }, tomorrowDelay)
    }
  }, [
    notificationSettings.dailyReminders,
    notificationSettings.todayGamesTime,
    notificationSettings.tomorrowGamesTime,
    isSupported,
    permission,
    generateDailySummaryNotification,
    sendNotification
  ])

  // Schedule favorite team notifications
  const scheduleFavoriteTeamNotifications = useCallback(() => {
    if (!notificationSettings.favoriteTeamReminders || !favoriteTeamId || !isSupported || permission !== 'granted') {
      return
    }

    const now = new Date()
    const favoriteTeamFixtures = fixtures.filter(fixture => 
      (fixture.team_h === favoriteTeamId || fixture.team_a === favoriteTeamId) &&
      fixture.match_status.status === 'scheduled' &&
      new Date(fixture.kickoff_time) > now
    )

    favoriteTeamFixtures.forEach(fixture => {
      const kickoffTime = new Date(fixture.kickoff_time)
      
      // Day before notification
      if (notificationSettings.advanceNotice === 'day-before' || notificationSettings.advanceNotice === 'both') {
        const dayBefore = new Date(kickoffTime)
        dayBefore.setDate(dayBefore.getDate() - 1)
        dayBefore.setHours(20, 0, 0, 0) // 8 PM day before
        
        if (dayBefore > now) {
          const delay = dayBefore.getTime() - now.getTime()
          setTimeout(() => {
            const notification = generateFavoriteTeamNotification(fixture, 'day-before')
            if (notification) {
              sendNotification(notification)
            }
          }, delay)
        }
      }

      // Kickoff notification (1 hour before)
      if (notificationSettings.kickoffReminders) {
        const oneHourBefore = new Date(kickoffTime.getTime() - 60 * 60 * 1000)
        
        if (oneHourBefore > now) {
          const delay = oneHourBefore.getTime() - now.getTime()
          setTimeout(() => {
            const notification = generateFavoriteTeamNotification(fixture, 'kickoff')
            if (notification) {
              sendNotification(notification)
            }
          }, delay)
        }
      }
    })
  }, [
    notificationSettings.favoriteTeamReminders,
    notificationSettings.advanceNotice,
    notificationSettings.kickoffReminders,
    favoriteTeamId,
    fixtures,
    isSupported,
    permission,
    generateFavoriteTeamNotification,
    sendNotification
  ])

  // Schedule all notifications when dependencies change
  useEffect(() => {
    if (!isSupported || permission !== 'granted') {
      return
    }

    // Clear any existing timeouts (in a real implementation, we'd track these)
    // For now, we'll just schedule new ones
    
    scheduleDailyNotifications()
    scheduleFavoriteTeamNotifications()
  }, [
    scheduleDailyNotifications,
    scheduleFavoriteTeamNotifications,
    isSupported,
    permission
  ])

  return {
    scheduleDailyNotifications,
    scheduleFavoriteTeamNotifications,
    isSupported,
    permission
  }
}