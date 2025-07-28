import { createContext, useContext, ReactNode } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { getUserTimezone } from '@/utils/timezone'

interface SettingsContextType {
  // Settings state
  activeTab: 'fixtures' | 'table'
  showScores: boolean
  selectedTimezone: string
  timeFormat: '12h' | '24h'
  hidePreviousFixtures: boolean
  
  // Settings setters
  setActiveTab: (tab: 'fixtures' | 'table') => void
  setShowScores: (show: boolean) => void
  setSelectedTimezone: (timezone: string) => void
  setTimeFormat: (format: '12h' | '24h') => void
  setHidePreviousFixtures: (hide: boolean) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

interface SettingsProviderProps {
  children: ReactNode
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [activeTab, setActiveTab] = useLocalStorage<'fixtures' | 'table'>('epl-calendar-active-tab', 'fixtures')
  const [showScores, setShowScores] = useLocalStorage<boolean>('epl-calendar-show-scores', false)
  const [selectedTimezone, setSelectedTimezone] = useLocalStorage<string>('epl-calendar-timezone', getUserTimezone())
  const [timeFormat, setTimeFormat] = useLocalStorage<'12h' | '24h'>('epl-calendar-time-format', '24h')
  const [hidePreviousFixtures, setHidePreviousFixtures] = useLocalStorage<boolean>('epl-calendar-hide-previous', false)

  return (
    <SettingsContext.Provider
      value={{
        activeTab,
        showScores,
        selectedTimezone,
        timeFormat,
        hidePreviousFixtures,
        setActiveTab,
        setShowScores,
        setSelectedTimezone,
        setTimeFormat,
        setHidePreviousFixtures,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}