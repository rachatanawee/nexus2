'use client'

import { createClient } from '@/lib/supabase/client'

export async function getSystemFormatSettings() {
  try {
    const supabase = createClient()
    
    // Get user preferences first
    const { data: { user } } = await supabase.auth.getUser()
    let userPrefs = {}
    
    if (user) {
      const { data: prefs } = await supabase
        .from('_user_preferences')
        .select('key, value')
        .eq('user_id', user.id)
        .in('key', ['date_format', 'number_format_locale', 'number_decimal_places', 'number_thousands_separator'])
      
      userPrefs = prefs?.reduce((acc, p) => ({ ...acc, [p.key]: p.value }), {}) || {}
    }
    
    // Get app settings as fallback
    const { data: appSettings } = await supabase
      .from('_app_settings')
      .select('key, value')
      .in('key', ['date_format', 'number_format_locale', 'number_decimal_places', 'number_thousands_separator'])
    
    const systemSettings = appSettings?.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}) || {}
    
    // User preferences override system settings
    return { ...systemSettings, ...userPrefs }
  } catch {
    return {}
  }
}

export function formatSystemDate(date: Date, systemFormat?: string) {
  const format = systemFormat || 'dd-MM-yyyy'
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