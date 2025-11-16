import { ProfileForm } from './_components/profile-form'
import { PreferencesForm } from './_components/preferences-form'
import { getUserProfile, getUserPreferences } from './_lib/queries'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await getUserProfile()
  const { data: preferences } = await getUserPreferences()

  if (!profile) {
    redirect('/login')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold">Profile & Preferences</h1>
          <p className="text-gray-500">Manage your profile information and personal preferences</p>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2">
          <ProfileForm profile={profile} />
          <PreferencesForm preferences={preferences || []} />
        </div>
      </div>
    </DashboardLayout>
  )
}