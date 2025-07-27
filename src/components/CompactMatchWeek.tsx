import { useState } from 'react'
import { ChevronDown, ChevronRight } from '@/components/icons'
import { CompactFixtureRow } from './CompactFixtureRow'
import { cn } from '@/lib/utils'
import type { ProcessedFixture } from '@/types/api'

interface CompactMatchWeekProps {
  matchweek: number
  fixtures: ProcessedFixture[]
  showScores?: boolean
  timezone?: string
  className?: string
}

export function CompactMatchWeek({
  matchweek,
  fixtures,
  showScores = false,
  timezone = 'UTC',
  className
}: CompactMatchWeekProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const liveFixtures = fixtures.filter(f => f.match_status.status === 'live')
  const upcomingFixtures = fixtures.filter(f => f.match_status.status === 'scheduled')
  const finishedFixtures = fixtures.filter(f => f.match_status.status === 'finished')
  
  const getStatusBadge = () => {
    if (liveFixtures.length > 0) {
      return (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span className="text-xs text-success font-medium">LIVE</span>
        </div>
      )
    }
    if (upcomingFixtures.length > 0) {
      return <span className="text-xs text-primary font-medium">UPCOMING</span>
    }
    if (finishedFixtures.length === fixtures.length) {
      return <span className="text-xs text-muted-foreground">COMPLETE</span>
    }
    return <span className="text-xs text-muted-foreground">{finishedFixtures.length}/{fixtures.length}</span>
  }

  return (
    <div className={cn('border-b border-border', className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-semibold text-sm">Matchweek {matchweek}</span>
          </div>
          {getStatusBadge()}
        </div>
        
        <div className="text-xs text-muted-foreground">
          {fixtures.length} fixtures
        </div>
      </button>

      {isExpanded && (
        <div className="bg-background">
          {/* Live fixtures first */}
          {liveFixtures
            .sort((a, b) => new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime())
            .map(fixture => (
              <CompactFixtureRow
                key={fixture.id}
                fixture={fixture}
                showScores={showScores}
                timezone={timezone}
              />
            ))}
          
          {/* Then upcoming fixtures */}
          {upcomingFixtures
            .sort((a, b) => new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime())
            .map(fixture => (
              <CompactFixtureRow
                key={fixture.id}
                fixture={fixture}
                showScores={showScores}
                timezone={timezone}
              />
            ))}
          
          {/* Then finished fixtures */}
          {finishedFixtures
            .sort((a, b) => new Date(b.kickoff_time).getTime() - new Date(a.kickoff_time).getTime())
            .map(fixture => (
              <CompactFixtureRow
                key={fixture.id}
                fixture={fixture}
                showScores={showScores}
                timezone={timezone}
              />
            ))}
        </div>
      )}
    </div>
  )
}