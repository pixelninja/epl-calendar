import { useQuery } from '@tanstack/react-query'
import { fplApi } from '@/lib/api'

export function useFixtures() {
  return useQuery({
    queryKey: ['fixtures'],
    queryFn: () => fplApi.getProcessedFixtures('UTC'), // Always fetch in UTC
    staleTime: 2 * 60 * 1000, // 2 minutes for fixtures (more dynamic data)
    refetchInterval: (data) => {
      // Smart polling: faster during match times
      if (data && Array.isArray(data) && data.some(fixture => fixture.match_status.status === 'live')) {
        return 30 * 1000 // 30 seconds if any match is live
      }
      return 5 * 60 * 1000 // 5 minutes otherwise
    },
    refetchIntervalInBackground: true,
  })
}

export function useFixturesForGameweek(gameweek: number) {
  return useQuery({
    queryKey: ['fixtures', 'gameweek', gameweek],
    queryFn: () => fplApi.getFixturesForGameweek(gameweek),
    staleTime: 2 * 60 * 1000,
    enabled: gameweek > 0,
  })
}

export function useFixturesWithTeams() {
  return useQuery({
    queryKey: ['fixtures', 'with-teams'],
    queryFn: () => fplApi.getFixturesWithTeams(),
    staleTime: 2 * 60 * 1000,
    refetchInterval: (data) => {
      // Check if any fixtures are live
      const hasLiveFixtures = data && Array.isArray(data) && data.some(fixture => 
        fixture.started && !fixture.finished
      )
      return hasLiveFixtures ? 30 * 1000 : 5 * 60 * 1000
    },
  })
}

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: () => fplApi.getTeams(),
    staleTime: 60 * 60 * 1000, // 1 hour (teams don't change often)
  })
}

export function useBootstrapStatic() {
  return useQuery({
    queryKey: ['bootstrap-static'],
    queryFn: () => fplApi.getBootstrapStatic(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}