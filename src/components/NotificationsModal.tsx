import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { X, Bell } from '@/components/icons'
import { NotificationToggle } from '@/components/NotificationToggle'
import type { NotificationSettings } from '@/contexts/SettingsContext'
import { cn } from '@/lib/utils'

interface NotificationsModalProps {
  isOpen: boolean
  onClose: () => void
  notificationSettings: NotificationSettings
  onNotificationSettingsChange: (settings: NotificationSettings) => void
}

export function NotificationsModal({
  isOpen,
  onClose,
  notificationSettings,
  onNotificationSettingsChange
}: NotificationsModalProps) {
  const [selectedNotificationSettings, setSelectedNotificationSettings] = useState(notificationSettings)

  const handleSave = () => {
    onNotificationSettingsChange(selectedNotificationSettings)
    onClose()
  }

  const handleNotificationToggle = (enabled: boolean) => {
    // This handles the browser notification permission
    // The actual notification settings are managed separately
    console.log('Notification permission toggle:', enabled)
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
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
          </div>
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
          {/* Browser Notification Permission */}
          <div className="space-y-2">
            <Label className="text-lg font-medium text-foreground">Browser Notifications</Label>
            <div className="text-sm text-muted-foreground mb-3">
              Allow browser notifications to receive match updates
            </div>
            <NotificationToggle 
              enabled={true} // This will be managed by the NotificationToggle component itself
              onToggle={handleNotificationToggle}
            />
          </div>

          {/* Notification Settings */}
          <div className="space-y-4">
            <Label className="text-lg font-medium text-foreground">Notification Preferences</Label>
            
            {/* Daily Reminders */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">Daily Game Reminders</div>
                  <div className="text-xs text-muted-foreground">Get notified about upcoming matches</div>
                </div>
                <Switch
                  checked={selectedNotificationSettings.dailyReminders}
                  onCheckedChange={(checked) => {
                    setSelectedNotificationSettings(prev => ({
                      ...prev,
                      dailyReminders: checked
                    }))
                  }}
                />
              </div>
              
              {selectedNotificationSettings.dailyReminders && (
                <div className="space-y-3 pl-4 border-l-2 border-border">
                  <div>
                    <Label className="text-sm text-muted-foreground">Tomorrow's Games</Label>
                    <div className="text-xs text-muted-foreground mb-1">
                      Get notified about tomorrow's fixtures
                    </div>
                    <input
                      type="time"
                      value={selectedNotificationSettings.tomorrowGamesTime}
                      onChange={(e) => {
                        setSelectedNotificationSettings(prev => ({
                          ...prev,
                          tomorrowGamesTime: e.target.value
                        }))
                      }}
                      className="w-full mt-1 px-3 py-2 border border-border rounded-md text-sm bg-background"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Today's Games</Label>
                    <div className="text-xs text-muted-foreground mb-1">
                      Morning reminder about today's matches
                    </div>
                    <input
                      type="time"
                      value={selectedNotificationSettings.todayGamesTime}
                      onChange={(e) => {
                        setSelectedNotificationSettings(prev => ({
                          ...prev,
                          todayGamesTime: e.target.value
                        }))
                      }}
                      className="w-full mt-1 px-3 py-2 border border-border rounded-md text-sm bg-background"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Favorite Team Reminders */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-foreground">Favorite Team Reminders</div>
                  <div className="text-xs text-muted-foreground">Special notifications for your team</div>
                </div>
                <Switch
                  checked={selectedNotificationSettings.favoriteTeamReminders}
                  onCheckedChange={(checked) => {
                    setSelectedNotificationSettings(prev => ({
                      ...prev,
                      favoriteTeamReminders: checked
                    }))
                  }}
                />
              </div>
              
              {selectedNotificationSettings.favoriteTeamReminders && (
                <div className="pl-4 border-l-2 border-border">
                  <Label className="text-sm text-muted-foreground">When to notify</Label>
                  <div className="text-xs text-muted-foreground mb-2">
                    Choose when to get reminders about your team's matches
                  </div>
                  <select
                    value={selectedNotificationSettings.advanceNotice}
                    onChange={(e) => {
                      setSelectedNotificationSettings(prev => ({
                        ...prev,
                        advanceNotice: e.target.value as 'day-before' | 'same-day' | 'both'
                      }))
                    }}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md text-sm bg-background"
                  >
                    <option value="day-before">Day before only</option>
                    <option value="same-day">Same day only</option>
                    <option value="both">Both day before and same day</option>
                  </select>
                </div>
              )}
            </div>

            {/* Kickoff Reminders */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-foreground">Kickoff Reminders</div>
                <div className="text-xs text-muted-foreground">Notify 1 hour before matches start</div>
              </div>
              <Switch
                checked={selectedNotificationSettings.kickoffReminders}
                onCheckedChange={(checked) => {
                  setSelectedNotificationSettings(prev => ({
                    ...prev,
                    kickoffReminders: checked
                  }))
                }}
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <div className="text-sm text-blue-800">
                <div className="font-medium mb-1">💡 Notification Examples:</div>
                <div className="text-xs space-y-1 text-blue-700">
                  <div>• "4 EPL games tomorrow! Arsenal vs Chelsea at 3:00 PM"</div>
                  <div>• "3 games today starting in 6 hours"</div>
                  <div>• "⚽ Arsenal kicks off in 1 hour vs Chelsea"</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <Button 
            onClick={handleSave} 
            className="w-full py-4 text-lg font-medium bg-primary text-white"
          >
            Save Notification Settings
          </Button>
        </div>
      </div>
    </>
  )
}