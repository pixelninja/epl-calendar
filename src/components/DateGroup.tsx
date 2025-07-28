import { useState } from 'react'
import { ChevronRight } from '@/components/icons'
import { CompactFixtureRow } from './CompactFixtureRow'
import { cn } from '@/lib/utils'
import type { ProcessedFixture } from '@/types/api'

interface DateGroupProps {
  date: string
  fixtures: ProcessedFixture[]
  showScores?: boolean
  timezone?: string
  timeFormat?: '12h' | '24h'
  isToday?: boolean
  isPast?: boolean
  isNextFixtureDate?: boolean
  nextFixtureId?: number
  className?: string
  isEvenRow?: boolean
}

export function DateGroup({
  date,
  fixtures,
  showScores = false,
  timezone = 'UTC',
  timeFormat = '24h',
  isToday = false,
  isPast = false,
  isNextFixtureDate = false,
  nextFixtureId,
  className,
  isEvenRow = false
}: DateGroupProps) {
  // Expand today's matches by default, or if this date contains the next fixture
  const [isExpanded, setIsExpanded] = useState(isToday || isNextFixtureDate)
  
  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    // Check if it's today
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    }
    
    // Check if it's tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    }
    
    // Format as day name and date
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  const allFinished = fixtures.every(f => f.match_status.status === 'finished')

  return (
    <section className={cn(
      'border-b border-border/30',
      {
        'bg-white': isEvenRow,
        'bg-accent/10': !isEvenRow,
        'border-l-4 border-l-secondary': isNextFixtureDate && !isToday && !isPast
      },
      className
    )}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between px-4 py-4 transition-colors',
          {
            'bg-primary/5': isToday && !isPast,
            'hover:bg-muted/30': !isPast
          }
        )}
        aria-expanded={isExpanded}
        aria-controls={`fixtures-${date}`}
        aria-label={`${formatDateHeader(date)} fixtures, ${fixtures.length} matches`}
      >
        <div className="flex items-center gap-3">
          <h3 className={cn(
            'text-base font-semibold',
            {
              'text-primary': isToday && !isPast,
              'text-foreground': !isPast && !isToday,
              'text-muted-foreground line-through opacity-60': isPast && allFinished
            }
          )}>
            {formatDateHeader(date)}
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <ChevronRight className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isExpanded && "rotate-90"
          )} />
        </div>
      </button>

      <div 
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        )}
        id={`fixtures-${date}`}
        role="region"
        aria-labelledby={`date-${date}`}
      >
        <div className={cn(
          'bg-background',
          {
            'opacity-70': isPast && allFinished
          }
        )}>
          {fixtures
            .sort((a, b) => new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime())
            .map(fixture => (
              <article key={fixture.id}>
                <CompactFixtureRow
                  fixture={fixture}
                  showScores={showScores}
                  timezone={timezone}
                  timeFormat={timeFormat}
                  isNextFixture={fixture.id === nextFixtureId}
                />
              </article>
            ))}
        </div>
      </div>
    </section>
  )
}