import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, TrendingUp, TrendingDown, Minus } from '@/components/icons'
import { cn } from '@/lib/utils'

interface LeagueTableTeam {
  position: number
  team: {
    id: number
    name: string
    short_name: string
    strength: number
  }
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
  form: string[]
}

interface LeagueTableProps {
  teams: LeagueTableTeam[]
  highlightedTeams?: number[]
  showForm?: boolean
  className?: string
}

export function LeagueTable({ 
  teams, 
  highlightedTeams = [], 
  showForm = true,
  className 
}: LeagueTableProps) {
  const getPositionBadge = (position: number) => {
    if (position <= 4) {
      return <Badge variant="secondary" className="bg-success text-success-foreground">UCL</Badge>
    }
    if (position === 5) {
      return <Badge variant="outline" className="border-info text-info">UEL</Badge>
    }
    if (position === 6) {
      return <Badge variant="outline" className="border-warning text-warning">UECL</Badge>
    }
    if (position >= 18) {
      return <Badge variant="destructive">REL</Badge>
    }
    return null
  }

  const getFormIcon = (result: string) => {
    switch (result.toLowerCase()) {
      case 'w':
        return <div className="w-2 h-2 bg-success rounded-full" />
      case 'd':
        return <div className="w-2 h-2 bg-warning rounded-full" />
      case 'l':
        return <div className="w-2 h-2 bg-destructive rounded-full" />
      default:
        return <div className="w-2 h-2 bg-muted rounded-full" />
    }
  }

  const getPositionTrend = (team: LeagueTableTeam) => {
    // This would typically come from API data comparing to previous gameweek
    // For now, we'll use a simple heuristic based on recent form
    const recentForm = team.form.slice(-3)
    const wins = recentForm.filter(r => r.toLowerCase() === 'w').length
    const losses = recentForm.filter(r => r.toLowerCase() === 'l').length
    
    if (wins >= 2) return 'up'
    if (losses >= 2) return 'down'
    return 'same'
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Premier League Table
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">Pos</TableHead>
                <TableHead className="min-w-[200px]">Team</TableHead>
                <TableHead className="w-12 text-center">Pld</TableHead>
                <TableHead className="w-12 text-center">W</TableHead>
                <TableHead className="w-12 text-center">D</TableHead>
                <TableHead className="w-12 text-center">L</TableHead>
                <TableHead className="w-16 text-center">GF</TableHead>
                <TableHead className="w-16 text-center">GA</TableHead>
                <TableHead className="w-16 text-center">GD</TableHead>
                <TableHead className="w-16 text-center font-bold">Pts</TableHead>
                {showForm && (
                  <TableHead className="w-20 text-center">Form</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team, index) => {
                const trend = getPositionTrend(team)
                const isHighlighted = highlightedTeams.includes(team.team.id)
                
                return (
                  <TableRow 
                    key={team.team.id}
                    className={cn(
                      'hover:bg-muted/50',
                      {
                        'bg-primary/5 border-l-2 border-l-primary': isHighlighted,
                        'bg-success/5': team.position <= 4,
                        'bg-info/5': team.position === 5,
                        'bg-warning/5': team.position === 6,
                        'bg-destructive/5': team.position >= 18,
                      }
                    )}
                  >
                    <TableCell className="text-center font-medium">
                      <div className="flex items-center justify-center gap-1">
                        <span>{team.position}</span>
                        {trend === 'up' && <TrendingUp className="h-3 w-3 text-success" />}
                        {trend === 'down' && <TrendingDown className="h-3 w-3 text-destructive" />}
                        {trend === 'same' && <Minus className="h-3 w-3 text-muted-foreground" />}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{team.team.short_name}</span>
                        <span className="text-muted-foreground text-sm hidden sm:inline">
                          {team.team.name}
                        </span>
                        {getPositionBadge(team.position)}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-center">{team.played}</TableCell>
                    <TableCell className="text-center text-success font-medium">{team.won}</TableCell>
                    <TableCell className="text-center text-warning font-medium">{team.drawn}</TableCell>
                    <TableCell className="text-center text-destructive font-medium">{team.lost}</TableCell>
                    <TableCell className="text-center">{team.goals_for}</TableCell>
                    <TableCell className="text-center">{team.goals_against}</TableCell>
                    <TableCell className={cn(
                      'text-center font-medium',
                      {
                        'text-success': team.goal_difference > 0,
                        'text-destructive': team.goal_difference < 0,
                        'text-muted-foreground': team.goal_difference === 0,
                      }
                    )}>
                      {team.goal_difference > 0 ? '+' : ''}{team.goal_difference}
                    </TableCell>
                    <TableCell className="text-center font-bold text-primary">
                      {team.points}
                    </TableCell>
                    
                    {showForm && (
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          {team.form.slice(-5).map((result, i) => (
                            <div key={i} title={result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}>
                              {getFormIcon(result)}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        
        <div className="p-4 border-t bg-muted/30">
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="bg-success text-success-foreground text-xs">UCL</Badge>
              <span>Champions League</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="border-info text-info text-xs">UEL</Badge>
              <span>Europa League</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="border-warning text-warning text-xs">UECL</Badge>
              <span>Conference League</span>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="destructive" className="text-xs">REL</Badge>
              <span>Relegation</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}