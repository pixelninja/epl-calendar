import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { usePWAInstallContext } from '@/contexts/PWAInstallContext'
import { Bell, Globe, Download } from '@/components/icons'

interface AppHeaderProps {
  /** Current state of the application */
  state?: 'loading' | 'error' | 'normal'
  /** Whether to show the scores toggle */
  showScoresToggle?: boolean
  /** Current scores visibility state */
  showScores?: boolean
  /** Handler for scores toggle change */
  onScoresToggleChange?: (checked: boolean) => void
  /** Handler for timezone modal open */
  onTimezoneClick?: () => void
  /** Handler for notifications click */
  onNotificationsClick?: () => void
  /** Whether to hide previous fixtures (affects scores toggle visibility) */
  hidePreviousFixtures?: boolean
}

export function AppHeader({
  state = 'normal',
  showScoresToggle = true,
  showScores = false,
  onScoresToggleChange,
  onTimezoneClick,
  onNotificationsClick,
  hidePreviousFixtures = false
}: AppHeaderProps) {
  const showControls = state === 'normal'
  const shouldShowScoresToggle = showScoresToggle && !hidePreviousFixtures && showControls
  const { isInstallable, canShowPrompt, isInstalled, isStandalone } = usePWAInstallContext()
  
  // Show compact install button if installable and can show prompt
  const showInstallButton = isInstallable && canShowPrompt && !isInstalled && !isStandalone

  return (
    <header className="bg-primary text-white shadow-lg sticky top-0 z-40">
      <div className="px-4 py-4">
        <div className="flex items-stretch justify-between h-full">
          {/* Left: Logo and Title */}
          <div>
            <img 
              src="/images/EPL-Logo-Alternative.svg" 
              alt="Premier League Logo" 
              className="h-12 w-auto brightness-0 invert"
            />
            <div className="mt-4">
              <h1 className="text-sm font-bold text-white">EPL Calendar</h1>
              <h2 className="text-xs text-white/80">2025/26 Season</h2>
            </div>
          </div>

          {/* Right: Action Icons - only show in normal state */}
          {showControls && (
            <div className="flex flex-col items-end justify-between mt-2">
              <div className="flex items-center gap-4">
                {showInstallButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 text-white hover:bg-white/10"
                    aria-label="Install App"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="p-2 text-white hover:bg-white/10"
                  onClick={onTimezoneClick}
                  aria-label="Open timezone settings"
                >
                  <Globe className="h-5 w-5" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2 text-white hover:bg-white/10"
                  onClick={onNotificationsClick}
                  aria-label="Notification settings"
                >
                  <Bell className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Scores Toggle - conditionally rendered */}
              {shouldShowScoresToggle && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/80">Show Scores</span>
                  <Switch
                    checked={showScores}
                    onCheckedChange={onScoresToggleChange}
                    className="scale-75 data-[state=unchecked]:bg-white/20 data-[state=checked]:bg-secondary"
                    aria-label="Toggle score visibility"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}