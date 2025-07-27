import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { ProcessedFixture } from '@/types/api'

interface UseSmartPollingOptions {
  fixtures?: ProcessedFixture[]
  enabled?: boolean
  liveInterval?: number // milliseconds
  normalInterval?: number // milliseconds
}

export function useSmartPolling({
  fixtures = [],
  enabled = true,
  liveInterval = 30 * 1000, // 30 seconds
  normalInterval = 5 * 60 * 1000, // 5 minutes
}: UseSmartPollingOptions = {}) {
  const queryClient = useQueryClient()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const currentIntervalRef = useRef<number>(normalInterval)

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    const hasLiveFixtures = fixtures.some(fixture => 
      fixture.match_status.status === 'live'
    )

    const hasUpcomingFixtures = fixtures.some(fixture => {
      if (fixture.match_status.status !== 'scheduled') return false
      const kickoff = new Date(fixture.kickoff_time)
      const now = new Date()
      const diffMinutes = (kickoff.getTime() - now.getTime()) / (1000 * 60)
      // Consider fixtures starting within 15 minutes as "upcoming"
      return diffMinutes <= 15 && diffMinutes > 0
    })

    // Determine the appropriate polling interval
    let targetInterval = normalInterval
    
    if (hasLiveFixtures) {
      targetInterval = liveInterval
    } else if (hasUpcomingFixtures) {
      targetInterval = Math.min(liveInterval * 2, normalInterval) // 1 minute for upcoming
    }

    // Only restart interval if the target interval has changed
    if (currentIntervalRef.current !== targetInterval) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      currentIntervalRef.current = targetInterval
      
      intervalRef.current = setInterval(() => {
        // Invalidate fixtures queries to trigger refetch
        queryClient.invalidateQueries({ queryKey: ['fixtures'] })
      }, targetInterval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [fixtures, enabled, liveInterval, normalInterval, queryClient])

  // Return current polling status
  const hasLiveFixtures = fixtures.some(fixture => 
    fixture.match_status.status === 'live'
  )

  const hasUpcomingFixtures = fixtures.some(fixture => {
    if (fixture.match_status.status !== 'scheduled') return false
    const kickoff = new Date(fixture.kickoff_time)
    const now = new Date()
    const diffMinutes = (kickoff.getTime() - now.getTime()) / (1000 * 60)
    return diffMinutes <= 15 && diffMinutes > 0
  })

  return {
    isPolling: enabled && intervalRef.current !== null,
    currentInterval: currentIntervalRef.current,
    hasLiveFixtures,
    hasUpcomingFixtures,
    pollingMode: hasLiveFixtures ? 'live' : hasUpcomingFixtures ? 'upcoming' : 'normal',
  }
}

// Hook for manually triggering a refresh of fixtures data
export function useRefreshFixtures() {
  const queryClient = useQueryClient()

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ['fixtures'] })
  }

  const isRefreshing = queryClient.isFetching({ queryKey: ['fixtures'] }) > 0

  return {
    refresh,
    isRefreshing,
  }
}