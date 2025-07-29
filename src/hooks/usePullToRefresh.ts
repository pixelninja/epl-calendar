import { useEffect, useRef, useState } from 'react'

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void> | void
  threshold?: number
  maxPullDistance?: number
  enabled?: boolean
}

export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxPullDistance = 150,
  enabled = true
}: UsePullToRefreshOptions) {
  const containerRef = useRef<HTMLElement>(null)
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const touchStartY = useRef(0)
  const currentPullDistance = useRef(0)

  useEffect(() => {
    if (!enabled) return

    const container = containerRef.current
    if (!container) return

    let isAtTop = false

    const handleTouchStart = (e: TouchEvent) => {
      // Only trigger if we're at the top of the page
      isAtTop = window.scrollY === 0
      if (isAtTop) {
        touchStartY.current = e.touches[0].clientY
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isAtTop || isRefreshing) return

      const currentY = e.touches[0].clientY
      const deltaY = currentY - touchStartY.current

      if (deltaY > 0) {
        // Pulling down
        e.preventDefault()
        
        // Calculate pull distance with diminishing returns
        const rawDistance = Math.min(deltaY, maxPullDistance)
        const easedDistance = rawDistance * (1 - rawDistance / (maxPullDistance * 2))
        
        currentPullDistance.current = Math.max(0, easedDistance)
        setPullDistance(currentPullDistance.current)
        setIsPulling(currentPullDistance.current > 0)
      }
    }

    const handleTouchEnd = async () => {
      if (!isAtTop || isRefreshing) return

      if (currentPullDistance.current >= threshold) {
        setIsRefreshing(true)
        
        // Add haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate(50)
        }
        
        try {
          await onRefresh()
        } catch (error) {
          console.error('Pull to refresh failed:', error)
        } finally {
          setIsRefreshing(false)
        }
      }
      
      // Reset state
      setIsPulling(false)
      setPullDistance(0)
      currentPullDistance.current = 0
    }

    // Add event listeners
    container.addEventListener('touchstart', handleTouchStart, { passive: false })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [enabled, onRefresh, threshold, maxPullDistance, isRefreshing])

  return {
    containerRef,
    isPulling,
    pullDistance,
    isRefreshing,
    pullProgress: Math.min(pullDistance / threshold, 1)
  }
}