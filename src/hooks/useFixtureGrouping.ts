import { useMemo } from 'react'
import type { ProcessedFixture } from '@/types/api'
import { groupFixturesByDate, sortDateStrings, findNextFixture } from '@/utils/fixtures'

interface FixtureGroupingResult {
  fixturesByDate: Record<string, ProcessedFixture[]>
  sortedDates: string[]
  nextFixture: ProcessedFixture | null
  nextFixtureDate: string | null
}

/**
 * Custom hook to group and organize fixtures for display
 * @param fixtures - Filtered fixtures array
 * @returns Organized fixture data for rendering
 */
export function useFixtureGrouping(fixtures: ProcessedFixture[]): FixtureGroupingResult {
  return useMemo(() => {
    const fixturesByDate = groupFixturesByDate(fixtures)
    const sortedDates = sortDateStrings(Object.keys(fixturesByDate))
    const nextFixture = findNextFixture(fixtures)
    const nextFixtureDate = nextFixture ? new Date(nextFixture.kickoff_time).toDateString() : null

    return {
      fixturesByDate,
      sortedDates,
      nextFixture,
      nextFixtureDate
    }
  }, [fixtures])
}