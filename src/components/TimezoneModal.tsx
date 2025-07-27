import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { MapPin, X, Check, ChevronsUpDown } from '@/components/icons'
import { cn } from '@/lib/utils'

interface TimezoneModalProps {
  isOpen: boolean
  onClose: () => void
  currentTimezone: string
  onTimezoneChange: (timezone: string) => void
  timeFormat: '12h' | '24h'
  onTimeFormatChange: (format: '12h' | '24h') => void
  hidePreviousFixtures: boolean
  onHidePreviousChange: (hide: boolean) => void
}

const ALL_TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  
  // Africa
  { value: 'Africa/Cairo', label: 'Cairo (EET)' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)' },
  { value: 'Africa/Lagos', label: 'Lagos (WAT)' },
  { value: 'Africa/Nairobi', label: 'Nairobi (EAT)' },
  
  // America - North
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)' },
  { value: 'America/Denver', label: 'Denver (MST/MDT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'America/Anchorage', label: 'Anchorage (AKST/AKDT)' },
  { value: 'America/Toronto', label: 'Toronto (EST/EDT)' },
  { value: 'America/Vancouver', label: 'Vancouver (PST/PDT)' },
  { value: 'America/Phoenix', label: 'Phoenix (MST)' },
  { value: 'America/Honolulu', label: 'Honolulu (HST)' },
  
  // America - Central/South
  { value: 'America/Mexico_City', label: 'Mexico City (CST/CDT)' },
  { value: 'America/Guatemala', label: 'Guatemala (CST)' },
  { value: 'America/Havana', label: 'Havana (CST/CDT)' },
  { value: 'America/Jamaica', label: 'Jamaica (EST)' },
  { value: 'America/Bogota', label: 'Bogota (COT)' },
  { value: 'America/Lima', label: 'Lima (PET)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires (ART)' },
  { value: 'America/Santiago', label: 'Santiago (CLT/CLST)' },
  
  // Asia
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Riyadh', label: 'Riyadh (AST)' },
  { value: 'Asia/Tehran', label: 'Tehran (IRST)' },
  { value: 'Asia/Karachi', label: 'Karachi (PKT)' },
  { value: 'Asia/Kolkata', label: 'Mumbai/Delhi (IST)' },
  { value: 'Asia/Dhaka', label: 'Dhaka (BST)' },
  { value: 'Asia/Bangkok', label: 'Bangkok (ICT)' },
  { value: 'Asia/Jakarta', label: 'Jakarta (WIB)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Asia/Manila', label: 'Manila (PST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Seoul', label: 'Seoul (KST)' },
  
  // Australia/Pacific
  { value: 'Australia/Perth', label: 'Perth (AWST)' },
  { value: 'Australia/Adelaide', label: 'Adelaide (ACST/ACDT)' },
  { value: 'Australia/Darwin', label: 'Darwin (ACST)' },
  { value: 'Australia/Brisbane', label: 'Brisbane (AEST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT/AEST)' },
  { value: 'Australia/Melbourne', label: 'Melbourne (AEDT/AEST)' },
  { value: 'Australia/Hobart', label: 'Hobart (AEDT/AEST)' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZDT/NZST)' },
  { value: 'Pacific/Fiji', label: 'Fiji (FJT)' },
  { value: 'Pacific/Honolulu', label: 'Honolulu (HST)' },
  
  // Europe
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Dublin', label: 'Dublin (GMT/IST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)' },
  { value: 'Europe/Rome', label: 'Rome (CET/CEST)' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (CET/CEST)' },
  { value: 'Europe/Brussels', label: 'Brussels (CET/CEST)' },
  { value: 'Europe/Zurich', label: 'Zurich (CET/CEST)' },
  { value: 'Europe/Vienna', label: 'Vienna (CET/CEST)' },
  { value: 'Europe/Prague', label: 'Prague (CET/CEST)' },
  { value: 'Europe/Warsaw', label: 'Warsaw (CET/CEST)' },
  { value: 'Europe/Stockholm', label: 'Stockholm (CET/CEST)' },
  { value: 'Europe/Oslo', label: 'Oslo (CET/CEST)' },
  { value: 'Europe/Copenhagen', label: 'Copenhagen (CET/CEST)' },
  { value: 'Europe/Helsinki', label: 'Helsinki (EET/EEST)' },
  { value: 'Europe/Athens', label: 'Athens (EET/EEST)' },
  { value: 'Europe/Istanbul', label: 'Istanbul (TRT)' },
  { value: 'Europe/Moscow', label: 'Moscow (MSK)' }
]

export function TimezoneModal({
  isOpen,
  onClose,
  currentTimezone,
  onTimezoneChange,
  timeFormat,
  onTimeFormatChange,
  hidePreviousFixtures,
  onHidePreviousChange
}: TimezoneModalProps) {
  const [selectedTimezone, setSelectedTimezone] = useState(currentTimezone)
  const [selectedTimeFormat, setSelectedTimeFormat] = useState(timeFormat)
  const [selectedHidePrevious, setSelectedHidePrevious] = useState(hidePreviousFixtures)
  const [open, setOpen] = useState(false)

  const handleAutoDetect = async () => {
    try {
      // First try geolocation for more accurate timezone detection
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Use the browser's timezone as fallback since geolocation doesn't directly give timezone
            const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
            setSelectedTimezone(detectedTimezone)
            onTimezoneChange(detectedTimezone)
            setOpen(false) // Close the popover
          },
          () => {
            // If geolocation fails, just use browser timezone
            const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
            setSelectedTimezone(detectedTimezone)
            onTimezoneChange(detectedTimezone)
            setOpen(false) // Close the popover
          }
        )
      } else {
        // Fallback to browser timezone
        const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        setSelectedTimezone(detectedTimezone)
        setOpen(false) // Close the popover
      }
    } catch (error) {
      // Final fallback
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      setSelectedTimezone(detectedTimezone)
      setOpen(false) // Close the popover
    }
  }

  const handleSave = () => {
    onTimezoneChange(selectedTimezone)
    onTimeFormatChange(selectedTimeFormat)
    onHidePreviousChange(selectedHidePrevious)
    onClose()
  }

  // Get the current timezone label for display
  const getCurrentTimezoneLabel = () => {
    const current = ALL_TIMEZONES.find(tz => tz.value === selectedTimezone)
    return current ? current.label : selectedTimezone
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/50 z-50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 bg-white z-50 transition-transform duration-300 ease-out",
        isOpen ? "translate-y-0" : "translate-y-full"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Settings</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Timezone Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-medium text-foreground">Timezone</Label>
              <button
                onClick={handleAutoDetect}
                className="text-xs text-primary underline hover:no-underline transition-all"
              >
                Auto detect
              </button>
            </div>
            
            {/* Combobox */}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between p-2"
                >
                  {getCurrentTimezoneLabel()}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[var(--radix-popover-trigger-width)] p-0 bg-white" align="start">
                <Command>
                  <CommandInput placeholder="Search timezones..." />
                  <CommandList className="max-h-[150px]">
                    <CommandEmpty>No timezone found.</CommandEmpty>
                    <CommandGroup>
                      {ALL_TIMEZONES.map((tz) => (
                        <CommandItem
                          key={tz.value}
                          value={tz.label}
                          onSelect={() => {
                            setSelectedTimezone(tz.value)
                            onTimezoneChange(tz.value)
                            setOpen(false)
                          }}
                          className={cn(
                            "justify-between",
                            selectedTimezone === tz.value && "bg-primary text-white"
                          )}
                        >
                          {tz.label}
                          <Check
                            className={cn(
                              "ml-2 h-4 w-4",
                              selectedTimezone === tz.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Format */}
          <div className="space-y-2">
            <Label className="text-lg font-medium text-foreground">Time Format</Label>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className={cn("text-sm font-medium", selectedTimeFormat === '24h' ? "text-foreground" : "text-muted-foreground")}>
                  24h
                </span>
                <Switch
                  checked={selectedTimeFormat === '12h'}
                  onCheckedChange={(checked) => {
                    const newFormat = checked ? '12h' : '24h'
                    setSelectedTimeFormat(newFormat)
                    onTimeFormatChange(newFormat)
                  }}
                />
                <span className={cn("text-sm font-medium", selectedTimeFormat === '12h' ? "text-foreground" : "text-muted-foreground")}>
                  12h
                </span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedTimeFormat === '12h' ? '12-hour (3:00 PM)' : '24-hour (15:00)'}
            </div>
          </div>

          {/* Hide Previous Fixtures */}
          <div className="space-y-2">
            <Label className="text-lg font-medium text-foreground">Hide Previous Fixtures</Label>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Only show upcoming matches</div>
              </div>
              <Switch
                checked={selectedHidePrevious}
                onCheckedChange={(checked) => {
                  setSelectedHidePrevious(checked)
                  onHidePreviousChange(checked)
                }}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <Button 
            onClick={handleSave} 
            className="w-full py-4 text-lg font-medium bg-primary text-white"
          >
            Done
          </Button>
        </div>
      </div>
    </>
  )
}