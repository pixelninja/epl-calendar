import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, Download, Smartphone, CheckCircle } from '@/components/icons'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import { cn } from '@/lib/utils'

interface PWAInstallPromptProps {
  className?: string
}

export function PWAInstallPrompt({ className }: PWAInstallPromptProps) {
  const {
    isInstallable,
    isInstalled,
    canShowPrompt,
    showInstallPrompt,
    dismissPrompt,
    isIOS,
    isStandalone
  } = usePWAInstall()
  
  const [showDialog, setShowDialog] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  // Show dialog after user has interacted with the app (to avoid immediate popup)
  useEffect(() => {
    if (isInstallable && canShowPrompt && hasInteracted && !showDialog && !isInstalled) {
      // For iOS, show immediately after interaction since we can't auto-install
      // For other platforms, add a small delay
      const delay = isIOS ? 1000 : 3000
      const timer = setTimeout(() => {
        setShowDialog(true)
      }, delay)
      
      return () => clearTimeout(timer)
    }
  }, [isInstallable, canShowPrompt, hasInteracted, showDialog, isInstalled, isIOS])

  // Track user interaction to show prompt at appropriate time
  useEffect(() => {
    const handleUserInteraction = () => {
      setHasInteracted(true)
    }

    // Listen for any user interaction
    const events = ['click', 'scroll', 'touchstart', 'keydown']
    events.forEach(event => {
      window.addEventListener(event, handleUserInteraction, { once: true })
    })

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserInteraction)
      })
    }
  }, [])

  const handleInstall = async () => {
    if (isIOS) {
      // For iOS, just show the dialog with instructions
      return
    }

    setIsInstalling(true)
    const success = await showInstallPrompt()
    setIsInstalling(false)
    
    if (success) {
      setShowDialog(false)
      setShowSuccess(true)
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000)
    } else {
      setShowDialog(false)
    }
  }

  const handleDismiss = () => {
    dismissPrompt()
    setShowDialog(false)
  }

  // Don't render if already installed or can't show prompt
  if (isInstalled || isStandalone || !canShowPrompt) {
    return null
  }

  // Success message after installation
  if (showSuccess) {
    return (
      <div className={cn(
        "fixed bottom-4 left-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg z-50 animate-in slide-in-from-bottom-2",
        className
      )}>
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">App Installed Successfully!</p>
            <p className="text-xs text-green-600">You can now access EPL Calendar from your home screen</p>
          </div>
        </div>
      </div>
    )
  }

  // Install prompt dialog
  if (showDialog) {
    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 z-50" onClick={handleDismiss} />
        
        {/* Dialog */}
        <div className="fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-lg animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <Smartphone className="h-6 w-6 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Install EPL Calendar</h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleDismiss}
              className="p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Add EPL Calendar to your home screen for quick access to fixtures, scores, and notifications.
              </p>
              
              {/* Benefits */}
              <div className="grid grid-cols-3 gap-4 text-center py-4">
                <div>
                  <Smartphone className="h-6 w-6 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground">Native feel</p>
                </div>
                <div>
                  <Download className="h-6 w-6 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground">Offline access</p>
                </div>
                <div>
                  <CheckCircle className="h-6 w-6 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground">Fast loading</p>
                </div>
              </div>
              
              {isIOS && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left space-y-2">
                  <p className="text-sm font-medium text-blue-800">To install on iOS:</p>
                  <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Tap the Share button in Safari</li>
                    <li>Scroll down and tap "Add to Home Screen"</li>
                    <li>Tap "Add" to confirm</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="p-6 border-t border-border space-y-3">
            {!isIOS && (
              <Button 
                onClick={handleInstall}
                disabled={isInstalling}
                className="w-full py-3 text-base font-medium bg-primary text-white"
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
            )}
            
            <Button 
              variant="ghost" 
              onClick={handleDismiss}
              className="w-full py-3 text-base"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </>
    )
  }

  // Compact install button (shown in header when installable)
  if (isInstallable && canShowPrompt && hasInteracted) {
    return (
      <Button
        onClick={() => setShowDialog(true)}
        variant="ghost"
        size="sm"
        className={cn("flex items-center gap-2 text-sm", className)}
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Install</span>
      </Button>
    )
  }

  return null
}