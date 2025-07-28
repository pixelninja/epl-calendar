// Common timezone mappings
export const TIMEZONES = {
  'UTC': 'UTC',
  'London': 'Europe/London',
  'New York': 'America/New_York',
  'Los Angeles': 'America/Los_Angeles',
  'Toronto': 'America/Toronto',
  'Sydney': 'Australia/Sydney',
  'Tokyo': 'Asia/Tokyo',
  'Mumbai': 'Asia/Kolkata',
  'Dubai': 'Asia/Dubai',
  'Lagos': 'Africa/Lagos',
  'Cape Town': 'Africa/Johannesburg',
} as const

export type TimezoneKey = keyof typeof TIMEZONES
export type TimezoneValue = typeof TIMEZONES[TimezoneKey]

// Get user's timezone
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'UTC'
  }
}

// Convert UTC date to specified timezone
export function convertToTimezone(utcDate: string | Date): Date {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate
  
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date provided')
  }

  // Return the same Date object - the timezone conversion happens during formatting
  return date
}

// Format date in specified timezone
export function formatDateInTimezone(
  date: string | Date,
  timezone: string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date'
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }

  try {
    return new Intl.DateTimeFormat('en-GB', defaultOptions).format(dateObj)
  } catch {
    // Fallback to UTC if timezone is invalid
    return new Intl.DateTimeFormat('en-GB', {
      ...defaultOptions,
      timeZone: 'UTC',
    }).format(dateObj)
  }
}

// Get time only in specified timezone
export function formatTimeInTimezone(
  date: string | Date,
  timezone: string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Time'
  }

  const formatOptions: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }

  try {
    return new Intl.DateTimeFormat('en-GB', formatOptions).format(dateObj)
  } catch {
    return new Intl.DateTimeFormat('en-GB', {
      ...formatOptions,
      timeZone: 'UTC',
    }).format(dateObj)
  }
}

// Get relative time (e.g., "in 2 hours", "2 days ago")
export function getRelativeTime(
  date: string | Date,
  timezone: string = getUserTimezone()
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date'
  }

  const diffMs = dateObj.getTime() - now.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  // If it's today or tomorrow/yesterday, show relative day
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const dateInTimezone = new Date(dateObj.toLocaleString('en-CA', { timeZone: timezone }))
  const todayInTimezone = new Date(today.toLocaleString('en-CA', { timeZone: timezone }))
  const tomorrowInTimezone = new Date(tomorrow.toLocaleString('en-CA', { timeZone: timezone }))
  const yesterdayInTimezone = new Date(yesterday.toLocaleString('en-CA', { timeZone: timezone }))

  const isSameDay = (d1: Date, d2: Date) => 
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()

  if (isSameDay(dateInTimezone, todayInTimezone)) {
    if (Math.abs(diffMinutes) < 60) {
      if (diffMinutes === 0) return 'Now'
      return diffMinutes > 0 ? `in ${diffMinutes}m` : `${Math.abs(diffMinutes)}m ago`
    }
    return diffHours > 0 ? `in ${diffHours}h` : `${Math.abs(diffHours)}h ago`
  }

  if (isSameDay(dateInTimezone, tomorrowInTimezone)) {
    return 'Tomorrow'
  }

  if (isSameDay(dateInTimezone, yesterdayInTimezone)) {
    return 'Yesterday'
  }

  // For other dates, show days
  if (Math.abs(diffDays) < 7) {
    return diffDays > 0 ? `in ${diffDays} days` : `${Math.abs(diffDays)} days ago`
  }

  // For dates further away, show the actual date
  return formatDateInTimezone(dateObj, timezone, {
    month: 'short',
    day: 'numeric',
  })
}

// Check if a date is today in the specified timezone
export function isToday(date: string | Date, timezone: string = getUserTimezone()): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()

  if (isNaN(dateObj.getTime())) {
    return false
  }

  const dateInTimezone = new Date(dateObj.toLocaleString('en-CA', { timeZone: timezone }))
  const todayInTimezone = new Date(today.toLocaleString('en-CA', { timeZone: timezone }))

  return dateInTimezone.getFullYear() === todayInTimezone.getFullYear() &&
         dateInTimezone.getMonth() === todayInTimezone.getMonth() &&
         dateInTimezone.getDate() === todayInTimezone.getDate()
}

// Check if a date is in the future
export function isFuture(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.getTime() > Date.now()
}

// Get timezone offset string (e.g., "+01:00", "-05:00")
export function getTimezoneOffset(timezone: string): string {
  try {
    const date = new Date()
    const utc = new Date(date.getTime() + (date.getTimezoneOffset() * 60000))
    const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: timezone }))
    const offset = (targetTime.getTime() - utc.getTime()) / (1000 * 60 * 60)
    
    const sign = offset >= 0 ? '+' : '-'
    const hours = Math.floor(Math.abs(offset))
    const minutes = Math.round((Math.abs(offset) - hours) * 60)
    
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  } catch {
    return '+00:00'
  }
}