/**
 * Calendar integration utilities for generating ICS files
 * Supports adding EPL fixtures to user's calendar with proper timezone handling
 */

import { format, parseISO } from 'date-fns'
import { formatInTimeZone, toZonedTime } from 'date-fns-tz'

interface CalendarEvent {
  id: string
  title: string
  startTime: Date
  endTime: Date
  location?: string
  description?: string
  url?: string
}

interface CalendarFixture {
  id: number
  team_h: number
  team_a: number
  team_h_score: number | null
  team_a_score: number | null
  kickoff_time: string
  started: boolean | null
  finished: boolean
  provisional_start_time?: boolean
}

interface Team {
  id: number
  name: string
  short_name: string
}

/**
 * Formats a date for ICS format in user's local timezone
 * Converts UTC time to user's timezone and formats without 'Z' suffix
 */
function formatDateForICS(utcDate: Date, timezone: string): string {
  const zonedDate = toZonedTime(utcDate, timezone)
  return format(zonedDate, "yyyyMMdd'T'HHmmss")
}

/**
 * Formats a date for Google Calendar URL format
 * Converts UTC time to user's timezone first
 */
function formatDateForGoogleCalendar(utcDate: Date, timezone: string): string {
  const zonedDate = toZonedTime(utcDate, timezone)
  return format(zonedDate, "yyyyMMdd'T'HHmmss")
}


/**
 * Escapes text for ICS format
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '')
}

/**
 * Generates ICS content for a single calendar event
 */
function generateICSContent(event: CalendarEvent, timezone: string = 'UTC'): string {
  const now = new Date()
  const uid = `${event.id}-${now.getTime()}@epl-calendar.app`
  
  let ics = 'BEGIN:VCALENDAR\r\n'
  ics += 'VERSION:2.0\r\n'
  ics += 'PRODID:-//EPL Calendar//EPL Fixtures//EN\r\n'
  ics += 'CALSCALE:GREGORIAN\r\n'
  ics += 'METHOD:PUBLISH\r\n'
  ics += 'BEGIN:VEVENT\r\n'
  ics += `UID:${uid}\r\n`
  ics += `DTSTART:${formatDateForICS(event.startTime, timezone)}\r\n`
  ics += `DTEND:${formatDateForICS(event.endTime, timezone)}\r\n`
  ics += `DTSTAMP:${formatDateForICS(now, timezone)}\r\n`
  ics += `SUMMARY:${escapeICSText(event.title)}\r\n`
  
  if (event.description) {
    ics += `DESCRIPTION:${escapeICSText(event.description)}\r\n`
  }
  
  if (event.location) {
    ics += `LOCATION:${escapeICSText(event.location)}\r\n`
  }
  
  if (event.url) {
    ics += `URL:${event.url}\r\n`
  }
  
  ics += 'STATUS:CONFIRMED\r\n'
  ics += 'TRANSP:OPAQUE\r\n'
  ics += 'END:VEVENT\r\n'
  ics += 'END:VCALENDAR\r\n'
  
  return ics
}

/**
 * Generates a single VEVENT block for ICS content
 */
function generateEventBlock(event: CalendarEvent, timestamp: Date, timezone: string = 'UTC'): string {
  const uid = `${event.id}-${timestamp.getTime()}@epl-calendar.app`
  
  let eventBlock = 'BEGIN:VEVENT\r\n'
  eventBlock += `UID:${uid}\r\n`
  eventBlock += `DTSTART:${formatDateForICS(event.startTime, timezone)}\r\n`
  eventBlock += `DTEND:${formatDateForICS(event.endTime, timezone)}\r\n`
  eventBlock += `DTSTAMP:${formatDateForICS(timestamp, timezone)}\r\n`
  eventBlock += `SUMMARY:${escapeICSText(event.title)}\r\n`
  
  if (event.description) {
    eventBlock += `DESCRIPTION:${escapeICSText(event.description)}\r\n`
  }
  
  if (event.location) {
    eventBlock += `LOCATION:${escapeICSText(event.location)}\r\n`
  }
  
  if (event.url) {
    eventBlock += `URL:${event.url}\r\n`
  }
  
  eventBlock += 'STATUS:CONFIRMED\r\n'
  eventBlock += 'TRANSP:OPAQUE\r\n'
  eventBlock += 'END:VEVENT\r\n'
  
  return eventBlock
}

/**
 * Generates ICS content for multiple calendar events
 */
function generateBulkICSContent(events: CalendarEvent[], timezone: string = 'UTC'): string {
  if (events.length === 0) {
    throw new Error('No events provided for bulk calendar generation')
  }
  
  const now = new Date()
  
  let ics = 'BEGIN:VCALENDAR\r\n'
  ics += 'VERSION:2.0\r\n'
  ics += 'PRODID:-//EPL Calendar//EPL Fixtures//EN\r\n'
  ics += 'CALSCALE:GREGORIAN\r\n'
  ics += 'METHOD:PUBLISH\r\n'
  
  // Add all events
  events.forEach(event => {
    ics += generateEventBlock(event, now, timezone)
  })
  
  ics += 'END:VCALENDAR\r\n'
  
  return ics
}

/**
 * Creates a calendar event from a fixture
 */
export function createCalendarEventFromFixture(
  fixture: CalendarFixture,
  homeTeam: Team,
  awayTeam: Team,
  userTimezone: string = 'UTC'
): CalendarEvent {
  // Parse the UTC time from fixture data (fixture.kickoff_time already has 'Z' suffix)
  const utcKickoffTime = parseISO(fixture.kickoff_time)
  
  // The calendar event should use UTC times for ICS format compatibility
  // Calendar applications will handle timezone display based on user's local settings
  const startTime = utcKickoffTime
  const endTime = new Date(startTime.getTime() + (105 * 60 * 1000)) // 90 min + 15 min buffer
  
  const title = `${homeTeam.name} vs ${awayTeam.name}`
  
  let description = `Premier League fixture between ${homeTeam.name} and ${awayTeam.name}.`
  
  if (fixture.provisional_start_time) {
    description += ' Kick-off time is provisional and may change.'
  }
  
  if (fixture.finished && fixture.team_h_score !== null && fixture.team_a_score !== null) {
    description += ` Final Score: ${homeTeam.short_name} ${fixture.team_h_score} - ${fixture.team_a_score} ${awayTeam.short_name}`
  }
  
  // Add timezone information to description for user reference
  const localTime = formatInTimeZone(utcKickoffTime, userTimezone, 'PPP p')
  description += ` Local time: ${localTime} (${userTimezone})`
  
  // Debug information - can be removed later
  const utcTime = formatInTimeZone(utcKickoffTime, 'UTC', 'PPP p')
  description += ` UTC: ${utcTime}`
  
  return {
    id: fixture.id.toString(),
    title,
    startTime, // This is UTC time
    endTime,   // This is UTC time  
    description,
    location: 'Premier League',
    url: 'https://www.premierleague.com'
  }
}

/**
 * Downloads an ICS file for a calendar event
 */
export function downloadCalendarEvent(event: CalendarEvent, timezone: string = 'UTC'): void {
  const icsContent = generateICSContent(event, timezone)
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  
  // Create download link
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`
  
  // Trigger download
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up object URL
  URL.revokeObjectURL(link.href)
}

/**
 * Creates and downloads a calendar event from a fixture
 */
export function addFixtureToCalendar(
  fixture: CalendarFixture,
  homeTeam: Team,
  awayTeam: Team,
  userTimezone: string = 'UTC'
): void {
  const event = createCalendarEventFromFixture(fixture, homeTeam, awayTeam, userTimezone)
  downloadCalendarEvent(event, userTimezone)
}

/**
 * Generates a Google Calendar URL for a fixture
 */
export function createGoogleCalendarUrl(
  fixture: CalendarFixture,
  homeTeam: Team,
  awayTeam: Team,
  userTimezone: string = 'UTC'
): string {
  const event = createCalendarEventFromFixture(fixture, homeTeam, awayTeam, userTimezone)
  
  // Google Calendar URLs need times in the user's timezone, not UTC
  const startTimeFormatted = formatDateForGoogleCalendar(event.startTime, userTimezone)
  const endTimeFormatted = formatDateForGoogleCalendar(event.endTime, userTimezone)
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startTimeFormatted}/${endTimeFormatted}`,
    details: event.description || '',
    location: event.location || '',
    ctz: userTimezone
  })
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Generates an Outlook calendar URL for a fixture
 */
export function createOutlookCalendarUrl(
  fixture: CalendarFixture,
  homeTeam: Team,
  awayTeam: Team,
  userTimezone: string = 'UTC'
): string {
  const event = createCalendarEventFromFixture(fixture, homeTeam, awayTeam, userTimezone)
  
  // Convert UTC times to user's timezone for Outlook Calendar URLs
  const startTimeInTimezone = toZonedTime(event.startTime, userTimezone)
  const endTimeInTimezone = toZonedTime(event.endTime, userTimezone)
  
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: startTimeInTimezone.toISOString(),
    enddt: endTimeInTimezone.toISOString(),
    body: event.description || '',
    location: event.location || ''
  })
  
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}

/**
 * Downloads multiple calendar events as a single .ics file
 */
export function downloadBulkCalendarEvents(events: CalendarEvent[], filename: string = 'EPL-Fixtures', timezone: string = 'UTC'): void {
  if (events.length === 0) {
    throw new Error('No events provided for bulk download')
  }
  
  const icsContent = generateBulkICSContent(events, timezone)
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  
  // Create download link
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename.replace(/[^a-z0-9-]/gi, '_').toLowerCase()}.ics`
  
  // Trigger download
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up object URL
  URL.revokeObjectURL(link.href)
}

/**
 * Creates calendar events from multiple fixtures with team data lookup
 */
export function createBulkCalendarEvents(
  fixtures: CalendarFixture[],
  getTeamById: (id: number) => Team | undefined,
  userTimezone: string = 'UTC'
): CalendarEvent[] {
  return fixtures
    .map(fixture => {
      const homeTeam = getTeamById(fixture.team_h)
      const awayTeam = getTeamById(fixture.team_a)
      
      if (!homeTeam || !awayTeam) {
        console.warn(`Missing team data for fixture ${fixture.id}`)
        return null
      }
      
      return createCalendarEventFromFixture(fixture, homeTeam, awayTeam, userTimezone)
    })
    .filter((event): event is CalendarEvent => event !== null)
}

/**
 * Filters fixtures for bulk calendar operations
 */
export function filterFixturesForBulk(
  fixtures: CalendarFixture[],
  options: {
    includeFinished?: boolean
    dateRange?: { start: Date; end: Date }
    favoriteTeamId?: number
    maxFixtures?: number
  } = {}
): CalendarFixture[] {
  let filtered = fixtures.slice()
  
  // Filter by completion status
  if (!options.includeFinished) {
    filtered = filtered.filter(f => !f.finished)
  }
  
  // Filter by date range
  if (options.dateRange) {
    const { start, end } = options.dateRange
    filtered = filtered.filter(f => {
      const kickoffDate = new Date(f.kickoff_time)
      return kickoffDate >= start && kickoffDate <= end
    })
  }
  
  // Filter by favorite team
  if (options.favoriteTeamId) {
    filtered = filtered.filter(f => 
      f.team_h === options.favoriteTeamId || f.team_a === options.favoriteTeamId
    )
  }
  
  // Sort by kickoff time
  filtered.sort((a, b) => new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime())
  
  // Limit number of fixtures
  if (options.maxFixtures && options.maxFixtures > 0) {
    filtered = filtered.slice(0, options.maxFixtures)
  }
  
  return filtered
}

/**
 * Gets fixtures for a specific date
 */
export function getFixturesForDate(fixtures: CalendarFixture[], date: string): CalendarFixture[] {
  return fixtures.filter(f => {
    const fixtureDate = new Date(f.kickoff_time).toDateString()
    const targetDate = new Date(date).toDateString()
    return fixtureDate === targetDate
  })
}

/**
 * Gets fixtures for the next N days
 */
export function getFixturesForNextDays(fixtures: CalendarFixture[], days: number): CalendarFixture[] {
  const now = new Date()
  const endDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000))
  
  return filterFixturesForBulk(fixtures, {
    includeFinished: false,
    dateRange: { start: now, end: endDate }
  })
}

/**
 * Gets all fixtures for a favorite team
 */
export function getFavoriteTeamFixtures(fixtures: CalendarFixture[], teamId: number, includeFinished: boolean = false): CalendarFixture[] {
  return filterFixturesForBulk(fixtures, {
    favoriteTeamId: teamId,
    includeFinished
  })
}

/**
 * Generates descriptive filename for bulk calendar download
 */
export function generateBulkCalendarFilename(
  fixtures: CalendarFixture[],
  context: {
    type: 'date' | 'range' | 'team' | 'all'
    teamName?: string
    dateLabel?: string
  }
): string {
  const count = fixtures.length
  const year = new Date().getFullYear()
  
  switch (context.type) {
    case 'date':
      return `EPL-Fixtures-${context.dateLabel || 'Selected-Date'}-${count}-matches`
    case 'range':
      return `EPL-Fixtures-Next-${count}-matches-${year}`
    case 'team':
      return `${context.teamName || 'Team'}-Fixtures-${count}-matches-${year}`
    case 'all':
      return `EPL-All-Remaining-Fixtures-${count}-matches-${year}`
    default:
      return `EPL-Fixtures-${count}-matches`
  }
}