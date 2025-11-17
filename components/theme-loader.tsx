'use client'

import { useEffect } from 'react'
import { useSettings } from '@/lib/settings-context'

export function ThemeLoader() {
  const settings = useSettings()

  useEffect(() => {
    const theme = settings.theme_name || 'tangerine'
    document.documentElement.setAttribute('data-theme', theme)
    
    const existingLink = document.querySelector('link[data-theme-link]')
    if (existingLink) {
      existingLink.remove()
    }
    
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `/themes/${theme}.css`
    link.setAttribute('data-theme-link', 'true')
    document.head.appendChild(link)
  }, [settings.theme_name])

  return null
}
