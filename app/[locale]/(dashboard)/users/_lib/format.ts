'use client'

import { formatSystemDate } from '@/lib/format-utils'
import { usePreferences } from '@/lib/preferences-context'

export function useFormatSettings() {
  const { settings } = usePreferences()
  return settings
}

export function formatDate(date: Date, settings?: any) {
  return formatSystemDate(date, settings?.date_format)
}