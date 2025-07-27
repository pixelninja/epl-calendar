import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, Play, Square } from '@/components/icons'
import { cn } from '@/lib/utils'
import { formatTimeInTimezone, getRelativeTime, isToday } from '@/utils/timezone'
import type { ProcessedFixture } from '@/types/api'

interface FixtureCardProps {
  fixture: ProcessedFixture
  showScores?: boolean
  timezone?: string
  className?: string
}

export function FixtureCard({ 
  fixture, 
  showScores = false, 
  timezone = 'UTC',
  className 
}: FixtureCardProps) {
  const kickoffTime = formatTimeInTimezone(fixture.kickoff_time, timezone, {
    hour: '2-digit',
    minute: '2-digit',
  })
  
  const relativeTime = getRelativeTime(fixture.kickoff_time, timezone)
  const isMatchToday = isToday(fixture.kickoff_time, timezone)
  
  const getStatusBadge = () => {
    switch (fixture.match_status.status) {
      case 'live':
        return (
          <Badge variant="live" className="gap-1">
            <Play className="h-3 w-3" />
            {fixture.match_status.minutes}'
          </Badge>
        )
      case 'finished':
        return (
          <Badge variant="fulltime">
            <Square className="h-3 w-3 mr-1" />
            FT
          </Badge>
        )
      case 'postponed':
        return <Badge variant="postponed">Postponed</Badge>
      default:
        return (
          <Badge variant={isMatchToday ? "kickoff" : "outline"} className="gap-1">
            <Clock className="h-3 w-3" />
            {kickoffTime}
          </Badge>
        )
    }
  }

  const getCardVariant = () => {
    switch (fixture.match_status.status) {
      case 'live':
        return 'live'
      case 'finished':
        return 'completed'
      case 'postponed':
        return 'accent'
      default:
        return isMatchToday ? 'primary' : 'default'
    }
  }

  const getScore = () => {
    if (!showScores || (!fixture.team_h_score && !fixture.team_a_score)) {
      return null
    }
    
    if (fixture.match_status.status === 'finished' || fixture.match_status.status === 'live') {
      return (
        <div className="text-2xl font-bold text-center">
          {fixture.team_h_score} - {fixture.team_a_score}
        </div>
      )
    }
    
    return null
  }

  return (
    <Card 
      className={cn(
        'transition-all hover:shadow-md border-l-4',
        {
          'border-l-primary bg-primary/5': getCardVariant() === 'primary',
          'border-l-success bg-success/5 animate-pulse': getCardVariant() === 'live',
          'border-l-muted bg-muted/20 opacity-75': getCardVariant() === 'completed',
          'border-l-accent bg-accent/7': getCardVariant() === 'accent',
          'border-l-border': getCardVariant() === 'default',
        },
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Matchweek {fixture.matchweek}
              </span>
              {getStatusBadge()}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-lg">
                    {fixture.team_h_short_name}
                  </span>
                  <span className="text-muted-foreground text-sm">vs</span>
                  <span className="font-semibold text-lg">
                    {fixture.team_a_short_name}
                  </span>
                </div>
              </div>
              
              {getScore()}
              
              <div className="text-sm text-muted-foreground">
                {fixture.team_h_name} vs {fixture.team_a_name}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>Premier League</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{relativeTime}</span>
          </div>
        </div>
        
        {fixture.match_status.status === 'live' && fixture.match_status.period && (
          <div className="mt-2 text-xs text-success font-medium">
            {fixture.match_status.period === 'first-half' && 'First Half'}
            {fixture.match_status.period === 'half-time' && 'Half Time'}
            {fixture.match_status.period === 'second-half' && 'Second Half'}
            {fixture.match_status.period === 'full-time' && 'Full Time'}
          </div>
        )}
      </CardContent>
    </Card>
  )
}