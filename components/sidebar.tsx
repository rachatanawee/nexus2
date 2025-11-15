'use client'

import { LayoutDashboard, Users, Settings, LogOut, ChevronLeft, ChevronRight, Languages } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { logout } from '@/lib/actions/auth'
import { Button } from './ui/button'
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const t = useTranslations('dashboard')
  const tAuth = useTranslations('auth')
  const params = useParams()
  const pathname = usePathname()
  const router = useRouter()
  const locale = params.locale as string

  const switchLocale = () => {
    const newLocale = locale === 'en' ? 'th' : 'en'
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPath)
  }

  return (
    <div className={`flex h-screen flex-col border-r bg-white transition-all ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex items-center justify-between border-b p-4">
        {!collapsed && <h2 className="text-xl font-bold">{t('title')}</h2>}
        <Button variant="ghost" size="icon" onClick={onToggle} className={collapsed ? 'mx-auto' : ''}>
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        <Link href={`/${locale}/dashboard`} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${pathname === `/${locale}/dashboard` ? 'bg-[hsl(var(--color-accent))]' : 'hover:bg-[hsl(var(--color-accent))]'} ${collapsed ? 'justify-center' : ''}`}>
          <LayoutDashboard className="h-5 w-5" />
          {!collapsed && t('overview')}
        </Link>
        <Link href={`/${locale}/users`} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${pathname === `/${locale}/users` ? 'bg-[hsl(var(--color-accent))]' : 'hover:bg-[hsl(var(--color-accent))]'} ${collapsed ? 'justify-center' : ''}`}>
          <Users className="h-5 w-5" />
          {!collapsed && t('users')}
        </Link>
        <Link href="#" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-[hsl(var(--color-accent))] ${collapsed ? 'justify-center' : ''}`}>
          <Settings className="h-5 w-5" />
          {!collapsed && t('settings')}
        </Link>
      </nav>
      <div className="border-t p-2 space-y-1">
        <Button variant="ghost" size="sm" className={`w-full ${collapsed ? 'justify-center px-0' : 'justify-start'}`} onClick={switchLocale}>
          <Languages className={`h-4 w-4 ${collapsed ? '' : 'mr-2'}`} />
          {!collapsed && (locale === 'en' ? 'ไทย' : 'EN')}
        </Button>
        <form action={logout}>
          <Button variant="ghost" className={`w-full ${collapsed ? 'justify-center px-0' : 'justify-start'}`} type="submit">
            <LogOut className={`h-5 w-5 ${collapsed ? '' : 'mr-2'}`} />
            {!collapsed && tAuth('logout')}
          </Button>
        </form>
      </div>
    </div>
  )
}
