import { useState, memo, useMemo } from 'react'
import { ChevronRight } from '@/components/icons'
import { CompactFixtureRow } from './CompactFixtureRow'
import { BulkCalendarButton } from './BulkCalendarButton'
import { TeamCrest } from './ui/TeamCrest'
import { useAccordionHeight } from '@/hooks/useAccordionHeight'
import { getTeamById, isTeamPlayingInFixtures } from '@/utils/teamHelpers'
import { cn } from '@/lib/utils'
import type { ProcessedFixture } from '@/types/api'

interface DateGroupProps {
  date: string
  fixtures: ProcessedFixture[]
  showScores?: boolean
  timezone?: string
  timeFormat?: '12h' | '24h'
  isToday?: boolean
  isPast?: boolean
  isNextFixtureDate?: boolean
  nextFixtureId?: number
  className?: string
  isEvenRow?: boolean
  favoriteTeamId?: number | null
  allFixtures?: ProcessedFixture[] // All fixtures for bulk calendar operations
}

function DateGroupComponent({
  date,
  fixtures,
  showScores = false,
  timezone = 'UTC',
  timeFormat = '24h',
  isToday = false,
  isPast = false,
  isNextFixtureDate = false,
  nextFixtureId,
  className,
  isEvenRow = false,
  favoriteTeamId = null,
  allFixtures = []
}: DateGroupProps) {
  // Expand today's matches by default, or if this date contains the next fixture
  const [isExpanded, setIsExpanded] = useState(isToday || isNextFixtureDate)
  
  // Use dynamic height calculation for smooth accordion animation
  const { contentRef, accordionStyles } = useAccordionHeight(isExpanded)
  
  const formatDateHeader = useMemo(() => {
    return (dateStr: string) => {
      const date = new Date(dateStr)
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)
      
      // Check if it's today
      if (date.toDateString() === today.toDateString()) {
        return 'Today'
      }
      
      // Check if it's tomorrow
      if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow'
      }
      
      // Format as day name and date
      return date.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      })
    }
  }, [])

  const allFinished = useMemo(() => 
    fixtures.every(f => f.match_status.status === 'finished'), 
    [fixtures]
  )

  const sortedFixtures = useMemo(() => 
    fixtures
      .slice()
      .sort((a, b) => new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime()),
    [fixtures]
  )

  // Check if favorite team is playing on this date
  const favoriteTeamIsPlaying = useMemo(() => 
    isTeamPlayingInFixtures(favoriteTeamId, fixtures),
    [favoriteTeamId, fixtures]
  )

  // Get favorite team details for display
  const favoriteTeam = useMemo(() => 
    getTeamById(favoriteTeamId),
    [favoriteTeamId]
  )

  return (
    <section className={cn(
      'border-b border-border/30',
      {
        'bg-white': isEvenRow,
        'bg-accent/10': !isEvenRow,
        'border-l-4 border-l-secondary': isNextFixtureDate && !isToday && !isPast
      },
      className
    )}>
      {/* Header with accordion button and bulk calendar button as siblings */}
      <div className={cn(
        'flex items-center justify-between',
        {
          'bg-primary/5': isToday && !isPast
        }
      )}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'flex-1 flex items-center justify-between px-4 py-4 transition-colors',
            {
              'hover:bg-muted/30': !isPast
            }
          )}
          aria-expanded={isExpanded}
          aria-controls={`fixtures-${date}`}
          aria-label={`${formatDateHeader(date)} fixtures, ${fixtures.length} matches`}
        >
          <div className="flex items-center gap-3">
            <h3 className={cn(
              'text-base font-semibold',
              {
                'text-primary': isToday && !isPast,
                'text-foreground': !isPast && !isToday,
                'text-muted-foreground line-through opacity-60': isPast && allFinished
              }
            )}>
              {formatDateHeader(date)}
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            {favoriteTeamIsPlaying && favoriteTeam && (
              <TeamCrest 
                teamShortName={favoriteTeam.short_name}
                teamFullName={favoriteTeam.name}
                size="sm"
                className="opacity-90 transition-opacity duration-200"
              />
            )}
            
            <ChevronRight className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              isExpanded && "rotate-90"
            )} />
          </div>
        </button>
        
        {/* Bulk Calendar Button for this date - outside the accordion button */}
        {!isPast && allFixtures.length > 0 && (
          <div className="px-2">
            <BulkCalendarButton
              fixtures={allFixtures}
              timezone={timezone}
              favoriteTeamId={favoriteTeamId}
              dateContext={date}
              showDateOption={true}
              showFavoriteTeamOption={false} // Don't show favorite team option per-date
              showAllRemainingOption={false} // Don't show all remaining option per-date
              size="sm"
              variant="ghost"
              className="opacity-70 hover:opacity-100"
            />
          </div>
        )}
      </div>

      <div 
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={accordionStyles}
        id={`fixtures-${date}`}
        role="region"
        aria-labelledby={`date-${date}`}
      >
        <div 
          ref={contentRef}
          className={cn(
            'bg-background',
            {
              'opacity-70': isPast && allFinished
            }
          )}
        >
          {sortedFixtures.map(fixture => (
            <article key={fixture.id}>
              <CompactFixtureRow
                fixture={fixture}
                showScores={showScores}
                timezone={timezone}
                timeFormat={timeFormat}
                isNextFixture={fixture.id === nextFixtureId}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// Memoize the component with custom comparison to prevent unnecessary re-renders
export const DateGroup = memo(DateGroupComponent, (prevProps, nextProps) => {
  // Only re-render if essential props change
  return (
    prevProps.date === nextProps.date &&
    prevProps.fixtures === nextProps.fixtures &&
    prevProps.showScores === nextProps.showScores &&
    prevProps.timezone === nextProps.timezone &&
    prevProps.timeFormat === nextProps.timeFormat &&
    prevProps.isToday === nextProps.isToday &&
    prevProps.isPast === nextProps.isPast &&
    prevProps.isNextFixtureDate === nextProps.isNextFixtureDate &&
    prevProps.nextFixtureId === nextProps.nextFixtureId &&
    prevProps.favoriteTeamId === nextProps.favoriteTeamId
    // Skip isEvenRow comparison as it's just styling and shouldn't cause re-renders
  )
})