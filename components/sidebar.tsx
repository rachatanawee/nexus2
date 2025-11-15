'use client'

import { LayoutDashboard, Users, Settings, LogOut, ChevronLeft, ChevronRight, Languages, Package, ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { logout } from '@/lib/actions/auth'
import { Button } from './ui/button'
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'

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
  const [isPending, startTransition] = useTransition()
  const [inventoryOpen, setInventoryOpen] = useState(pathname.includes('/inventory'))

  const switchLocale = () => {
    const newLocale = locale === 'en' ? 'th' : 'en'
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPath)
  }

  const handleLogout = () => {
    startTransition(async () => {
      await logout()
    })
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
        <div>
          <button
            onClick={() => setInventoryOpen(!inventoryOpen)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${pathname.includes(`/${locale}/inventory`) ? 'bg-[hsl(var(--color-accent))]' : 'hover:bg-[hsl(var(--color-accent))]'} ${collapsed ? 'justify-center' : ''}`}
          >
            <Package className="h-5 w-5" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">Inventory</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${inventoryOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>
          {!collapsed && inventoryOpen && (
            <div className="ml-8 mt-1 space-y-1">
              <Link href={`/${locale}/inventory/products`} className={`block rounded-lg px-3 py-2 text-sm ${pathname === `/${locale}/inventory/products` ? 'bg-[hsl(var(--color-accent))]' : 'hover:bg-[hsl(var(--color-accent))]'}`}>
                Products
              </Link>
              <Link href={`/${locale}/inventory/warehouses`} className={`block rounded-lg px-3 py-2 text-sm ${pathname === `/${locale}/inventory/warehouses` ? 'bg-[hsl(var(--color-accent))]' : 'hover:bg-[hsl(var(--color-accent))]'}`}>
                Warehouses
              </Link>
            </div>
          )}
        </div>
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
        <Button
          variant="ghost"
          className={`w-full ${collapsed ? 'justify-center px-0' : 'justify-start'}`}
          onClick={handleLogout}
          disabled={isPending}
        >
          <LogOut className={`h-5 w-5 ${collapsed ? '' : 'mr-2'}`} />
          {!collapsed && tAuth('logout')}
        </Button>
      </div>
    </div>
  )
}
