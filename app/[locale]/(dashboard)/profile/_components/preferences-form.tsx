'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { updatePreferences } from '../_lib/actions'
import { useState, useActionState, useEffect, useTransition } from 'react'
import { toast } from 'sonner'
import { Settings, Save, RotateCcw, User, Bell, Shield, Palette } from 'lucide-react'

interface PreferencesFormProps {
  preferences: any[]
}

const categoryIcons = {
  profile: User,
  notifications: Bell,
  privacy: Shield,
  appearance: Palette
}

const categoryLabels = {
  profile: 'Profile Settings',
  notifications: 'Notifications',
  privacy: 'Privacy & Security',
  appearance: 'Appearance'
}

export function PreferencesForm({ preferences }: PreferencesFormProps) {
  const initialValues = preferences.reduce((acc, p) => ({ ...acc, [p.key]: p.value || '' }), {})
  const [values, setValues] = useState<Record<string, string>>(initialValues)
  const [hasChanges, setHasChanges] = useState(false)

  const [state, formAction] = useActionState(updatePreferences, {
    success: false,
    message: ''
  })
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (state.success) {
      toast.success(state.message)
      setHasChanges(false)
    } else if (state.message) {
      toast.error(state.message)
    }
  }, [state])

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

  const renderInput = (preference: any) => {
    const value = values[preference.key]

    switch (preference.type) {
      case 'boolean':
        return (
          <Select value={value} onValueChange={(v) => handleChange(preference.key, v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectContent>
          </Select>
        )

      case 'select':
        if (preference.key === 'language') {
          return (
            <Select value={value} onValueChange={(v) => handleChange(preference.key, v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="th">ไทย</SelectItem>
              </SelectContent>
            </Select>
          )
        }
        if (preference.key === 'timezone') {
          return (
            <Select value={value} onValueChange={(v) => handleChange(preference.key, v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="Asia/Bangkok">Asia/Bangkok</SelectItem>
                <SelectItem value="America/New_York">America/New_York</SelectItem>
              </SelectContent>
            </Select>
          )
        }
        if (preference.key === 'theme_mode') {
          return (
            <Select value={value} onValueChange={(v) => handleChange(preference.key, v)}>
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
        if (preference.key === 'theme_name') {
          return (
            <Select value={value} onValueChange={(v) => handleChange(preference.key, v)}>
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
        if (preference.key === 'profile_visibility') {
          return (
            <Select value={value} onValueChange={(v) => handleChange(preference.key, v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="friends">Friends Only</SelectItem>
              </SelectContent>
            </Select>
          )
        }
        return <Input value={value} onChange={(e) => handleChange(preference.key, e.target.value)} />

      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleChange(preference.key, e.target.value)}
          />
        )
    }
  }

  const groupedPreferences = preferences.reduce((acc, pref) => {
    if (!acc[pref.category]) acc[pref.category] = []
    acc[pref.category].push(pref)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {['profile', 'notifications', 'privacy', 'appearance'].map(category => {
        const categoryPreferences = groupedPreferences[category]
        if (!categoryPreferences) return null
        
        const Icon = categoryIcons[category as keyof typeof categoryIcons] || Settings
        
        return (
          <Card key={category}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                <CardTitle>{categoryLabels[category as keyof typeof categoryLabels] || category}</CardTitle>
              </div>
              <CardDescription>
                Configure your {category} preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryPreferences.map((preference: any) => (
                <div key={preference.id} className="space-y-2">
                  <Label htmlFor={preference.key} className="flex items-center justify-between">
                    <span className="font-medium">
                      {preference.key.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                    <code className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {preference.key}
                    </code>
                  </Label>
                  {renderInput(preference)}
                  {preference.description && (
                    <p className="text-sm text-gray-500">{preference.description}</p>
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
          {isPending ? 'Saving...' : 'Save Preferences'}
        </Button>
        <Button type="button" variant="outline" onClick={handleReset} disabled={!hasChanges}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>
    </form>
  )
}