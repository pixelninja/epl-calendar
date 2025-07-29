import { useState, useCallback, useEffect } from 'react'
import { DateGroup } from '@/components/DateGroup'
import { TimezoneModal } from '@/components/TimezoneModal'
import { NotificationsModal } from '@/components/NotificationsModal'
import { AppHeader } from '@/components/layout/AppHeader'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { FixturesLoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { useFixtures } from '@/hooks/useFixtures'
import { useFilteredFixtures } from '@/hooks/useFilteredFixtures'
import { useFixtureGrouping } from '@/hooks/useFixtureGrouping'
import { useNotificationScheduler } from '@/hooks/useNotificationScheduler'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import { useSettings } from '@/contexts/SettingsContext'
import { useScreenReaderContext } from '@/contexts/ScreenReaderContext'
import { hapticTap } from '@/utils/haptics'
import { cn } from '@/lib/utils'

function App() {
  const {
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
  } = useSettings()
  
  const [isTimezoneModalOpen, setIsTimezoneModalOpen] = useState(false)
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false)
  const { data: fixtures = [], isLoading, error, refetch } = useFixtures()
  const { announceLoading, announceError, announceSuccess } = useScreenReaderContext()

  // Use custom hooks for fixture processing
  const filteredFixtures = useFilteredFixtures(fixtures, hidePreviousFixtures)
  const { fixturesByDate, sortedDates, nextFixture, nextFixtureDate } = useFixtureGrouping(filteredFixtures)
  
  // Schedule smart notifications
  useNotificationScheduler({
    fixtures,
    favoriteTeamId,
    notificationSettings,
    timezone: selectedTimezone
  })

  // Pull to refresh functionality
  const { containerRef, isPulling, pullDistance, isRefreshing } = usePullToRefresh({
    onRefresh: async () => {
      try {
        if (refetch) {
          await refetch()
          announceSuccess('Fixtures refreshed')
        }
      } catch (error) {
        announceError('Failed to refresh fixtures')
        console.error('Refresh error:', error)
      }
    },
    enabled: activeTab === 'fixtures' && !isLoading && !!refetch
  })
  
  const today = new Date().toDateString()

  // Memoize tab switching functions to prevent unnecessary re-renders
  const handleFixturesTab = useCallback(() => {
    hapticTap()
    setActiveTab('fixtures')
  }, [setActiveTab])
  
  const handleTableTab = useCallback(() => {
    hapticTap()
    setActiveTab('table')
  }, [setActiveTab])

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
        onNotificationsClick={() => setIsNotificationsModalOpen(true)}
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
            ref={containerRef as React.RefObject<HTMLElement>}
            className={cn(
              "bg-background pb-14 relative",
              activeTab === 'fixtures' ? 'block' : 'hidden'
            )}
            role="tabpanel" 
            id="fixtures-panel" 
            aria-labelledby="fixtures-tab"
            aria-hidden={activeTab !== 'fixtures'}
          >
            {/* Pull to refresh indicator */}
            {(isPulling || isRefreshing) && (
              <div 
                className="absolute top-0 left-0 right-0 flex items-center justify-center bg-primary/10 transition-all duration-200"
                style={{ 
                  height: `${Math.max(pullDistance, isRefreshing ? 60 : 0)}px`,
                  transform: `translateY(-${Math.max(pullDistance, isRefreshing ? 60 : 0)}px)`
                }}
              >
                <div className="flex items-center gap-2 text-primary">
                  {isRefreshing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm font-medium">Refreshing...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 border-2 border-primary rounded-full opacity-60" />
                      <span className="text-sm font-medium opacity-60">Pull to refresh</span>
                    </>
                  )}
                </div>
              </div>
            )}
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
      
      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notificationSettings={notificationSettings}
        onNotificationSettingsChange={setNotificationSettings}
      />

      {/* PWA Install Prompt - automatically handles its own visibility */}
      <PWAInstallPrompt />
    </div>
  )
}

export default App
