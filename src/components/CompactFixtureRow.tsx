import { memo, useEffect, useRef } from 'react'
import { formatTimeInTimezone } from '@/utils/timezone'
import { cn } from '@/lib/utils'
import { TeamCrest } from '@/components/ui/TeamCrest'
import { useScreenReaderContext } from '@/contexts/ScreenReaderContext'
import type { ProcessedFixture } from '@/types/api'

interface CompactFixtureRowProps {
  fixture: ProcessedFixture
  showScores?: boolean
  timezone?: string
  timeFormat?: '12h' | '24h'
  isNextFixture?: boolean
}

function CompactFixtureRowComponent({ fixture, showScores = false, timezone = 'UTC', timeFormat = '24h', isNextFixture = false }: CompactFixtureRowProps) {
  const { announceScoreUpdate, announceMatchStatus } = useScreenReaderContext()
  const prevScoreRef = useRef<{ home: number | null, away: number | null } | null>(null)
  const prevStatusRef = useRef<string | null>(null)

  const kickoffTime = formatTimeInTimezone(fixture.kickoff_time, timezone, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: timeFormat === '12h'
  })

  // Announce score updates to screen readers
  useEffect(() => {
    const currentScore = { home: fixture.team_h_score, away: fixture.team_a_score }
    const hasScores = currentScore.home !== null && currentScore.away !== null
    
    if (hasScores && prevScoreRef.current) {
      const prevScore = prevScoreRef.current
      // Check if score actually changed
      if (prevScore.home !== currentScore.home || prevScore.away !== currentScore.away) {
        announceScoreUpdate(
          fixture.team_h_name,
          fixture.team_a_name,
          currentScore.home!,
          currentScore.away!
        )
      }
    }
    
    prevScoreRef.current = currentScore
  }, [fixture.team_h_score, fixture.team_a_score, fixture.team_h_name, fixture.team_a_name, announceScoreUpdate])

  // Announce match status changes
  useEffect(() => {
    const currentStatus = fixture.match_status.status
    
    if (prevStatusRef.current && prevStatusRef.current !== currentStatus) {
      announceMatchStatus(fixture.team_h_name, fixture.team_a_name, currentStatus)
    }
    
    prevStatusRef.current = currentStatus
  }, [fixture.match_status.status, fixture.team_h_name, fixture.team_a_name, announceMatchStatus])
  
  

  const getScore = () => {
    const hasScores = fixture.team_h_score !== null && fixture.team_a_score !== null
    
    if (!hasScores) {
      return null
    }
    
    // If showScores is false, show obfuscated scores
    if (!showScores) {
      return '• - •'
    }
    
    // Show actual scores
    return `${fixture.team_h_score}-${fixture.team_a_score}`
  }

  // Remove unused variables that were causing ESLint errors

  const statusText = fixture.match_status.status === 'live' ? 'Live match' : 
                     fixture.match_status.status === 'finished' ? 'Full time' : 
                     fixture.match_status.status === 'postponed' ? 'Postponed' : ''

  // Enhanced match description for screen readers
  const getMatchDescription = () => {
    const hasScores = fixture.team_h_score !== null && fixture.team_a_score !== null
    const score = getScore()
    
    if (hasScores && score) {
      const scoreText = showScores ? score : 'Score available but hidden'
      return `Match: ${fixture.team_h_name} versus ${fixture.team_a_name}. ${scoreText}. Status: ${statusText || 'Scheduled'}`
    }
    
    return `Upcoming match: ${fixture.team_h_name} versus ${fixture.team_a_name}. Kickoff time: ${kickoffTime}. ${statusText ? `Status: ${statusText}` : ''}`
  }

  const matchDescription = getMatchDescription()

  return (
    <div 
      className={cn(
        'flex items-center py-4 px-4 border-b border-border/20 last:border-b-0 transition-colors'
      )}
      role="group"
      aria-label={matchDescription}
    >
      {/* Home Team */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <TeamCrest 
          teamShortName={fixture.team_h_short_name} 
          teamFullName={fixture.team_h_name}
        />
        <span className={cn(
          'text-sm font-medium truncate',
          { 
            'font-bold': isNextFixture 
          }
        )}>
          {fixture.team_h_name}
        </span>
      </div>
      
      {/* Center Score/Time */}
      <div className="flex flex-col items-center gap-1 px-4 min-w-0 relative">
        {getScore() ? (
          <span 
            className="text-lg font-bold text-foreground"
            aria-label={showScores 
              ? `Current score: ${fixture.team_h_name} ${fixture.team_h_score}, ${fixture.team_a_name} ${fixture.team_a_score}` 
              : `Score hidden. ${fixture.team_h_name} versus ${fixture.team_a_name} has a score but you have chosen to hide scores.`
            }
            role="status"
            aria-live="polite"
          >
            {getScore()}
          </span>
        ) : (
          <time 
            className="text-sm text-muted-foreground"
            dateTime={fixture.kickoff_time}
            aria-label={`Kickoff time: ${kickoffTime}`}
          >
            {kickoffTime}
          </time>
        )}
        {fixture.match_status.status !== 'scheduled' && (
          <div 
            className={cn(
              "text-xs",
              fixture.match_status.status === 'finished' ? 
                "absolute top-[80%] left-0 w-full text-center" : 
                "text-info"
            )}
            aria-label={`Match status: ${statusText}`}
            role="status"
            aria-live={fixture.match_status.status === 'live' ? 'polite' : 'off'}
          >
            {fixture.match_status.status === 'live' ? 'LIVE' : 
             fixture.match_status.status === 'finished' ? 'FT' : 
             fixture.match_status.status === 'postponed' ? 'PP' : ''}
          </div>
        )}
      </div>
      
      {/* Away Team */}
      <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
        <span className={cn(
          'text-sm font-medium truncate text-right',
          { 
            'font-bold': isNextFixture 
          }
        )}>
          {fixture.team_a_name}
        </span>
        <TeamCrest 
          teamShortName={fixture.team_a_short_name} 
          teamFullName={fixture.team_a_name}
        />
      </div>
    </div>
  )
}

// Memoize the component with custom comparison to prevent unnecessary re-renders
export const CompactFixtureRow = memo(CompactFixtureRowComponent, (prevProps, nextProps) => {
  // Only re-render if essential props change
  return (
    prevProps.fixture.id === nextProps.fixture.id &&
    prevProps.fixture.kickoff_time === nextProps.fixture.kickoff_time &&
    prevProps.fixture.team_h_score === nextProps.fixture.team_h_score &&
    prevProps.fixture.team_a_score === nextProps.fixture.team_a_score &&
    prevProps.fixture.match_status.status === nextProps.fixture.match_status.status &&
    prevProps.showScores === nextProps.showScores &&
    prevProps.timezone === nextProps.timezone &&
    prevProps.timeFormat === nextProps.timeFormat &&
    prevProps.isNextFixture === nextProps.isNextFixture
  )
})