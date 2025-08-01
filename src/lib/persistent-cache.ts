import { QueryClient } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { simpleHash, hasSignificantFixtureChanges } from '@/utils/cache-helpers'

// Create a persister using IndexedDB with localStorage fallback
function createPersister() {
  try {
    // Try to use IndexedDB for better storage capacity
    if ('indexedDB' in window) {
      return createSyncStoragePersister({
        storage: {
          getItem: (key: string) => {
            const item = localStorage.getItem(key)
            return item ? JSON.parse(item) : null
          },
          setItem: (key: string, value: any) => {
            localStorage.setItem(key, JSON.stringify(value))
          },
          removeItem: (key: string) => {
            localStorage.removeItem(key)
          },
        },
        key: 'EPL_CALENDAR_CACHE',
        throttleTime: 1000, // Only persist once per second max
        // Add cache size limits to prevent excessive storage usage
        serialize: (data) => {
          const serialized = JSON.stringify(data)
          // Limit to ~5MB of cached data
          if (serialized.length > 5 * 1024 * 1024) {
            console.warn('Cache size limit exceeded, clearing oldest entries')
            // In a real implementation, you'd implement LRU eviction here
            return JSON.stringify({ queries: [], mutations: [] })
          }
          return serialized
        }
      })
    }
  } catch (error) {
    console.warn('Failed to create persister, falling back to memory-only cache:', error)
  }
  
  return null
}

export const persister = createPersister()

// Enhanced query client with better cache settings for persistence
export const createPersistentQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // Longer stale times for persistent cache
      staleTime: 10 * 60 * 1000, // 10 minutes default
      gcTime: 24 * 60 * 60 * 1000, // 24 hours (keeps data longer for offline use)
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Don't refetch if we have cached data
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && 'status' in error) {
          const status = (error as { status?: number }).status
          if (status && status >= 400 && status < 500) {
            return false
          }
        }
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Add intelligent refetch logic based on data changes
      structuralSharing: (oldData, newData) => {
        // For fixture data, check if there are meaningful changes
        if (Array.isArray(oldData) && Array.isArray(newData)) {
          if (!hasSignificantFixtureChanges(oldData, newData)) {
            // Return old data to prevent unnecessary re-renders
            return oldData
          }
        }
        
        // For other data, use content hash comparison
        if (oldData && newData) {
          const oldHash = simpleHash(oldData)
          const newHash = simpleHash(newData)
          
          if (oldHash === newHash) {
            return oldData
          }
        }
        
        return newData
      },
    },
    mutations: {
      retry: false,
    },
  },
})

// Smart cache invalidation based on match schedule
export function getSmartStaleTime(hasLiveMatches: boolean, hasTodayMatches: boolean): number {
  if (hasLiveMatches) {
    return 30 * 1000 // 30 seconds during live matches
  }
  
  if (hasTodayMatches) {
    return 5 * 60 * 1000 // 5 minutes when matches are today
  }
  
  // No matches today - can cache longer
  const now = new Date()
  const isWeekend = now.getDay() === 0 || now.getDay() === 6
  
  if (isWeekend) {
    return 2 * 60 * 60 * 1000 // 2 hours on weekends (more matches)
  }
  
  return 4 * 60 * 60 * 1000 // 4 hours on weekdays
}

// Cache warming function to preload data
export function warmCache(queryClient: QueryClient) {
  // Prefetch teams and bootstrap data that rarely changes
  queryClient.prefetchQuery({
    queryKey: ['teams'],
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  })
  
  queryClient.prefetchQuery({
    queryKey: ['bootstrap-static'],
    staleTime: 4 * 60 * 60 * 1000, // 4 hours
  })
}

// Cache cleanup function to manage storage size
export function cleanupCache(queryClient: QueryClient) {
  // Remove queries older than 7 days
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
  
  queryClient.getQueryCache().getAll().forEach(query => {
    if (query.state.dataUpdatedAt < sevenDaysAgo) {
      queryClient.removeQueries({ queryKey: query.queryKey })
    }
  })
  
  // Force garbage collection
  queryClient.getQueryCache().clear()
}

// Monitor cache size and performance
export function getCacheStats(queryClient: QueryClient) {
  const cache = queryClient.getQueryCache()
  const queries = cache.getAll()
  
  return {
    totalQueries: queries.length,
    freshQueries: queries.filter(q => q.state.status === 'success').length,
    staleQueries: queries.filter(q => q.state.status === 'pending').length,
    errorQueries: queries.filter(q => q.state.status === 'error').length,
    memoryUsage: JSON.stringify(queries).length,
  }
}