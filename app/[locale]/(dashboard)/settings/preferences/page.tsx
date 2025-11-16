import { PreferencesForm } from './_components/preferences-form'
import { getUserPreferences } from './_lib/queries'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PreferencesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: preferences } = await getUserPreferences()

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Preferences</h1>
        <p className="text-gray-500">Manage your personal preferences and settings</p>
      </div>
      <PreferencesForm preferences={preferences || []} />
    </div>
  )
}