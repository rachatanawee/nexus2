'use client'

import { createContext, useContext, ReactNode } from 'react'

type Settings = {
  app_title: string
  app_description: string
  company_name: string
  support_email: string
  theme_mode: string
  theme_primary_color: string
  logo_url: string
  favicon_url: string
  items_per_page: string
  date_format: string
  timezone: string
  user_email: string
  theme_name: string
}

const SettingsContext = createContext<Settings | null>(null)

export function SettingsProvider({ children, settings }: { children: ReactNode; settings: Record<string, string> }) {
  return (
    <SettingsContext.Provider value={settings as Settings}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider')
  }
  return context
}
