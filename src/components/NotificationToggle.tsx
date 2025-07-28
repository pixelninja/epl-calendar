import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Bell, BellOff, AlertCircle } from '@/components/icons'
import { useNotifications } from '@/hooks/useNotifications'

interface NotificationToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  className?: string
}

export function NotificationToggle({ enabled, onToggle, className }: NotificationToggleProps) {
  const { permission, requestPermission, isSupported } = useNotifications()

  const handleToggle = async (checked: boolean) => {
    if (!isSupported) {
      return
    }

    if (checked && permission !== 'granted') {
      const result = await requestPermission()
      if (result === 'granted') {
        onToggle(true)
      }
    } else {
      onToggle(checked)
    }
  }

  if (!isSupported) {
    return (
      <div className={`flex items-center space-x-2 opacity-50 ${className}`}>
        <AlertCircle className="h-4 w-4 text-muted-foreground" />
        <Label className="text-sm text-muted-foreground">
          Notifications not supported
        </Label>
      </div>
    )
  }

  if (permission === 'denied') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <BellOff className="h-4 w-4 text-muted-foreground" />
        <Label className="text-sm text-muted-foreground">
          Notifications blocked
        </Label>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            alert('To enable notifications, please allow them in your browser settings.')
          }}
        >
          Help
        </Button>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex items-center space-x-1">
        {enabled && permission === 'granted' ? (
          <Bell className="h-4 w-4 text-primary" />
        ) : (
          <BellOff className="h-4 w-4 text-muted-foreground" />
        )}
        <Label 
          htmlFor="notification-toggle" 
          className="text-sm font-medium cursor-pointer"
        >
          Match Notifications
        </Label>
      </div>
      
      <Switch
        id="notification-toggle"
        checked={enabled && permission === 'granted'}
        onCheckedChange={handleToggle}
        disabled={permission !== 'granted'}
        className="data-[state=checked]:bg-primary"
      />
      
      {permission === 'default' && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={requestPermission}
          className="text-xs"
        >
          Enable
        </Button>
      )}
    </div>
  )
}