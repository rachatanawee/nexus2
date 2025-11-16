'use client'

import { useSettings } from '@/lib/settings-context'

export function SettingsAwareTitle({ children }: { children: string }) {
  const settings = useSettings()
  
  return (
    <div className="flex items-center gap-2">
      {settings.logo_url && (
        <img src={settings.logo_url} alt="Logo" className="h-8 w-8" />
      )}
      <h2 className="text-xl font-bold">{children}</h2>
    </div>
  )
}
