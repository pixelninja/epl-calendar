import type { BootstrapStatic, Fixture, FixtureWithTeams, ProcessedFixture, Team } from '@/types/api'
import { generateRealFixtures, realBootstrapStatic, realTeams } from './mock-data'

const FPL_BASE_URL = '/api' // Use Vercel API routes in production
const USE_LOCAL_DATA = import.meta.env.DEV // Use local data in dev, try API in prod

export class FPLApiError extends Error {
  public status?: number
  public endpoint?: string
  
  constructor(
    message: string,
    status?: number,
    endpoint?: string
  ) {
    super(message)
    this.name = 'FPLApiError'
    this.status = status
    this.endpoint = endpoint
  }
}

interface CacheEntry {
  data: unknown
  timestamp: number
  etag?: string
  lastModified?: string
}

class FPLApiService {
  private cache = new Map<string, CacheEntry>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  private async fetchWithRetry<T>(
    endpoint: string,
    retries = 3,
    delay = 1000
  ): Promise<{ data: T; etag?: string; lastModified?: string }> {
    const url = `${FPL_BASE_URL}${endpoint}`
    const cached = this.cache.get(endpoint)
    
    // Prepare conditional request headers
    const headers: Record<string, string> = {
      'User-Agent': 'EPL Calendar PWA',
    }
    
    if (cached?.etag) {
      headers['If-None-Match'] = cached.etag
    }
    
    if (cached?.lastModified) {
      headers['If-Modified-Since'] = cached.lastModified
    }
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, { headers })

        // Handle 304 Not Modified - data hasn't changed
        if (response.status === 304 && cached) {
          return {
            data: cached.data as T,
            etag: cached.etag,
            lastModified: cached.lastModified
          }
        }

        if (!response.ok) {
          throw new FPLApiError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            endpoint
          )
        }

        const data = await response.json()
        const etag = response.headers.get('etag') || undefined
        const lastModified = response.headers.get('last-modified') || undefined
        
        return { data, etag, lastModified }
      } catch (error) {
        if (attempt === retries) {
          if (error instanceof FPLApiError) {
            throw error
          }
          throw new FPLApiError(
            `Failed to fetch from ${endpoint} after ${retries} attempts: ${error}`,
            undefined,
            endpoint
          )
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }

    throw new FPLApiError('Unexpected error in fetchWithRetry')
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T
    }
    return null
  }

  private setCachedData<T>(key: string, data: T, etag?: string, lastModified?: string): void {
    this.cache.set(key, { 
      data, 
      timestamp: Date.now(),
      etag,
      lastModified
    })
  }

  async getBootstrapStatic(): Promise<BootstrapStatic> {
    if (USE_LOCAL_DATA) {
      // Development: Use local data with simulated delay
      await new Promise(resolve => setTimeout(resolve, 300))
      return realBootstrapStatic
    }

    const cacheKey = 'bootstrap-static'
    const cached = this.getCachedData<BootstrapStatic>(cacheKey)
    
    if (cached) {
      return cached
    }

    try {
      // Production: Try real API first
      const result = await this.fetchWithRetry<BootstrapStatic>('/bootstrap-static/')
      this.setCachedData(cacheKey, result.data, result.etag, result.lastModified)
      return result.data
    } catch (error) {
      // Fallback to local data if API fails
      console.warn('API failed, falling back to local data:', error)
      return realBootstrapStatic
    }
  }

  async getFixtures(): Promise<Fixture[]> {
    if (USE_LOCAL_DATA) {
      // Development: Use local data with simulated delay
      await new Promise(resolve => setTimeout(resolve, 200))
      return (await import('./mock-data')).realFixtures
    }

    const cacheKey = 'fixtures'
    const cached = this.getCachedData<Fixture[]>(cacheKey)
    
    if (cached) {
      return cached
    }

    try {
      // Production: Try real API first
      const result = await this.fetchWithRetry<Fixture[]>('/fixtures/')
      this.setCachedData(cacheKey, result.data, result.etag, result.lastModified)
      return result.data
    } catch (error) {
      // Fallback to local data if API fails
      console.warn('API failed, falling back to local data:', error)
      return (await import('./mock-data')).realFixtures
    }
  }

  async getFixturesForGameweek(gameweek: number): Promise<Fixture[]> {
    const cacheKey = `fixtures-gw-${gameweek}`
    const cached = this.getCachedData<Fixture[]>(cacheKey)
    
    if (cached) {
      return cached
    }

    const result = await this.fetchWithRetry<Fixture[]>(`/fixtures/?event=${gameweek}`)
    this.setCachedData(cacheKey, result.data, result.etag, result.lastModified)
    return result.data
  }

  async getTeams(): Promise<Team[]> {
    if (USE_LOCAL_DATA) {
      return realTeams
    }
    const bootstrap = await this.getBootstrapStatic()
    return bootstrap.teams
  }

  async getFixturesWithTeams(): Promise<FixtureWithTeams[]> {
    const [fixtures, teams] = await Promise.all([
      this.getFixtures(),
      this.getTeams()
    ])

    const teamMap = new Map(teams.map(team => [team.id, team]))

    return fixtures.map(fixture => {
      const teamA = teamMap.get(fixture.team_a)
      const teamH = teamMap.get(fixture.team_h)

      return {
        ...fixture,
        team_a_name: teamA?.name || 'Unknown',
        team_a_short_name: teamA?.short_name || 'UNK',
        team_h_name: teamH?.name || 'Unknown',
        team_h_short_name: teamH?.short_name || 'UNK',
      }
    })
  }

  async getProcessedFixtures(timezone = 'UTC'): Promise<ProcessedFixture[]> {
    if (USE_LOCAL_DATA) {
      // Development: Use local data with simulated delay
      await new Promise(resolve => setTimeout(resolve, 300))
      return generateRealFixtures()
    }

    try {
      // Production: Try real API first
      const fixturesWithTeams = await this.getFixturesWithTeams()
      const bootstrap = await this.getBootstrapStatic()

      return fixturesWithTeams.map(fixture => {
        const kickoffDate = new Date(fixture.kickoff_time)
        
        // Determine match status
        let match_status: ProcessedFixture['match_status']
        
        if (fixture.finished) {
          match_status = { status: 'finished' }
        } else if (fixture.started) {
          match_status = { 
            status: 'live', 
            minutes: fixture.minutes,
            period: fixture.minutes <= 45 ? 'first-half' : 'second-half'
          }
        } else if (fixture.kickoff_time) {
          match_status = { status: 'scheduled' }
        } else {
          match_status = { status: 'postponed' }
        }

        // Find the matchweek/gameweek this fixture belongs to
        const gameweek = bootstrap.events?.find(event => event.id === fixture.event)
        
        return {
          ...fixture,
          match_status,
          kickoff_local: kickoffDate.toLocaleString('en-GB', { 
            timeZone: timezone,
            dateStyle: 'short',
            timeStyle: 'short'
          }),
          matchweek: gameweek?.id || fixture.event || 0
        }
      })
    } catch (error) {
      // Fallback to local data if API fails
      console.warn('API failed, falling back to local data:', error)
      return generateRealFixtures()
    }
  }

  clearCache(): void {
    this.cache.clear()
  }

  getCacheSize(): number {
    return this.cache.size
  }
}

export const fplApi = new FPLApiService()
export default fplApi