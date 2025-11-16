import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Toaster } from '@/components/toaster'
import { SettingsProvider } from '@/lib/settings-context'
import { createClient } from '@/lib/supabase/server'
import '../globals.css'

const locales = ['en', 'th']

async function getAppSettings() {
  const supabase = await createClient()
  const { data } = await supabase.from('app_settings').select('key, value')
  const { data: { user } } = await supabase.auth.getUser()
  const settings = data?.reduce((acc, { key, value }) => ({ ...acc, [key]: value || '' }), {}) || {}
  return { ...settings, user_email: user?.email || '' }
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
        {settings.theme_name && <link rel="stylesheet" href={`/themes/${settings.theme_name}.css`} />}

      </head>
      <body>
        <SettingsProvider settings={settings}>
          <NextIntlClientProvider messages={messages}>
            {children}
            <Toaster />
          </NextIntlClientProvider>
        </SettingsProvider>
      </body>
    </html>
  )
}
