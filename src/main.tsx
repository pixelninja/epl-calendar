import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createPersistentQueryClient, persister, warmCache } from '@/lib/persistent-cache'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { ScreenReaderProvider } from '@/contexts/ScreenReaderContext'
import './index.css'
import App from './App.tsx'

const queryClient = createPersistentQueryClient()

// Warm the cache with frequently accessed data
warmCache(queryClient)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {persister ? (
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
        <SettingsProvider>
          <ScreenReaderProvider>
            <App />
          </ScreenReaderProvider>
        </SettingsProvider>
      </PersistQueryClientProvider>
    ) : (
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <ScreenReaderProvider>
            <App />
          </ScreenReaderProvider>
        </SettingsProvider>
      </QueryClientProvider>
    )}
  </StrictMode>,
)
