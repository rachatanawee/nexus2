'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateSettings } from '../_lib/actions'
import { useState, useActionState, useEffect, useTransition } from 'react'
import { toast } from 'sonner'
import { Settings, Palette, Sliders, Save, RotateCcw } from 'lucide-react'
import type { AppSetting } from '../_lib/types'
import { usePreferences } from '@/lib/preferences-context'

interface SettingsFormProps {
  settings: AppSetting[]
}

const categoryIcons = {
  general: Settings,
  appearance: Palette,
  preferences: Sliders
}

const categoryLabels = {
  general: 'General Settings',
  appearance: 'Appearance',
  preferences: 'Preferences'
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const { refreshSettings } = usePreferences()
  const initialValues = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value || '' }), {})
  const [values, setValues] = useState<Record<string, string>>(initialValues)
  const [hasChanges, setHasChanges] = useState(false)

  const [state, formAction] = useActionState(updateSettings, {
    success: false,
    message: ''
  })
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (state.success) {
      toast.success(state.message)
      setHasChanges(false)
      // Refresh cached preferences
      refreshSettings()
    } else if (state.message) {
      toast.error(state.message)
    }
  }, [state, refreshSettings])

  const handleChange = (key: string, value: string) => {
    setValues({ ...values, [key]: value })
    setHasChanges(true)
  }

  const handleReset = () => {
    setValues(initialValues)
    setHasChanges(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    formData.append('updates', JSON.stringify(values))
    startTransition(() => {
      formAction(formData)
    })
  }

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) acc[setting.category] = []
    acc[setting.category].push(setting)
    return acc
  }, {} as Record<string, AppSetting[]>)

  const renderInput = (setting: AppSetting) => {
    const value = values[setting.key]

    switch (setting.type) {
      case 'color':
        return (
          <div className="flex gap-2">
            <Input
              type="color"
              value={value}
              onChange={(e) => handleChange(setting.key, e.target.value)}
              className="w-20 h-10"
            />
            <Input
              type="text"
              value={value}
              onChange={(e) => handleChange(setting.key, e.target.value)}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
        )

      case 'select':
        if (setting.key === 'theme_mode') {
          return (
            <Select value={value} onValueChange={(v) => handleChange(setting.key, v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          )
        }
        if (setting.key === 'theme_name') {
          return (
            <Select value={value} onValueChange={(v) => handleChange(setting.key, v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tangerine">Tangerine</SelectItem>
                <SelectItem value="claude">Claude</SelectItem>
                <SelectItem value="clean-slate">Clean Slate</SelectItem>
                <SelectItem value="ocean-breeze">Ocean Breeze</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
              </SelectContent>
            </Select>
          )
        }
        if (setting.key === 'number_format_locale') {
          return (
            <Select value={value} onValueChange={(v) => handleChange(setting.key, v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en-US">English (US) - 1,234.56</SelectItem>
                <SelectItem value="th-TH">Thai - 1,234.56</SelectItem>
                <SelectItem value="de-DE">German - 1.234,56</SelectItem>
              </SelectContent>
            </Select>
          )
        }
        if (setting.key === 'number_thousands_separator') {
          return (
            <Select value={value} onValueChange={(v) => handleChange(setting.key, v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Yes - 1,234</SelectItem>
                <SelectItem value="false">No - 1234</SelectItem>
              </SelectContent>
            </Select>
          )
        }
        if (setting.key === 'currency_format') {
          return (
            <Select value={value} onValueChange={(v) => handleChange(setting.key, v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="THB">THB (฿)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
              </SelectContent>
            </Select>
          )
        }
        if (setting.key === 'date_format') {
          return (
            <Select value={value} onValueChange={(v) => handleChange(setting.key, v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/dd/yyyy">MM/dd/yyyy</SelectItem>
                <SelectItem value="dd/MM/yyyy">dd/MM/yyyy</SelectItem>
                <SelectItem value="yyyy-MM-dd">yyyy-MM-dd</SelectItem>
              </SelectContent>
            </Select>
          )
        }
        return <Input value={value} onChange={(e) => handleChange(setting.key, e.target.value)} />

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleChange(setting.key, e.target.value)}
            step="any"
            placeholder="0"
          />
        )

      case 'email':
        return (
          <Input
            type="email"
            value={value}
            onChange={(e) => handleChange(setting.key, e.target.value)}
          />
        )

      case 'url':
        return (
          <Input
            type="url"
            value={value}
            onChange={(e) => handleChange(setting.key, e.target.value)}
            placeholder="https://..."
          />
        )

      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleChange(setting.key, e.target.value)}
          />
        )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {['general', 'preferences', 'appearance'].map(category => {
        const categorySettings = groupedSettings[category]
        if (!categorySettings) return null
        
        const Icon = categoryIcons[category as keyof typeof categoryIcons] || Settings
        
        return (
          <Card key={category}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                <CardTitle>{categoryLabels[category as keyof typeof categoryLabels] || category}</CardTitle>
              </div>
              <CardDescription>
                Configure {category} settings for your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {categorySettings.map(setting => (
                <div key={setting.id} className="space-y-2">
                  <Label htmlFor={setting.key} className="flex items-center justify-between">
                    <span className="font-medium">
                      {setting.key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                    <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {setting.key}
                    </code>
                  </Label>
                  {renderInput(setting)}
                  {setting.description && (
                    <p className="text-sm text-gray-500">{setting.description}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })}

      <div className="flex gap-2 sticky bottom-4 bg-card p-4 rounded-lg border shadow-lg">
        <Button type="submit" disabled={!hasChanges || isPending} className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button type="button" variant="outline" onClick={handleReset} disabled={!hasChanges}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>
    </form>
  )
}
