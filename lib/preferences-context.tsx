'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { getSystemFormatSettings } from './format-utils'

interface PreferencesContextType {
  settings: any
  refreshSettings: () => Promise<void>
  isLoading: boolean
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined)

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)

  const refreshSettings = async () => {
    try {
      setIsLoading(true)
      const newSettings = await getSystemFormatSettings()
      setSettings(newSettings)
    } catch (error) {
      console.error('Failed to load preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshSettings()
  }, [])

  return (
    <PreferencesContext.Provider value={{ settings, refreshSettings, isLoading }}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider')
  }
  return context
}