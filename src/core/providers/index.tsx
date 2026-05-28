'use client'

import { QueryProvider } from './query-provider'
import { ThemeProvider } from '@/core/components/theme-provider'

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryProvider>
  )
}