import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Smartphone, Download, X, CheckCircle } from '@/components/icons'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAInstallPromptProps {
  isOpen: boolean
  onClose: () => void
}

export function PWAInstallPrompt({ isOpen, onClose }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalling, setIsInstalling] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    setIsInstalling(true)
    
    try {
      await deferredPrompt.prompt()
      const choiceResult = await deferredPrompt.userChoice
      
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true)
      }
    } catch (error) {
      console.error('Error during PWA installation:', error)
    } finally {
      setIsInstalling(false)
      setDeferredPrompt(null)
    }
  }

  const getManualInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      return {
        browser: 'Chrome',
        steps: [
          'Tap the menu button (⋮) in the top right corner',
          'Select "Add to Home Screen" or "Install app"',
          'Tap "Add" to confirm'
        ]
      }
    }
    
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return {
        browser: 'Safari',
        steps: [
          'Tap the share button (□↗) at the bottom of the screen',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to confirm'
        ]
      }
    }
    
    if (userAgent.includes('firefox')) {
      return {
        browser: 'Firefox',
        steps: [
          'Tap the menu button (⋮) in the top right corner',
          'Select "Install" or "Add to Home Screen"',
          'Tap "Add" to confirm'
        ]
      }
    }
    
    return {
      browser: 'your browser',
      steps: [
        'Look for an "Install" or "Add to Home Screen" option in your browser menu',
        'Follow the prompts to add the app to your device'
      ]
    }
  }

  const instructions = getManualInstructions()

  if (isInstalled) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-success" />
              <DialogTitle>App Installed Successfully!</DialogTitle>
            </div>
            <DialogDescription>
              EPL Calendar has been added to your home screen. You can now use it like a native app!
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button onClick={onClose} className="w-full">
              Great!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Download className="h-6 w-6 text-primary" />
            <DialogTitle>Install EPL Calendar</DialogTitle>
          </div>
          <DialogDescription>
            Get the full app experience with offline access and push notifications.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <Card className="p-3">
              <CardContent className="p-0">
                <Smartphone className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">Native app feel</p>
              </CardContent>
            </Card>
            <Card className="p-3">
              <CardContent className="p-0">
                <Download className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">Offline access</p>
              </CardContent>
            </Card>
            <Card className="p-3">
              <CardContent className="p-0">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-xs text-muted-foreground">Fast loading</p>
              </CardContent>
            </Card>
          </div>

          {deferredPrompt ? (
            <Button 
              onClick={handleInstall} 
              disabled={isInstalling}
              className="w-full"
              size="lg"
            >
              {isInstalling ? (
                <>Installing...</>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Install App
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium">To install in {instructions.browser}:</p>
              <ol className="space-y-1 text-sm text-muted-foreground">
                {instructions.steps.map((step, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="font-medium text-primary">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            <X className="h-4 w-4 mr-2" />
            Maybe Later
          </Button>
          {!deferredPrompt && (
            <Button onClick={onClose} className="flex-1">
              Got It
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Hook to manage PWA install prompt
export function usePWAInstall() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [canInstall, setCanInstall] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setCanInstall(true)
    }

    const handleAppInstalled = () => {
      setCanInstall(false)
      setShowPrompt(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = () => {
    setShowPrompt(true)
  }

  const closePrompt = () => {
    setShowPrompt(false)
  }

  return {
    showPrompt,
    canInstall,
    promptInstall,
    closePrompt,
  }
}