'use client'

import { formatSystemDate, formatSystemNumber } from '@/lib/format-utils'
import { usePreferences } from '@/lib/preferences-context'

export function useFormatSettings() {
  const { settings } = usePreferences()
  return settings
}

export function formatNumber(value: number, settings?: any) {
  return formatSystemNumber(value, settings)
}

export function formatDate(date: Date, settings?: any) {
  // Use fallback if date_format is not available
  const dateFormat = settings?.date_format || 'dd-MM-yyyy'
  return formatSystemDate(date, dateFormat)
}