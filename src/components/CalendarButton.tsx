/**
 * CalendarButton component for adding fixtures to calendar
 * Provides multiple calendar integration options with responsive design
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Calendar, ExternalLink, Download } from '@/components/icons'
import { addFixtureToCalendar, createGoogleCalendarUrl, createOutlookCalendarUrl } from '@/utils/calendar'

interface CalendarButtonProps {
  fixture: {
    id: number
    team_h: number
    team_a: number
    team_h_score: number | null
    team_a_score: number | null
    kickoff_time: string
    started: boolean
    finished: boolean
    provisional_start_time?: boolean
  }
  homeTeam: {
    id: number
    name: string
    short_name: string
  }
  awayTeam: {
    id: number
    name: string
    short_name: string
  }
  timezone: string
  className?: string
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'ghost' | 'outline' | 'secondary'
}

export function CalendarButton({
  fixture,
  homeTeam,
  awayTeam,
  timezone,
  className = '',
  size = 'sm',
  variant = 'ghost'
}: CalendarButtonProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleDownloadICS = async () => {
    setIsLoading('ics')
    try {
      addFixtureToCalendar(fixture, homeTeam, awayTeam, timezone)
    } catch (error) {
      console.error('Failed to download calendar file:', error)
    } finally {
      setIsLoading(null)
    }
  }

  const handleOpenGoogleCalendar = () => {
    setIsLoading('google')
    try {
      const url = createGoogleCalendarUrl(fixture, homeTeam, awayTeam, timezone)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Failed to open Google Calendar:', error)
    } finally {
      setIsLoading(null)
    }
  }

  const handleOpenOutlookCalendar = () => {
    setIsLoading('outlook')
    try {
      const url = createOutlookCalendarUrl(fixture, homeTeam, awayTeam, timezone)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Failed to open Outlook Calendar:', error)
    } finally {
      setIsLoading(null)
    }
  }

  // Don't show for finished matches unless user wants to keep record
  const showButton = !fixture.finished || fixture.team_h_score !== null

  if (!showButton) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={`${className} text-muted-foreground hover:text-foreground transition-colors`}
          aria-label={`Add ${homeTeam.short_name} vs ${awayTeam.short_name} to calendar`}
          disabled={isLoading !== null}
        >
          <Calendar className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem 
          onClick={handleDownloadICS}
          disabled={isLoading === 'ics'}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Download className="h-4 w-4" />
          <span>Download (.ics file)</span>
          {isLoading === 'ics' && (
            <div className="ml-auto w-4 h-4 border-2 border-muted border-t-foreground rounded-full animate-spin" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleOpenGoogleCalendar}
          disabled={isLoading === 'google'}
          className="flex items-center gap-2 cursor-pointer"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Google Calendar</span>
          {isLoading === 'google' && (
            <div className="ml-auto w-4 h-4 border-2 border-muted border-t-foreground rounded-full animate-spin" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleOpenOutlookCalendar}
          disabled={isLoading === 'outlook'}
          className="flex items-center gap-2 cursor-pointer"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Outlook Calendar</span>
          {isLoading === 'outlook' && (
            <div className="ml-auto w-4 h-4 border-2 border-muted border-t-foreground rounded-full animate-spin" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}