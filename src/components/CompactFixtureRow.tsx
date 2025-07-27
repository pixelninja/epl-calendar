import { formatTimeInTimezone } from '@/utils/timezone'
import { cn } from '@/lib/utils'
import type { ProcessedFixture } from '@/types/api'

interface CompactFixtureRowProps {
  fixture: ProcessedFixture
  showScores?: boolean
  timezone?: string
  timeFormat?: '12h' | '24h'
  isNextFixture?: boolean
}

export function CompactFixtureRow({ fixture, showScores = false, timezone = 'UTC', timeFormat = '24h', isNextFixture = false }: CompactFixtureRowProps) {
  const kickoffTime = formatTimeInTimezone(fixture.kickoff_time, timezone, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: timeFormat === '12h'
  })
  
  // Convert team name to filename for logo
  const getTeamLogoPath = (teamFullName: string) => {
    // Convert team name to escaped filename format
    return teamFullName
      .toLowerCase()
      .replace(/\s+/g, '-')      // spaces to hyphens
      .replace(/'/g, '')         // remove apostrophes
      .replace(/[^a-z0-9-]/g, '') // remove other special chars
  }

  // Team crest with fallback to colored circle
  const getTeamCrest = (teamShortName: string, teamFullName: string) => {
    const colors: Record<string, string> = {
      'ARS': 'bg-red-600',
      'CHE': 'bg-blue-600', 
      'LIV': 'bg-red-700',
      'MCI': 'bg-sky-500',
      'MUN': 'bg-red-600',
      'TOT': 'bg-blue-800',
      'NEW': 'bg-black',
      'AVL': 'bg-purple-600',
      'WHU': 'bg-red-900',
      'BRE': 'bg-red-500',
      'BHA': 'bg-blue-400',
      'CRY': 'bg-blue-600',
      'EVE': 'bg-blue-700',
      'FUL': 'bg-black',
      'LEI': 'bg-blue-600',
      'WOL': 'bg-orange-500',
      'BOU': 'bg-red-500',
      'NFO': 'bg-red-600',
      'SOU': 'bg-red-500',
      'IPS': 'bg-blue-600',
      'BUR': 'bg-purple-500',
      'LEE': 'bg-yellow-500',
      'SUN': 'bg-red-500'
    }
    
    const logoPath = `/images/team-logos/${getTeamLogoPath(teamFullName)}.png`
    
    return (
      <img 
        src={logoPath}
        alt={`${teamFullName} crest`}
        className="w-6 h-6 object-contain"
        onError={(e) => {
          // Fallback to colored circle if image fails to load
          const target = e.target as HTMLImageElement
          const parent = target.parentElement
          if (parent) {
            parent.innerHTML = `<div class="${cn('w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white', colors[teamShortName] || 'bg-gray-500')}">${teamShortName.slice(0, 2)}</div>`
          }
        }}
      />
    )
  }
  

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

  const isLive = fixture.match_status.status === 'live'
  const isFinished = fixture.match_status.status === 'finished'
  const isPostponed = fixture.match_status.status === 'postponed'
  const isPast = new Date(fixture.kickoff_time) < new Date()
  const hasScores = fixture.team_h_score !== null && fixture.team_a_score !== null

  return (
    <div 
      className={cn(
        'flex items-center py-4 px-4 border-b border-border/20 last:border-b-0 transition-colors'
      )}
    >
      {/* Home Team */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {getTeamCrest(fixture.team_h_short_name, fixture.team_h_name)}
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
          <span className="text-lg font-bold text-foreground">
            {getScore()}
          </span>
        ) : (
          <div className="text-sm text-muted-foreground">
            {kickoffTime}
          </div>
        )}
        {fixture.match_status.status !== 'scheduled' && (
          <div className={cn(
            "text-xs",
            fixture.match_status.status === 'finished' ? 
              "absolute top-[80%] left-0 w-full text-center" : 
              "text-info"
          )}>
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
        {getTeamCrest(fixture.team_a_short_name, fixture.team_a_name)}
      </div>
    </div>
  )
}