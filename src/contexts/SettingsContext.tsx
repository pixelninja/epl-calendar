import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { getUserTimezone } from '@/utils/timezone'

export interface NotificationSettings {
  dailyReminders: boolean
  tomorrowGamesTime: string // "20:00"
  todayGamesTime: string // "09:00"
  favoriteTeamReminders: boolean
  advanceNotice: 'day-before' | 'same-day' | 'both'
  kickoffReminders: boolean
}

interface SettingsContextType {
  // Settings state
  activeTab: 'fixtures' | 'table'
  showScores: boolean
  selectedTimezone: string
  timeFormat: '12h' | '24h'
  hidePreviousFixtures: boolean
  favoriteTeamId: number | null
  notificationSettings: NotificationSettings
  
  // Settings setters
  setActiveTab: (tab: 'fixtures' | 'table') => void
  setShowScores: (show: boolean) => void
  setSelectedTimezone: (timezone: string) => void
  setTimeFormat: (format: '12h' | '24h') => void
  setHidePreviousFixtures: (hide: boolean) => void
  setFavoriteTeamId: (teamId: number | null) => void
  setNotificationSettings: (settings: NotificationSettings) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

interface SettingsProviderProps {
  children: ReactNode
}

const defaultNotificationSettings: NotificationSettings = {
  dailyReminders: true,
  tomorrowGamesTime: '20:00',
  todayGamesTime: '09:00',
  favoriteTeamReminders: true,
  advanceNotice: 'both',
  kickoffReminders: true
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [activeTab, setActiveTab] = useLocalStorage<'fixtures' | 'table'>('epl-calendar-active-tab', 'fixtures')
  const [showScores, setShowScores] = useLocalStorage<boolean>('epl-calendar-show-scores', false)
  const [selectedTimezone, setSelectedTimezone] = useLocalStorage<string>('epl-calendar-timezone', getUserTimezone())
  const [timeFormat, setTimeFormat] = useLocalStorage<'12h' | '24h'>('epl-calendar-time-format', '24h')
  const [hidePreviousFixtures, setHidePreviousFixtures] = useLocalStorage<boolean>('epl-calendar-hide-previous', false)
  const [favoriteTeamId, setFavoriteTeamId] = useLocalStorage<number | null>('epl-calendar-favorite-team', null)
  const [notificationSettings, setNotificationSettings] = useLocalStorage<NotificationSettings>('epl-calendar-notifications', defaultNotificationSettings)

  return (
    <SettingsContext.Provider
      value={{
        activeTab,
        showScores,
        selectedTimezone,
        timeFormat,
        hidePreviousFixtures,
        favoriteTeamId,
        notificationSettings,
        setActiveTab,
        setShowScores,
        setSelectedTimezone,
        setTimeFormat,
        setHidePreviousFixtures,
        setFavoriteTeamId,
        setNotificationSettings,
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