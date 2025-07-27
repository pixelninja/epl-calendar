import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Trophy, Clock } from '@/components/icons'
import { FixtureCard } from './FixtureCard'
import { cn } from '@/lib/utils'
import type { ProcessedFixture } from '@/types/api'

interface MatchWeekProps {
  matchweek: number
  fixtures: ProcessedFixture[]
  showScores?: boolean
  timezone?: string
  isActive?: boolean
  isCompleted?: boolean
  className?: string
}

export function MatchWeek({
  matchweek,
  fixtures,
  showScores = false,
  timezone = 'UTC',
  isActive = false,
  isCompleted = false,
  className
}: MatchWeekProps) {
  const [isExpanded, setIsExpanded] = useState(isActive)
  
  const liveFixtures = fixtures.filter(f => f.match_status.status === 'live')
  const upcomingFixtures = fixtures.filter(f => f.match_status.status === 'scheduled')
  const finishedFixtures = fixtures.filter(f => f.match_status.status === 'finished')
  const postponedFixtures = fixtures.filter(f => f.match_status.status === 'postponed')
  
  const getMatchweekStatus = () => {
    if (liveFixtures.length > 0) {
      return { type: 'live', count: liveFixtures.length }
    }
    if (upcomingFixtures.length > 0) {
      return { type: 'upcoming', count: upcomingFixtures.length }
    }
    if (finishedFixtures.length === fixtures.length) {
      return { type: 'completed', count: fixtures.length }
    }
    return { type: 'mixed', count: fixtures.length }
  }

  const status = getMatchweekStatus()
  
  const getStatusBadge = () => {
    switch (status.type) {
      case 'live':
        return (
          <Badge variant="live" className="gap-1">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            {status.count} Live
          </Badge>
        )
      case 'upcoming':
        return (
          <Badge variant="kickoff" className="gap-1">
            <Clock className="h-3 w-3" />
            {status.count} Upcoming
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant="fulltime" className="gap-1">
            <Trophy className="h-3 w-3" />
            Completed
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            {finishedFixtures.length}/{fixtures.length} Complete
          </Badge>
        )
    }
  }

  const cardVariant = () => {
    if (status.type === 'live') return 'live'
    if (isCompleted) return 'completed'
    if (isActive) return 'primary'
    return 'default'
  }

  const getNextKickoff = () => {
    const nextFixture = upcomingFixtures
      .sort((a, b) => new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime())[0]
    
    if (nextFixture) {
      const kickoffDate = new Date(nextFixture.kickoff_time)
      const now = new Date()
      const diffHours = Math.ceil((kickoffDate.getTime() - now.getTime()) / (1000 * 60 * 60))
      
      if (diffHours <= 24) {
        return `Next: ${kickoffDate.toLocaleTimeString('en-GB', { 
          timeZone: timezone,
          hour: '2-digit', 
          minute: '2-digit' 
        })}`
      }
    }
    return null
  }

  return (
    <Card 
      className={cn(
        'transition-all',
        {
          'border-l-4 border-l-success bg-success/5 shadow-md': cardVariant() === 'live',
          'border-l-4 border-l-primary bg-primary/5': cardVariant() === 'primary',
          'border-l-4 border-l-muted bg-muted/20 opacity-75': cardVariant() === 'completed',
        },
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl font-bold">
              Matchweek {matchweek}
            </CardTitle>
            {getStatusBadge()}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{fixtures.length} fixtures</span>
          {getNextKickoff() && <span>{getNextKickoff()}</span>}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Live fixtures first */}
            {liveFixtures.map(fixture => (
              <FixtureCard
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
                <FixtureCard
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
                <FixtureCard
                  key={fixture.id}
                  fixture={fixture}
                  showScores={showScores}
                  timezone={timezone}
                />
              ))}
            
            {/* Finally postponed fixtures */}
            {postponedFixtures.map(fixture => (
              <FixtureCard
                key={fixture.id}
                fixture={fixture}
                showScores={showScores}
                timezone={timezone}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}