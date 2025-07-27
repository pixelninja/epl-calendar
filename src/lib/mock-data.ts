import type { ProcessedFixture, Team, BootstrapStatic, Fixture } from '@/types/api'
import bootstrapData from './data-bootstrap.json'
import fixturesData from './data-fixtures.json'

export const realTeams: Team[] = bootstrapData.teams
export const realFixtures: Fixture[] = fixturesData

export function generateRealFixtures(): ProcessedFixture[] {
  const teamMap = new Map(realTeams.map(team => [team.id, team]))
  const now = new Date()
  
  const processedFixtures = realFixtures.map(fixture => {
    const homeTeam = teamMap.get(fixture.team_h)
    const awayTeam = teamMap.get(fixture.team_a)
    const kickoffDate = new Date(fixture.kickoff_time)
    const isPast = kickoffDate < now
    const hasScores = fixture.team_h_score !== null && fixture.team_a_score !== null
    
    // Determine match status based on current date and fixture data
    let match_status: ProcessedFixture['match_status']
    let finished = fixture.finished
    let started = fixture.started
    
    // If fixture has scores and is in the past, mark as finished
    if (hasScores && isPast) {
      finished = true
      started = true
      match_status = { status: 'finished' }
    } else if (fixture.finished) {
      match_status = { status: 'finished' }
    } else if (fixture.started) {
      match_status = { 
        status: 'live', 
        minutes: fixture.minutes,
        period: fixture.minutes <= 45 ? 'first-half' : 'second-half'
      }
    } else if (fixture.kickoff_time) {
      match_status = { status: 'scheduled' }
    } else {
      match_status = { status: 'postponed' }
    }
    
    return {
      id: fixture.id,
      code: fixture.code,
      event: fixture.event,
      finished,
      finished_provisional: fixture.finished_provisional,
      kickoff_time: fixture.kickoff_time,
      minutes: fixture.minutes,
      provisional_start_time: fixture.provisional_start_time,
      started,
      team_a: fixture.team_a,
      team_a_score: fixture.team_a_score,
      team_h: fixture.team_h,
      team_h_score: fixture.team_h_score,
      stats: fixture.stats,
      team_h_difficulty: fixture.team_h_difficulty,
      team_a_difficulty: fixture.team_a_difficulty,
      pulse_id: fixture.pulse_id,
      team_a_name: awayTeam?.name || 'Unknown',
      team_a_short_name: awayTeam?.short_name || 'UNK',
      team_h_name: homeTeam?.name || 'Unknown',
      team_h_short_name: homeTeam?.short_name || 'UNK',
      match_status,
      kickoff_local: kickoffDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }),
      matchweek: fixture.event
    }
  }).sort((a, b) => new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime())
  
  return processedFixtures
}

export const realBootstrapStatic: BootstrapStatic = bootstrapData as BootstrapStatic