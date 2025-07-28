import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/query-client'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { ScreenReaderProvider } from '@/contexts/ScreenReaderContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <ScreenReaderProvider>
          <App />
        </ScreenReaderProvider>
      </SettingsProvider>
    </QueryClientProvider>
  </StrictMode>,
)
