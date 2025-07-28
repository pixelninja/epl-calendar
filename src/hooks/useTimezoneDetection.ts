import { useState, useCallback } from 'react'

interface TimezoneDetectionResult {
  isDetecting: boolean
  detectedTimezone: string | null
  error: string | null
}

interface UseTimezoneDetectionReturn {
  detect: () => Promise<void>
  result: TimezoneDetectionResult
  clearResult: () => void
}

/**
 * Custom hook for timezone detection using geolocation and browser APIs
 * Provides loading state, error handling, and fallback mechanisms
 */
export function useTimezoneDetection(): UseTimezoneDetectionReturn {
  const [result, setResult] = useState<TimezoneDetectionResult>({
    isDetecting: false,
    detectedTimezone: null,
    error: null
  })

  const detect = useCallback(async () => {
    setResult(prev => ({
      ...prev,
      isDetecting: true,
      error: null
    }))

    try {
      // Try browser timezone first as it's most reliable
      const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      
      // If geolocation is available, try to get position for enhanced accuracy
      if (navigator.geolocation) {
        return new Promise<void>((resolve) => {
          const timeoutId = setTimeout(() => {
            // Fallback to browser timezone after 3 seconds
            setResult({
              isDetecting: false,
              detectedTimezone: browserTimezone,
              error: null
            })
            resolve()
          }, 3000)

          navigator.geolocation.getCurrentPosition(
            () => {
              // Even with successful geolocation, we use browser timezone
              // as geolocation doesn't directly provide timezone info
              clearTimeout(timeoutId)
              setResult({
                isDetecting: false,
                detectedTimezone: browserTimezone,
                error: null
              })
              resolve()
            },
            (error) => {
              // Geolocation failed, use browser timezone
              clearTimeout(timeoutId)
              setResult({
                isDetecting: false,
                detectedTimezone: browserTimezone,
                error: error.code === error.PERMISSION_DENIED 
                  ? 'Location access denied. Using browser timezone.' 
                  : null
              })
              resolve()
            },
            {
              timeout: 3000,
              enableHighAccuracy: false
            }
          )
        })
      } else {
        // No geolocation support, use browser timezone
        setResult({
          isDetecting: false,
          detectedTimezone: browserTimezone,
          error: null
        })
      }
    } catch {
      // Final fallback
      const fallbackTimezone = 'UTC'
      setResult({
        isDetecting: false,
        detectedTimezone: fallbackTimezone,
        error: 'Unable to detect timezone. Using UTC as fallback.'
      })
    }
  }, [])

  const clearResult = useCallback(() => {
    setResult({
      isDetecting: false,
      detectedTimezone: null,
      error: null
    })
  }, [])

  return {
    detect,
    result,
    clearResult
  }
}