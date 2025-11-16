'use client'

import { createClient } from '@/lib/supabase/client'

export async function getSystemFormatSettings() {
  try {
    const supabase = createClient()
    const { data } = await supabase
      .from('_app_settings')
      .select('key, value')
      .in('key', ['date_format', 'number_format_locale', 'number_decimal_places', 'number_thousands_separator'])
    
    return data?.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}) || {}
  } catch {
    return {}
  }
}

export function formatSystemDate(date: Date, systemFormat?: string) {
  const format = systemFormat || 'MM/dd/yyyy'
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  switch (format) {
    case 'dd/MM/yyyy':
    case 'DD/MM/YYYY':
    case 'dd-MM-yyyy':
    case 'DD-MM-YYYY':
      return format.includes('-') ? `${day}-${month}-${year}` : `${day}/${month}/${year}`
    case 'yyyy-MM-dd':
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`
    default: 
      return `${month}/${day}/${year}`
  }
}

export function formatSystemNumber(value: number, settings?: any) {
  const locale = settings?.number_format_locale || 'en-US'
  const decimals = parseInt(settings?.number_decimal_places || '2')
  const useThousands = settings?.number_thousands_separator === 'true'
  
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: useThousands
  }).format(value)
}