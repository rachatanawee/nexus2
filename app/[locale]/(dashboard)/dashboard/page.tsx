import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/dashboard-layout'
import { getAppSettings } from '../settings/_lib/queries'
import { getAuthUsers } from '../users/_lib/queries'
import Link from 'next/link'
import { User, Users, Settings } from 'lucide-react'

interface DashboardPageProps {
  params: Promise<{ locale: string }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/en/login')
  }

  const t = await getTranslations('dashboard')

  // Fetch users count
  const { data: users } = await getAuthUsers()
  const userCount = users?.length || 0

  // Fetch general settings
  const { data: settings } = await getAppSettings()
  const generalSettings = settings?.filter(setting => setting.category === 'general') || []

  return (
    <DashboardLayout>
      <h1 className="mb-6 text-2xl font-bold">{t('overview')}</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Welcome</CardTitle>
            <User className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[hsl(var(--color-muted-foreground))]">{user.email}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('users')}</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{userCount}</div>
          </CardContent>
        </Card>
        <Link href={`/${locale}/settings`}>
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('settings')}</CardTitle>
              <Settings className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-[hsl(var(--color-muted-foreground))]">Configure your app</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* General Settings Section */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">General Settings</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {generalSettings.map(setting => (
            <Card key={setting.id}>
              <CardHeader>
                <CardTitle className="text-sm">
                  {setting.key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">
                  {setting.value || 'Not set'}
                </p>
                {setting.description && (
                  <p className="text-xs text-[hsl(var(--color-muted-foreground))] mt-1">
                    {setting.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
