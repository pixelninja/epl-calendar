import { useQuery } from '@tanstack/react-query'
import { fplApi } from '@/lib/api'
import { getSmartStaleTime } from '@/lib/persistent-cache'

export function useFixtures() {
  return useQuery({
    queryKey: ['fixtures'],
    queryFn: () => fplApi.getProcessedFixtures('UTC'), // Always fetch in UTC
    staleTime: (query) => {
      // Calculate smart stale time based on match schedule
      const data = query.state.data
      if (data && Array.isArray(data)) {
        const hasLiveMatches = data.some(fixture => fixture.match_status.status === 'live')
        const today = new Date().toDateString()
        const hasTodayMatches = data.some(fixture => {
          const fixtureDate = new Date(fixture.kickoff_time).toDateString()
          return fixtureDate === today && fixture.match_status.status === 'scheduled'
        })
        
        return getSmartStaleTime(hasLiveMatches, hasTodayMatches)
      }
      
      // Default to conservative stale time if no data
      return 10 * 60 * 1000 // 10 minutes
    },
    refetchInterval: (data) => {
      // Smart polling: faster during match times
      if (data && Array.isArray(data)) {
        const hasLiveMatches = data.some(fixture => fixture.match_status.status === 'live')
        const today = new Date().toDateString()
        const hasTodayMatches = data.some(fixture => {
          const fixtureDate = new Date(fixture.kickoff_time).toDateString()
          return fixtureDate === today && fixture.match_status.status === 'scheduled'
        })
        
        if (hasLiveMatches) {
          return 30 * 1000 // 30 seconds if any match is live
        }
        
        if (hasTodayMatches) {
          return 2 * 60 * 1000 // 2 minutes if matches today
        }
        
        return 15 * 60 * 1000 // 15 minutes otherwise
      }
      
      return 10 * 60 * 1000 // Default 10 minutes
    },
    refetchIntervalInBackground: true,
  })
}

export function useFixturesForGameweek(gameweek: number) {
  return useQuery({
    queryKey: ['fixtures', 'gameweek', gameweek],
    queryFn: () => fplApi.getFixturesForGameweek(gameweek),
    staleTime: 30 * 60 * 1000, // 30 minutes for specific gameweek data
    enabled: gameweek > 0,
  })
}

export function useFixturesWithTeams() {
  return useQuery({
    queryKey: ['fixtures', 'with-teams'],
    queryFn: () => fplApi.getFixturesWithTeams(),
    staleTime: 15 * 60 * 1000, // 15 minutes for fixture-team combinations
    refetchInterval: (data) => {
      // Check if any fixtures are live
      const hasLiveFixtures = data && Array.isArray(data) && data.some(fixture => 
        fixture.started && !fixture.finished
      )
      return hasLiveFixtures ? 30 * 1000 : 15 * 60 * 1000 // 15 min instead of 5
    },
  })
}

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: () => fplApi.getTeams(),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours (teams rarely change)
    gcTime: 7 * 24 * 60 * 60 * 1000, // Keep for 7 days
  })
}

export function useBootstrapStatic() {
  return useQuery({
    queryKey: ['bootstrap-static'],
    queryFn: () => fplApi.getBootstrapStatic(),
    staleTime: 4 * 60 * 60 * 1000, // 4 hours (season data changes infrequently)
    gcTime: 24 * 60 * 60 * 1000, // Keep for 24 hours
  })
}