import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useScreenReader } from '@/hooks/useScreenReader'
import { ScreenReaderAnnouncements } from '@/components/ui/ScreenReaderAnnouncements'

type ScreenReaderContextType = ReturnType<typeof useScreenReader>

const ScreenReaderContext = createContext<ScreenReaderContextType | null>(null)

interface ScreenReaderProviderProps {
  children: ReactNode
}

/**
 * Screen reader context provider
 * Provides screen reader announcement functionality throughout the app
 */
export function ScreenReaderProvider({ children }: ScreenReaderProviderProps) {
  const screenReader = useScreenReader()

  return (
    <ScreenReaderContext.Provider value={screenReader}>
      {children}
      <ScreenReaderAnnouncements />
    </ScreenReaderContext.Provider>
  )
}

/**
 * Hook to access screen reader functionality
 * Must be used within ScreenReaderProvider
 */
export function useScreenReaderContext(): ScreenReaderContextType {
  const context = useContext(ScreenReaderContext)
  if (!context) {
    throw new Error('useScreenReaderContext must be used within a ScreenReaderProvider')
  }
  return context
}