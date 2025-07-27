import { useState, useEffect } from 'react'
import { DateGroup } from '@/components/DateGroup'
import { TimezoneModal } from '@/components/TimezoneModal'
import { useFixtures } from '@/hooks/useFixtures'
import { getUserTimezone } from '@/utils/timezone'
import { Bell, Globe } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

// Helper functions for localStorage
const getStoredSetting = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  } catch {
    return defaultValue
  }
}

const storeSetting = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Silently fail if localStorage is not available
  }
}

function App() {
  const [activeTab, setActiveTab] = useState<'fixtures' | 'table'>(() => 
    getStoredSetting('epl-calendar-active-tab', 'fixtures')
  )
  const [showScores, setShowScores] = useState(() => 
    getStoredSetting('epl-calendar-show-scores', false)
  )
  const [selectedTimezone, setSelectedTimezone] = useState(() => 
    getStoredSetting('epl-calendar-timezone', getUserTimezone())
  )
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>(() => 
    getStoredSetting('epl-calendar-time-format', '24h')
  )
  const [hidePreviousFixtures, setHidePreviousFixtures] = useState(() => 
    getStoredSetting('epl-calendar-hide-previous', false)
  )
  const [isTimezoneModalOpen, setIsTimezoneModalOpen] = useState(false)
  
  const { data: fixtures = [], isLoading, error } = useFixtures()

  // Save settings to localStorage whenever they change
  useEffect(() => {
    storeSetting('epl-calendar-active-tab', activeTab)
  }, [activeTab])

  useEffect(() => {
    storeSetting('epl-calendar-show-scores', showScores)
  }, [showScores])

  useEffect(() => {
    storeSetting('epl-calendar-timezone', selectedTimezone)
  }, [selectedTimezone])

  useEffect(() => {
    storeSetting('epl-calendar-time-format', timeFormat)
  }, [timeFormat])

  useEffect(() => {
    storeSetting('epl-calendar-hide-previous', hidePreviousFixtures)
  }, [hidePreviousFixtures])

  // Filter fixtures based on hidePreviousFixtures setting
  const filteredFixtures = hidePreviousFixtures 
    ? fixtures.filter(fixture => new Date(fixture.kickoff_time) >= new Date(new Date().toDateString()))
    : fixtures

  // Group fixtures by date
  const fixturesByDate = filteredFixtures.reduce((acc, fixture) => {
    const date = new Date(fixture.kickoff_time).toDateString()
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(fixture)
    return acc
  }, {} as Record<string, typeof fixtures>)

  const sortedDates = Object.keys(fixturesByDate)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()) // Earliest first
  
  const today = new Date().toDateString()
  const now = new Date()
  
  // Find the next upcoming fixture (first future fixture)
  const nextFixture = filteredFixtures.find(fixture => 
    new Date(fixture.kickoff_time) > now && fixture.match_status.status === 'scheduled'
  )
  const nextFixtureDate = nextFixture ? new Date(nextFixture.kickoff_time).toDateString() : null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-white shadow-lg sticky top-0 z-40">
          <div className="px-4 py-4">
            <div>
              <img 
                src="/images/EPL-Logo-Alternative.svg" 
                alt="Premier League Logo" 
                className="h-12 w-auto brightness-0 invert"
              />
              <div className="mt-4">
                <h1 className="text-sm font-bold text-white">EPL Calendar</h1>
                <h2 className="text-xs text-white/80">2025/26 Season</h2>
              </div>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-white shadow-lg sticky top-0 z-40">
          <div className="px-4 py-4">
            <div>
              <img 
                src="/images/EPL-Logo-Alternative.svg" 
                alt="Premier League Logo" 
                className="h-12 w-auto brightness-0 invert"
              />
              <div className="mt-4">
                <h1 className="text-sm font-bold text-white">EPL Calendar</h1>
                <h2 className="text-xs text-white/80">2025/26 Season</h2>
              </div>
            </div>
          </div>
        </header>
        <div className="p-4">
          <div className="text-center py-12">
            <p className="text-sm text-destructive font-medium">Error Loading Fixtures</p>
            <p className="text-xs text-muted-foreground mt-1">
              Unable to load data. Please try again.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-white shadow-lg sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-stretch justify-between h-full">
            {/* Left: Logo and Title */}
            <div>
              <img 
                src="/images/EPL-Logo-Alternative.svg" 
                alt="Premier League Logo" 
                className="h-12 w-auto brightness-0 invert"
              />
              <div className="mt-4">
                <h1 className="text-sm font-bold text-white">EPL Calendar</h1>
                <h2 className="text-xs text-white/80">2025/26 Season</h2>
              </div>
            </div>

            {/* Right: Action Icons */}
            <div className="flex flex-col items-end justify-between mt-2">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="p-2 text-white hover:bg-white/10"
                  onClick={() => setIsTimezoneModalOpen(true)}
                >
                  <Globe className="h-5 w-5" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2 text-white hover:bg-white/10"
                  onClick={() => {/* TODO: Add push notification logic */}}
                >
                  <Bell className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Scores Toggle - only show if not hiding previous fixtures */}
              {!hidePreviousFixtures && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/80">Show Scores</span>
                  <Switch
                    checked={showScores}
                    onCheckedChange={setShowScores}
                    className="scale-75 data-[state=unchecked]:bg-white/20 data-[state=checked]:bg-secondary"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-white border-b border-border">
        <div className="flex">
          <button
            onClick={() => setActiveTab('fixtures')}
            className={cn(
              'flex-1 py-3 text-sm font-medium transition-colors border-b-2',
              activeTab === 'fixtures' 
                ? 'text-primary border-primary' 
                : 'text-muted-foreground border-transparent hover:text-foreground'
            )}
          >
            Fixtures
          </button>
          
          <button
            onClick={() => setActiveTab('table')}
            className={cn(
              'flex-1 py-3 text-sm font-medium transition-colors border-b-2',
              activeTab === 'table' 
                ? 'text-primary border-primary' 
                : 'text-muted-foreground border-transparent hover:text-foreground'
            )}
          >
            Table
          </button>
        </div>
      </nav>

      {activeTab === 'fixtures' ? (
        <div className="bg-background">
          {sortedDates.length > 0 ? (
            sortedDates.map((date, index) => {
              const dateFixtures = fixturesByDate[date]
              const isToday = date === today
              const isPast = new Date(date) < new Date(today)
              const isNextFixtureDate = date === nextFixtureDate
              
              return (
                <DateGroup
                  key={date}
                  date={date}
                  fixtures={dateFixtures}
                  showScores={showScores}
                  timezone={selectedTimezone}
                  timeFormat={timeFormat}
                  isToday={isToday}
                  isPast={isPast}
                  isNextFixtureDate={isNextFixtureDate}
                  nextFixtureId={nextFixture?.id}
                  isEvenRow={index % 2 === 0}
                />
              )
            })
          ) : (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">No fixtures available</p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4">
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">League table coming soon...</p>
          </div>
        </div>
      )}


      <TimezoneModal
        isOpen={isTimezoneModalOpen}
        onClose={() => setIsTimezoneModalOpen(false)}
        currentTimezone={selectedTimezone}
        onTimezoneChange={setSelectedTimezone}
        timeFormat={timeFormat}
        onTimeFormatChange={setTimeFormat}
        hidePreviousFixtures={hidePreviousFixtures}
        onHidePreviousChange={setHidePreviousFixtures}
      />
    </div>
  )
}

export default App
