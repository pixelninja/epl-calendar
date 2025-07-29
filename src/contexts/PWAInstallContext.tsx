import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { usePWAInstall } from '@/hooks/usePWAInstall'

interface PWAInstallContextType {
  isInstallable: boolean
  isInstalled: boolean
  canShowPrompt: boolean
  showInstallPrompt: () => Promise<boolean>
  dismissPrompt: () => void
  isIOS: boolean
  isStandalone: boolean
}

const PWAInstallContext = createContext<PWAInstallContextType | undefined>(undefined)

interface PWAInstallProviderProps {
  children: ReactNode
}

export function PWAInstallProvider({ children }: PWAInstallProviderProps) {
  const pwaInstallState = usePWAInstall()

  return (
    <PWAInstallContext.Provider value={pwaInstallState}>
      {children}
    </PWAInstallContext.Provider>
  )
}

export function usePWAInstallContext(): PWAInstallContextType {
  const context = useContext(PWAInstallContext)
  if (context === undefined) {
    throw new Error('usePWAInstallContext must be used within a PWAInstallProvider')
  }
  return context
}