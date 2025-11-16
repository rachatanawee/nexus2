'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { updateProfile } from '../_lib/actions'
import { useState, useActionState, useEffect, useTransition } from 'react'
import { toast } from 'sonner'
import { User, Save, RotateCcw } from 'lucide-react'
import type { UserProfile } from '../_lib/types'

interface ProfileFormProps {
  profile: UserProfile
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [values, setValues] = useState({
    full_name: profile.full_name || '',
    phone: profile.phone || '',
    bio: profile.bio || ''
  })
  const [hasChanges, setHasChanges] = useState(false)

  const [state, formAction] = useActionState(updateProfile, {
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

  const handleChange = (field: string, value: string) => {
    setValues({ ...values, [field]: value })
    setHasChanges(true)
  }

  const handleReset = () => {
    setValues({
      full_name: profile.full_name || '',
      phone: profile.phone || '',
      bio: profile.bio || ''
    })
    setHasChanges(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    startTransition(() => {
      formAction(formData)
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <CardTitle>Profile Information</CardTitle>
        </div>
        <CardDescription>
          Update your personal information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={profile.email} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              name="full_name"
              value={values.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={values.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={values.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={!hasChanges || isPending} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {isPending ? 'Saving...' : 'Save Profile'}
            </Button>
            <Button type="button" variant="outline" onClick={handleReset} disabled={!hasChanges}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}