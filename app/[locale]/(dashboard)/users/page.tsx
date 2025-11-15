import { getTranslations } from 'next-intl/server'
import { UserTable } from './_components/user-table'
import { getAuthUsers } from './_lib/queries'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/permissions'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  console.log('User:', user?.email)
  console.log('Raw app_metadata:', user?.app_metadata)
  console.log('Roles:', user?.app_metadata?.roles)
  console.log('Is Admin:', isAdmin(user))

  if (!user || !isAdmin(user)) {
    redirect('/dashboard')
  }

  const { data: users } = await getAuthUsers()
  const t = await getTranslations('dashboard')

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('users')}</h1>
      <UserTable data={users || []} totalItems={users?.length || 0} />
    </div>
  )
}
