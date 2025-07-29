import type { Team, ProcessedFixture } from '@/types/api'
import { realTeams } from '@/lib/mock-data'

/**
 * Get team details by team ID
 * @param teamId - The team ID to lookup
 * @returns Team object or null if not found
 */
export function getTeamById(teamId: number | null): Team | null {
  if (teamId === null) return null
  return realTeams.find(team => team.id === teamId) || null
}

/**
 * Check if a specific team is playing in any of the given fixtures
 * @param teamId - The team ID to check for
 * @param fixtures - Array of fixtures to search through
 * @returns True if the team is playing in any fixture
 */
export function isTeamPlayingInFixtures(teamId: number | null, fixtures: ProcessedFixture[]): boolean {
  if (teamId === null) return false
  
  return fixtures.some(fixture => 
    fixture.team_h === teamId || fixture.team_a === teamId
  )
}

/**
 * Get all teams sorted alphabetically by name for use in selectors
 * @returns Array of teams sorted by name
 */
export function getTeamsSortedByName(): Team[] {
  return [...realTeams].sort((a, b) => a.name.localeCompare(b.name))
}