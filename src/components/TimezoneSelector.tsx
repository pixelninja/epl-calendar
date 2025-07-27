import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Globe } from '@/components/icons'
import { TIMEZONES, getUserTimezone, getTimezoneOffset } from '@/utils/timezone'
import type { TimezoneKey } from '@/utils/timezone'

interface TimezoneSelectorProps {
  value: string
  onValueChange: (timezone: string) => void
  className?: string
  showLabel?: boolean
}

export function TimezoneSelector({
  value,
  onValueChange,
  className,
  showLabel = true
}: TimezoneSelectorProps) {
  const userTimezone = getUserTimezone()
  
  // Create timezone options with offset information
  const timezoneOptions = Object.entries(TIMEZONES).map(([label, timezone]) => {
    const offset = getTimezoneOffset(timezone)
    const isUserTimezone = timezone === userTimezone
    
    return {
      label,
      value: timezone,
      offset,
      isUserTimezone,
      displayLabel: `${label} (${offset})`
    }
  })

  // Add user's current timezone if it's not in our predefined list
  if (!Object.values(TIMEZONES).includes(userTimezone as any)) {
    const offset = getTimezoneOffset(userTimezone)
    timezoneOptions.unshift({
      label: 'Auto (Local)',
      value: userTimezone,
      offset,
      isUserTimezone: true,
      displayLabel: `Auto (Local) (${offset})`
    })
  }

  // Sort by offset, then by label
  timezoneOptions.sort((a, b) => {
    // User timezone always first
    if (a.isUserTimezone && !b.isUserTimezone) return -1
    if (!a.isUserTimezone && b.isUserTimezone) return 1
    
    // Then by offset
    const offsetA = parseFloat(a.offset.replace(':', '.'))
    const offsetB = parseFloat(b.offset.replace(':', '.'))
    if (offsetA !== offsetB) return offsetA - offsetB
    
    // Then by label
    return a.label.localeCompare(b.label)
  })

  const selectedOption = timezoneOptions.find(option => option.value === value)

  return (
    <div className={className}>
      {showLabel && (
        <Label htmlFor="timezone-select" className="text-sm font-medium mb-2 flex items-center gap-1">
          <Globe className="h-4 w-4" />
          Timezone
        </Label>
      )}
      
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id="timezone-select" className="w-full">
          <SelectValue placeholder="Select timezone">
            {selectedOption ? (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>{selectedOption.displayLabel}</span>
                {selectedOption.isUserTimezone && (
                  <span className="text-xs text-primary font-medium">(Local)</span>
                )}
              </div>
            ) : (
              'Select timezone'
            )}
          </SelectValue>
        </SelectTrigger>
        
        <SelectContent>
          {timezoneOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center justify-between w-full">
                <span>{option.displayLabel}</span>
                {option.isUserTimezone && (
                  <span className="text-xs text-primary font-medium ml-2">(Local)</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedOption && (
        <p className="text-xs text-muted-foreground mt-1">
          Current time: {new Date().toLocaleTimeString('en-GB', {
            timeZone: selectedOption.value,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })}
        </p>
      )}
    </div>
  )
}