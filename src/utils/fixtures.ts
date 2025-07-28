import type { ProcessedFixture } from '@/types/api'

/**
 * Groups fixtures by date string
 * @param fixtures - Array of fixtures to group
 * @returns Object with date strings as keys and fixture arrays as values
 */
export function groupFixturesByDate(fixtures: ProcessedFixture[]): Record<string, ProcessedFixture[]> {
  return fixtures.reduce((acc, fixture) => {
    const date = new Date(fixture.kickoff_time).toDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(fixture)
    return acc
  }, {} as Record<string, ProcessedFixture[]>)
}

/**
 * Filters fixtures based on hidePreviousFixtures setting
 * @param fixtures - Array of all fixtures
 * @param hidePreviousFixtures - Whether to hide previous fixtures
 * @returns Filtered array of fixtures
 */
export function filterFixtures(fixtures: ProcessedFixture[], hidePreviousFixtures: boolean): ProcessedFixture[] {
  if (!hidePreviousFixtures) {
    return fixtures
  }
  
  const todayStart = new Date(new Date().toDateString())
  return fixtures.filter(fixture => new Date(fixture.kickoff_time) >= todayStart)
}

/**
 * Finds the next upcoming fixture that hasn't started yet
 * @param fixtures - Array of fixtures to search
 * @returns Next fixture or null if none found
 */
export function findNextFixture(fixtures: ProcessedFixture[]): ProcessedFixture | null {
  const now = new Date()
  return fixtures.find(fixture => 
    new Date(fixture.kickoff_time) > now && fixture.match_status.status === 'scheduled'
  ) || null
}

/**
 * Sorts dates in chronological order (earliest first)
 * @param dates - Array of date strings
 * @returns Sorted array of date strings
 */
export function sortDateStrings(dates: string[]): string[] {
  return dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
}