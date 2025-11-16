'use client'

import { getSystemFormatSettings, formatSystemDate, formatSystemNumber } from '@/lib/format-utils'
import { useEffect, useState } from 'react'

export function useFormatSettings() {
  const [settings, setSettings] = useState<any>({})
  
  useEffect(() => {
    getSystemFormatSettings().then(setSettings)
  }, [])
  
  return settings
}

export function formatNumber(value: number, settings?: any) {
  return formatSystemNumber(value, settings)
}

export function formatDate(date: Date, settings?: any) {
  return formatSystemDate(date, settings?.date_format)
}
