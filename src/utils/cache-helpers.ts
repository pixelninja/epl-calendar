/**
 * Simple hash function for data change detection
 */
export function simpleHash(data: unknown): string {
  const str = JSON.stringify(data, Object.keys(data as object).sort())
  let hash = 0
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return hash.toString(36)
}

/**
 * Check if fixture data has meaningful changes (ignoring timestamps)
 */
export function hasSignificantFixtureChanges(
  oldData: any[], 
  newData: any[]
): boolean {
  if (!oldData || !newData || oldData.length !== newData.length) {
    return true
  }
  
  // Compare key fields that matter for display
  for (let i = 0; i < oldData.length; i++) {
    const oldFixture = oldData[i]
    const newFixture = newData[i]
    
    if (!oldFixture || !newFixture) return true
    
    // Check significant fields that affect display
    const significantFields = [
      'id',
      'team_h',
      'team_a',
      'team_h_score',
      'team_a_score',
      'kickoff_time',
      'started',
      'finished',
      'minutes'
    ]
    
    for (const field of significantFields) {
      if (oldFixture[field] !== newFixture[field]) {
        return true
      }
    }
  }
  
  return false
}

/**
 * Create a cache key that includes data fingerprint
 */
export function createCacheKey(baseKey: string, data?: unknown): string {
  if (!data) return baseKey
  
  const hash = simpleHash(data)
  return `${baseKey}:${hash}`
}

/**
 * Check if cached data should be considered fresh based on content
 */
export function isDataFresh(
  cachedData: unknown,
  newData: unknown
): boolean {
  if (!cachedData) return false
  
  // If data is identical, consider it fresh regardless of age
  const cachedHash = simpleHash(cachedData)
  const newHash = simpleHash(newData)
  
  return cachedHash === newHash
}

/**
 * Intelligent cache invalidation - only invalidate if data actually changed
 */
export function shouldInvalidateCache(
  oldData: unknown,
  newData: unknown,
  timestamp: number,
  maxAge: number
): boolean {
  // Always invalidate if too old
  if (Date.now() - timestamp > maxAge) {
    return true
  }
  
  // Don't invalidate if data is identical
  if (isDataFresh(oldData, newData)) {
    return false
  }
  
  return true
}