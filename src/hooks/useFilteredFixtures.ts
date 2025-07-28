import { useMemo } from 'react'
import type { ProcessedFixture } from '@/types/api'
import { filterFixtures } from '@/utils/fixtures'

/**
 * Custom hook to filter fixtures based on user preferences
 * @param fixtures - All fixtures from API
 * @param hidePreviousFixtures - Whether to hide fixtures from previous days
 * @returns Filtered fixtures array
 */
export function useFilteredFixtures(
  fixtures: ProcessedFixture[], 
  hidePreviousFixtures: boolean
): ProcessedFixture[] {
  return useMemo(() => {
    return filterFixtures(fixtures, hidePreviousFixtures)
  }, [fixtures, hidePreviousFixtures])
}