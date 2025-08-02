import { memo, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { formatTimeInTimezone } from '@/utils/timezone'
import { cn } from '@/lib/utils'
import { TeamCrest } from '@/components/ui/TeamCrest'
import { Calendar } from '@/components/icons'
import { 
  addFixtureToCalendar, 
  createGoogleCalendarUrl, 
  createOutlookCalendarUrl 
} from '@/utils/calendar'
import { getTeamById } from '@/utils/teamHelpers'
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null)

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

  // Close dropdown on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isDropdownOpen) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDropdownOpen])

  // Cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      // Clean up refs on unmount
      prevScoreRef.current = null
      prevStatusRef.current = null
      setDropdownPosition(null)
      setIsDropdownOpen(false)
    }
  }, [])
  
  

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

  const homeTeam = getTeamById(fixture.team_h)
  const awayTeam = getTeamById(fixture.team_a)
  
  const calendarFixture = homeTeam && awayTeam ? {
    id: fixture.id,
    team_h: fixture.team_h,
    team_a: fixture.team_a,
    team_h_score: fixture.team_h_score,
    team_a_score: fixture.team_a_score,
    kickoff_time: fixture.kickoff_time,
    started: fixture.started || false,
    finished: fixture.finished,
    provisional_start_time: fixture.provisional_start_time
  } : null

  const handleFixtureClick = () => {
    if (calendarFixture && homeTeam && awayTeam) {
      if (!isDropdownOpen && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4,
          right: window.innerWidth - rect.right + window.scrollX + 16
        })
      }
      setIsDropdownOpen(!isDropdownOpen)
    }
  }

  const handleCalendarOption = (action: () => void) => {
    action()
    setIsDropdownOpen(false)
  }

  const addToGoogleCalendar = () => {
    if (calendarFixture && homeTeam && awayTeam) {
      try {
        const url = createGoogleCalendarUrl(calendarFixture, homeTeam, awayTeam, timezone)
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
        if (!newWindow) {
          alert('Please allow popups to add events to Google Calendar.')
        }
      } catch (error) {
        console.error('Failed to create Google Calendar URL:', error)
        alert('Failed to open Google Calendar. Please try again.')
      }
    }
  }

  const addToOutlookCalendar = () => {
    if (calendarFixture && homeTeam && awayTeam) {
      try {
        const url = createOutlookCalendarUrl(calendarFixture, homeTeam, awayTeam, timezone)
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
        if (!newWindow) {
          alert('Please allow popups to add events to Outlook Calendar.')
        }
      } catch (error) {
        console.error('Failed to create Outlook Calendar URL:', error)
        alert('Failed to open Outlook Calendar. Please try again.')
      }
    }
  }

  const downloadICS = async () => {
    if (calendarFixture && homeTeam && awayTeam) {
      try {
        addFixtureToCalendar(calendarFixture, homeTeam, awayTeam, timezone)
        // Could add success feedback here if needed
      } catch (error) {
        console.error('Failed to download calendar file:', error)
        // Show user-friendly error message
        alert('Failed to download calendar event. Please try again.')
      }
    }
  }

  return (
    <div className="relative">
      <button 
        ref={buttonRef}
        onClick={handleFixtureClick}
        className={cn(
          'w-full flex items-center py-4 px-4 border-b border-border/20 last:border-b-0 transition-colors cursor-pointer text-left hover:bg-accent/50'
        )}
        aria-label={`Calendar options for ${fixture.team_h_name} vs ${fixture.team_a_name}`}
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
          <div className="flex items-center gap-1">
            <time 
              className="text-sm text-muted-foreground"
              dateTime={fixture.kickoff_time}
              aria-label={`Kickoff time: ${kickoffTime}`}
            >
              {kickoffTime}
            </time>
            <Calendar className="h-3 w-3 text-muted-foreground/60" />
          </div>
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
      </button>

      {/* Dropdown menu using portal */}
      {isDropdownOpen && dropdownPosition && createPortal(
        <>
          {/* Backdrop to close dropdown */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
            aria-hidden="true"
          />
          
          {/* Dropdown menu */}
          <div 
            className="fixed bg-popover border border-border rounded-md shadow-lg z-50 min-w-[180px]"
            style={{
              top: `${dropdownPosition.top}px`,
              right: `${dropdownPosition.right}px`
            }}
          >
            <div className="py-1" role="menu">
              <button
                onClick={() => handleCalendarOption(downloadICS)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2"
                role="menuitem"
              >
                <Calendar className="h-4 w-4" />
                Download ICS file
              </button>
              
              <button
                onClick={() => handleCalendarOption(addToGoogleCalendar)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2"
                role="menuitem"
              >
                <div className="h-4 w-4 rounded bg-blue-500 flex items-center justify-center">
                  <span className="text-xs text-white font-bold">G</span>
                </div>
                Add to Google Calendar
              </button>
              
              <button
                onClick={() => handleCalendarOption(addToOutlookCalendar)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2"
                role="menuitem"
              >
                <div className="h-4 w-4 rounded bg-blue-600 flex items-center justify-center">
                  <span className="text-xs text-white font-bold">O</span>
                </div>
                Add to Outlook Calendar
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
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
    prevProps.fixture.team_h_name === nextProps.fixture.team_h_name &&
    prevProps.fixture.team_a_name === nextProps.fixture.team_a_name &&
    prevProps.showScores === nextProps.showScores &&
    prevProps.timezone === nextProps.timezone &&
    prevProps.timeFormat === nextProps.timeFormat &&
    prevProps.isNextFixture === nextProps.isNextFixture
  )
})