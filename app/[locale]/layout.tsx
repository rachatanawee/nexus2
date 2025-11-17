import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Toaster } from '@/components/toaster'
import { SettingsProvider } from '@/lib/settings-context'
import { PreferencesProvider } from '@/lib/preferences-context'
import { createClient } from '@/lib/supabase/server'
import '../globals.css'

const locales = ['en', 'th']

async function getAppSettings() {
  const supabase = await createClient()
  const { data } = await supabase.from('_app_settings').select('key, value')
  const { data: { user } } = await supabase.auth.getUser()
  const settings = data?.reduce((acc, { key, value }) => ({ ...acc, [key]: value || '' }), {} as Record<string, string>) || {}
  return { ...settings, user_email: user?.email || '' } as Record<string, string>
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  
  if (!locales.includes(locale)) {
    notFound()
  }

  const messages = await getMessages({ locale })
  const settings = await getAppSettings()

  return (
    <html lang={locale}>
      <head>
        <title>{settings.app_title || 'Nexus Admin'}</title>
        <meta name="description" content={settings.app_description || 'Admin Dashboard'} />
        {settings.favicon_url && <link rel="icon" href={settings.favicon_url} />}

      </head>
      <body>
        <SettingsProvider settings={settings}>
          <PreferencesProvider>
            <NextIntlClientProvider messages={messages}>
              {children}
              <Toaster />
            </NextIntlClientProvider>
          </PreferencesProvider>
        </SettingsProvider>
      </body>
    </html>
  )
}
