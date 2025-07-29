import { useState, useCallback, useEffect } from 'react'
import { DateGroup } from '@/components/DateGroup'
import { TimezoneModal } from '@/components/TimezoneModal'
import { AppHeader } from '@/components/layout/AppHeader'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { FixturesLoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { useFixtures } from '@/hooks/useFixtures'
import { useFilteredFixtures } from '@/hooks/useFilteredFixtures'
import { useFixtureGrouping } from '@/hooks/useFixtureGrouping'
import { useSettings } from '@/contexts/SettingsContext'
import { useScreenReaderContext } from '@/contexts/ScreenReaderContext'
import { cn } from '@/lib/utils'

function App() {
  const {
    activeTab,
    showScores,
    selectedTimezone,
    timeFormat,
    hidePreviousFixtures,
    favoriteTeamId,
    setActiveTab,
    setShowScores,
    setSelectedTimezone,
    setTimeFormat,
    setHidePreviousFixtures,
    setFavoriteTeamId,
  } = useSettings()
  
  const [isTimezoneModalOpen, setIsTimezoneModalOpen] = useState(false)
  const { data: fixtures = [], isLoading, error } = useFixtures()
  const { announceLoading, announceError, announceSuccess } = useScreenReaderContext()

  // Use custom hooks for fixture processing
  const filteredFixtures = useFilteredFixtures(fixtures, hidePreviousFixtures)
  const { fixturesByDate, sortedDates, nextFixture, nextFixtureDate } = useFixtureGrouping(filteredFixtures)
  
  const today = new Date().toDateString()

  // Memoize tab switching functions to prevent unnecessary re-renders
  const handleFixturesTab = useCallback(() => setActiveTab('fixtures'), [setActiveTab])
  const handleTableTab = useCallback(() => setActiveTab('table'), [setActiveTab])

  // Screen reader announcements for app state changes
  useEffect(() => {
    if (isLoading) {
      announceLoading('Loading EPL fixtures and scores')
    }
  }, [isLoading, announceLoading])

  useEffect(() => {
    if (error) {
      announceError('Failed to load fixtures. Please check your connection and try again.')
    }
  }, [error, announceError])

  useEffect(() => {
    if (fixtures.length > 0 && !isLoading && !error) {
      announceSuccess(`${fixtures.length} fixtures loaded successfully`)
    }
  }, [fixtures.length, isLoading, error, announceSuccess])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader state="loading" />
        <nav className="bg-white border-b border-border" role="navigation" aria-label="Main navigation">
          <div className="flex" role="tablist">
            <div className="flex-1 py-3 text-sm font-medium text-primary border-b-2 border-primary text-center">
              Fixtures
            </div>
            <div className="flex-1 py-3 text-sm font-medium text-muted-foreground border-b-2 border-transparent text-center">
              Table
            </div>
          </div>
        </nav>
        <main role="main">
          <FixturesLoadingSkeleton />
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
            onClick={handleFixturesTab}
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
            onClick={handleTableTab}
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
        {/* Fixtures Tab */}
        <ErrorBoundary>
          <section 
            className={cn(
              "bg-background pb-14",
              activeTab === 'fixtures' ? 'block' : 'hidden'
            )}
            role="tabpanel" 
            id="fixtures-panel" 
            aria-labelledby="fixtures-tab"
            aria-hidden={activeTab !== 'fixtures'}
          >
            {sortedDates.length > 0 ? (
              sortedDates.map((date, index) => {
                const dateFixtures = fixturesByDate[date]
                const isToday = date === today
                const isPast = new Date(date) < new Date(today)
                const isNextFixtureDate = date === nextFixtureDate
                
                return (
                  <ErrorBoundary key={date}>
                    <DateGroup
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
                      favoriteTeamId={favoriteTeamId}
                    />
                  </ErrorBoundary>
                )
              })
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">No fixtures available</p>
              </div>
            )}
          </section>
        </ErrorBoundary>

        {/* Table Tab */}
        <ErrorBoundary>
          <section 
            className={cn(
              "p-4 pb-14",
              activeTab === 'table' ? 'block' : 'hidden'
            )}
            role="tabpanel" 
            id="table-panel" 
            aria-labelledby="table-tab"
            aria-hidden={activeTab !== 'table'}
          >
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">League table coming soon...</p>
            </div>
          </section>
        </ErrorBoundary>
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
        favoriteTeamId={favoriteTeamId}
        onFavoriteTeamChange={setFavoriteTeamId}
      />
    </div>
  )
}

export default App
