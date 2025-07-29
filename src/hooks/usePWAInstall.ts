import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface UsePWAInstallReturn {
  isInstallable: boolean
  isInstalled: boolean
  canShowPrompt: boolean
  showInstallPrompt: () => Promise<boolean>
  dismissPrompt: () => void
  isIOS: boolean
  isStandalone: boolean
}

export function usePWAInstall(): UsePWAInstallReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [canShowPrompt, setCanShowPrompt] = useState(true)

  // Detect if running on iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  
  // Detect if app is running in standalone mode (already installed)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone === true

  useEffect(() => {
    // Check if user has already dismissed the prompt
    const hasPromptBeenDismissed = localStorage.getItem('pwa-install-dismissed')
    if (hasPromptBeenDismissed) {
      setCanShowPrompt(false)
    }

    // Check if app is already installed
    if (isStandalone) {
      setIsInstalled(true)
      setCanShowPrompt(false)
    }

    // For iOS, we need to show manual install instructions since beforeinstallprompt doesn't fire
    if (isIOS && !isStandalone && !hasPromptBeenDismissed) {
      setIsInstallable(true)
      setCanShowPrompt(true)
    }

    // Listen for the beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const installEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(installEvent)
      setIsInstallable(true)
    }

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setCanShowPrompt(false)
      setDeferredPrompt(null)
      // Clear any dismissed flag since app is now installed
      localStorage.removeItem('pwa-install-dismissed')
    }

    // Only add these listeners for non-iOS devices
    if (!isIOS) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.addEventListener('appinstalled', handleAppInstalled)
    }

    return () => {
      if (!isIOS) {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.removeEventListener('appinstalled', handleAppInstalled)
      }
    }
  }, [isStandalone, isIOS])

  const showInstallPrompt = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt()
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setIsInstalled(true)
        setCanShowPrompt(false)
      }
      
      // Clean up
      setDeferredPrompt(null)
      setIsInstallable(false)
      
      return outcome === 'accepted'
    } catch (error) {
      console.error('Error showing install prompt:', error)
      return false
    }
  }, [deferredPrompt])

  const dismissPrompt = useCallback(() => {
    // Mark prompt as dismissed in localStorage
    localStorage.setItem('pwa-install-dismissed', 'true')
    setCanShowPrompt(false)
  }, [])

  return {
    isInstallable: isInstallable && canShowPrompt && !isInstalled,
    isInstalled,
    canShowPrompt: canShowPrompt && !isInstalled,
    showInstallPrompt,
    dismissPrompt,
    isIOS,
    isStandalone
  }
}