'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { Download, Upload } from 'lucide-react'
import { toast } from 'sonner'

interface ThemeImportProps {
  onImport: (theme: Record<string, string>) => void
  currentTheme: Record<string, string>
}

export function ThemeImport({ onImport, currentTheme }: ThemeImportProps) {
  const [themeCode, setThemeCode] = useState('')

  const handleImport = () => {
    try {
      const cssVars = themeCode.match(/--[\w-]+:\s*[^;]+/g)
      if (!cssVars) {
        toast.error('Invalid theme format')
        return
      }

      const theme: Record<string, string> = {}
      cssVars.forEach(line => {
        const [key, value] = line.split(':').map(s => s.trim())
        let settingKey = key.replace('--', '').replace(/-/g, '_')
        if (settingKey.startsWith('color_')) {
          settingKey = 'theme_' + settingKey.replace('color_', '')
        } else if (settingKey === 'radius') {
          settingKey = 'theme_radius'
        }
        theme[settingKey] = value.replace(/rem|;/g, '').trim()
      })

      onImport(theme)
      setThemeCode('')
      toast.success('Theme imported - Click Save Changes to apply')
    } catch (error) {
      toast.error('Failed to import theme')
    }
  }

  const handleExport = () => {
    const css = `:root {
  --radius: ${currentTheme.theme_radius || '0.5'}rem;
  --color-background: ${currentTheme.theme_background || '0 0% 100%'};
  --color-foreground: ${currentTheme.theme_foreground || '240 10% 3.9%'};
  --color-card: ${currentTheme.theme_card || '0 0% 100%'};
  --color-card-foreground: ${currentTheme.theme_card_foreground || '240 10% 3.9%'};
  --color-primary: ${currentTheme.theme_primary || '240 5.9% 10%'};
  --color-primary-foreground: ${currentTheme.theme_primary_foreground || '0 0% 98%'};
  --color-secondary: ${currentTheme.theme_secondary || '240 4.8% 95.9%'};
  --color-secondary-foreground: ${currentTheme.theme_secondary_foreground || '240 5.9% 10%'};
  --color-muted: ${currentTheme.theme_muted || '240 4.8% 95.9%'};
  --color-muted-foreground: ${currentTheme.theme_muted_foreground || '240 3.8% 46.1%'};
  --color-accent: ${currentTheme.theme_accent || '240 4.8% 95.9%'};
  --color-accent-foreground: ${currentTheme.theme_accent_foreground || '240 5.9% 10%'};
  --color-border: ${currentTheme.theme_border || '240 5.9% 90%'};
  --color-ring: ${currentTheme.theme_ring || '240 5.9% 10%'};
}`
    navigator.clipboard.writeText(css)
    toast.success('Theme copied to clipboard')
  }

  return (
    <div className="space-y-2">
      <Textarea
        placeholder=":root {
  --radius: 0.5rem;
  --color-background: 0 0% 100%;
  --color-foreground: 240 10% 3.9%;
  ...
}"
        value={themeCode}
        onChange={(e) => setThemeCode(e.target.value)}
        rows={8}
        className="font-mono text-sm"
      />
      <div className="flex gap-2">
        <Button onClick={handleImport} disabled={!themeCode} size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  )
}
