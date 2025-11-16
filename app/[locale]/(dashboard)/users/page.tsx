import { getTranslations } from 'next-intl/server'
import { UserTable } from './_components/user-table'
import { getAuthUsers } from './_lib/queries'

export default async function UsersPage() {
  const { data: users } = await getAuthUsers()
  const t = await getTranslations('dashboard')

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t('users')}</h1>
      <UserTable data={users || []} totalItems={users?.length || 0} />
    </div>
  )
}
