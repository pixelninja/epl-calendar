import { useState } from 'react'
import { DateGroup } from '@/components/DateGroup'
import { TimezoneModal } from '@/components/TimezoneModal'
import { AppHeader } from '@/components/layout/AppHeader'
import { useFixtures } from '@/hooks/useFixtures'
import { useSettings } from '@/contexts/SettingsContext'
import { cn } from '@/lib/utils'

function App() {
  const {
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
  } = useSettings()
  
  const [isTimezoneModalOpen, setIsTimezoneModalOpen] = useState(false)
  const { data: fixtures = [], isLoading, error } = useFixtures()

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
        <AppHeader state="loading" />
        <main className="flex items-center justify-center py-12" role="main">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader state="error" />
        <main className="p-4" role="main">
          <div className="text-center py-12">
            <p className="text-sm text-destructive font-medium">Error Loading Fixtures</p>
            <p className="text-xs text-muted-foreground mt-1">
              Unable to load data. Please try again.
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        state="normal"
        showScores={showScores}
        onScoresToggleChange={setShowScores}
        onTimezoneClick={() => setIsTimezoneModalOpen(true)}
        onNotificationsClick={() => {/* TODO: Add push notification logic */}}
        hidePreviousFixtures={hidePreviousFixtures}
      />

      {/* Navigation Bar */}
      <nav className="bg-white border-b border-border" role="navigation" aria-label="Main navigation">
        <div className="flex" role="tablist">
          <button
            onClick={() => setActiveTab('fixtures')}
            className={cn(
              'flex-1 py-3 text-sm font-medium transition-colors border-b-2',
              activeTab === 'fixtures' 
                ? 'text-primary border-primary' 
                : 'text-muted-foreground border-transparent hover:text-foreground'
            )}
            role="tab"
            aria-selected={activeTab === 'fixtures'}
            aria-controls="fixtures-panel"
            id="fixtures-tab"
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
            role="tab"
            aria-selected={activeTab === 'table'}
            aria-controls="table-panel"
            id="table-tab"
          >
            Table
          </button>
        </div>
      </nav>

      <main role="main">
        {activeTab === 'fixtures' ? (
          <section 
            className="bg-background" 
            role="tabpanel" 
            id="fixtures-panel" 
            aria-labelledby="fixtures-tab"
          >
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
          </section>
        ) : (
          <section 
            className="p-4" 
            role="tabpanel" 
            id="table-panel" 
            aria-labelledby="table-tab"
          >
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">League table coming soon...</p>
            </div>
          </section>
        )}
      </main>


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
