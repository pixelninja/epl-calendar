/**
 * BulkCalendarButton component for downloading multiple fixtures as a single .ics file
 * Provides options for different bulk download scenarios with smart filtering
 */

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Calendar, Download } from '@/components/icons'
import {
  downloadBulkCalendarEvents,
  createBulkCalendarEvents,
  filterFixturesForBulk,
  getFixturesForNextDays,
  getFavoriteTeamFixtures,
  generateBulkCalendarFilename,
  getFixturesForDate
} from '@/utils/calendar'
import { getTeamById } from '@/utils/teamHelpers'
import type { ProcessedFixture } from '@/types/api'

interface BulkCalendarButtonProps {
  fixtures: ProcessedFixture[]
  timezone: string
  favoriteTeamId?: number | null
  className?: string
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'ghost' | 'outline' | 'secondary'
  // Optional props for context-specific bulk operations
  dateContext?: string // For date-specific bulk downloads
  showDateOption?: boolean
  showFavoriteTeamOption?: boolean
  showAllRemainingOption?: boolean
}

export function BulkCalendarButton({
  fixtures,
  timezone,
  favoriteTeamId,
  className = '',
  size = 'sm',
  variant = 'ghost',
  dateContext,
  showDateOption = true,
  showFavoriteTeamOption = true,
  showAllRemainingOption = true
}: BulkCalendarButtonProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const favoriteTeam = favoriteTeamId ? getTeamById(favoriteTeamId) : null

  // Convert ProcessedFixture to CalendarFixture format (memoized)
  const convertToCalendarFixture = useMemo(() => 
    (fixture: ProcessedFixture) => ({
      id: fixture.id,
      team_h: fixture.team_h,
      team_a: fixture.team_a,
      team_h_score: fixture.team_h_score,
      team_a_score: fixture.team_a_score,
      kickoff_time: fixture.kickoff_time,
      started: fixture.started,
      finished: fixture.finished,
      provisional_start_time: fixture.provisional_start_time
    }), []
  )

  // Memoized calendar fixtures conversion
  const calendarFixtures = useMemo(() => 
    fixtures.map(convertToCalendarFixture), 
    [fixtures, convertToCalendarFixture]
  )

  // Memoized date fixtures count for display
  const dateFixturesCount = useMemo(() => {
    if (!dateContext) return 0
    const dateFixtures = getFixturesForDate(calendarFixtures, dateContext)
    return filterFixturesForBulk(dateFixtures, { includeFinished: false }).length
  }, [calendarFixtures, dateContext])

  // Memoized next 30 days count
  const next30DaysCount = useMemo(() => {
    const next30DaysFixtures = getFixturesForNextDays(calendarFixtures, 30)
    return next30DaysFixtures.length
  }, [calendarFixtures])

  // Memoized favorite team fixtures count
  const favoriteTeamCount = useMemo(() => {
    if (!favoriteTeamId) return 0
    const teamFixtures = getFavoriteTeamFixtures(calendarFixtures, favoriteTeamId, false)
    return teamFixtures.length
  }, [calendarFixtures, favoriteTeamId])

  // Memoized all remaining fixtures count
  const allRemainingCount = useMemo(() => {
    const remainingFixtures = filterFixturesForBulk(calendarFixtures, { 
      includeFinished: false,
      maxFixtures: 100
    })
    return remainingFixtures.length
  }, [calendarFixtures])

  const handleBulkDownload = async (
    targetFixtures: ProcessedFixture[],
    filename: string,
    operationId: string
  ) => {
    setIsLoading(operationId)
    try {
      if (targetFixtures.length === 0) {
        console.warn('No fixtures available for bulk download')
        return
      }

      const calendarFixtures = targetFixtures.map(convertToCalendarFixture)
      const getTeamByIdWrapper = (id: number) => getTeamById(id) || undefined
      const events = createBulkCalendarEvents(calendarFixtures, getTeamByIdWrapper, timezone)
      
      if (events.length === 0) {
        console.warn('No valid events created for bulk download')
        return
      }

      downloadBulkCalendarEvents(events, filename, timezone)
    } catch (error) {
      console.error('Failed to download bulk calendar:', error)
      alert('Failed to download calendar events. Please try again.')
    } finally {
      setIsLoading(null)
    }
  }

  const handleDateFixtures = () => {
    if (!dateContext) return
    
    const dateFixtures = getFixturesForDate(calendarFixtures, dateContext)
    const upcomingDateFixtures = filterFixturesForBulk(dateFixtures, { includeFinished: false })
    
    const dateLabel = new Date(dateContext).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
    
    const filename = generateBulkCalendarFilename(upcomingDateFixtures, {
      type: 'date',
      dateLabel: dateLabel.replace(/[^a-z0-9]/gi, '-')
    })
    
    // Convert back to ProcessedFixture for handleBulkDownload
    const processedUpcomingFixtures = fixtures.filter(f => 
      upcomingDateFixtures.some(cf => cf.id === f.id)
    )
    
    handleBulkDownload(processedUpcomingFixtures, filename, 'date')
  }

  const handleNext30Days = () => {
    const next30DaysFixtures = getFixturesForNextDays(calendarFixtures, 30)
    const filename = generateBulkCalendarFilename(next30DaysFixtures, {
      type: 'range'
    })
    
    // Convert back to ProcessedFixture for handleBulkDownload
    const processedNext30Fixtures = fixtures.filter(f => 
      next30DaysFixtures.some(cf => cf.id === f.id)
    )
    
    handleBulkDownload(processedNext30Fixtures, filename, 'next30')
  }

  const handleFavoriteTeamFixtures = () => {
    if (!favoriteTeamId || !favoriteTeam) return
    
    const teamFixtures = getFavoriteTeamFixtures(calendarFixtures, favoriteTeamId, false)
    const filename = generateBulkCalendarFilename(teamFixtures, {
      type: 'team',
      teamName: favoriteTeam.name
    })
    
    // Convert back to ProcessedFixture for handleBulkDownload
    const processedTeamFixtures = fixtures.filter(f => 
      teamFixtures.some(cf => cf.id === f.id)
    )
    
    handleBulkDownload(processedTeamFixtures, filename, 'favorite')
  }

  const handleAllRemainingFixtures = () => {
    const remainingFixtures = filterFixturesForBulk(calendarFixtures, { 
      includeFinished: false,
      maxFixtures: 100 // Reasonable limit to prevent huge downloads
    })
    const filename = generateBulkCalendarFilename(remainingFixtures, {
      type: 'all'
    })
    
    // Convert back to ProcessedFixture for handleBulkDownload
    const processedRemainingFixtures = fixtures.filter(f => 
      remainingFixtures.some(cf => cf.id === f.id)
    )
    
    handleBulkDownload(processedRemainingFixtures, filename, 'all')
  }

  // Don't show if no bulk options are available
  const hasAnyOptions = (showDateOption && dateFixturesCount > 0) ||
                       (next30DaysCount > 0) ||
                       (showFavoriteTeamOption && favoriteTeamCount > 0) ||
                       (showAllRemainingOption && allRemainingCount > 0)

  if (!hasAnyOptions) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={`${className} text-muted-foreground hover:text-foreground transition-colors`}
          aria-label="Bulk calendar download options"
          disabled={isLoading !== null}
        >
          <Calendar className="h-4 w-4 mr-1" />
          <Download className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        {showDateOption && dateContext && dateFixturesCount > 0 && (
          <DropdownMenuItem 
            onClick={handleDateFixtures}
            disabled={isLoading === 'date'}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <div className="flex flex-col">
              <span>This Date ({dateFixturesCount} matches)</span>
              <span className="text-xs text-muted-foreground">
                {new Date(dateContext).toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short'
                })}
              </span>
            </div>
            {isLoading === 'date' && (
              <div className="ml-auto w-4 h-4 border-2 border-muted border-t-foreground rounded-full animate-spin" />
            )}
          </DropdownMenuItem>
        )}
        
        {next30DaysCount > 0 && (
          <DropdownMenuItem 
            onClick={handleNext30Days}
            disabled={isLoading === 'next30'}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <div className="flex flex-col">
              <span>Next 30 Days ({next30DaysCount} matches)</span>
              <span className="text-xs text-muted-foreground">Upcoming fixtures only</span>
            </div>
            {isLoading === 'next30' && (
              <div className="ml-auto w-4 h-4 border-2 border-muted border-t-foreground rounded-full animate-spin" />
            )}
          </DropdownMenuItem>
        )}
        
        {showFavoriteTeamOption && favoriteTeamId && favoriteTeam && favoriteTeamCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleFavoriteTeamFixtures}
              disabled={isLoading === 'favorite'}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <div className="flex flex-col">
                <span>{favoriteTeam.name} ({favoriteTeamCount} matches)</span>
                <span className="text-xs text-muted-foreground">All remaining fixtures</span>
              </div>
              {isLoading === 'favorite' && (
                <div className="ml-auto w-4 h-4 border-2 border-muted border-t-foreground rounded-full animate-spin" />
              )}
            </DropdownMenuItem>
          </>
        )}
        
        {showAllRemainingOption && allRemainingCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleAllRemainingFixtures}
              disabled={isLoading === 'all'}
              className="flex items-center gap-2 cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <div className="flex flex-col">
                <span>All Remaining ({allRemainingCount} matches)</span>
                <span className="text-xs text-muted-foreground">
                  {allRemainingCount >= 100 ? 'Limited to 100 fixtures' : 'Full remaining season'}
                </span>
              </div>
              {isLoading === 'all' && (
                <div className="ml-auto w-4 h-4 border-2 border-muted border-t-foreground rounded-full animate-spin" />
              )}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}