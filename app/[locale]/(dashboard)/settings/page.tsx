import { SettingsForm } from './_components/settings-form'
import { getAppSettings } from './_lib/queries'

export default async function SettingsPage() {
  const { data: settings } = await getAppSettings()

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500">Manage your application configuration</p>
      </div>
      <SettingsForm settings={settings || []} />
    </div>
  )
}
