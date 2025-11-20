'use client'

import { LayoutDashboard, Users, Settings, LogOut, ChevronLeft, ChevronRight, Languages, Package, ChevronDown, User, FileText } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { logout } from '@/lib/actions/auth'
import { Button } from './ui/button'
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useTransition, useState, useEffect } from 'react'
import { useSettings } from '@/lib/settings-context'
import { createClient } from '@/lib/supabase/client'
import { isAdmin } from '@/lib/permissions'

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
  const [userIsAdmin, setUserIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUserIsAdmin(isAdmin(user))
    }
    checkAdmin()
  }, [])

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

  const settings = useSettings()

  return (
    <div className={`fixed left-0 top-0 flex h-screen flex-col border-r transition-all duration-300 ease-in-out z-50 ${collapsed ? 'w-16' : 'w-56'}`} style={{ backgroundColor: 'var(--sidebar)' }}>
      <div className="flex items-center justify-between border-b p-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            {settings.logo_url && <img src={settings.logo_url} alt="Logo" className="h-6 w-6" />}
            <h2 className="text-xl font-bold">{settings.app_title || t('title')}</h2>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={onToggle} className={collapsed ? 'mx-auto' : ''}>
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        <Link href={`/${locale}/dashboard`} className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-200 ${pathname === `/${locale}/dashboard` ? 'bg-primary text-primary-foreground rounded-lg' : 'rounded-lg hover:bg-accent/50'} ${collapsed ? 'justify-center' : ''}`}>
          <LayoutDashboard className="h-5 w-5" />
          {!collapsed && t('overview')}
        </Link>
        {userIsAdmin && (
          <Link href={`/${locale}/users`} className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-200 ${pathname === `/${locale}/users` ? 'bg-primary text-primary-foreground rounded-lg' : 'rounded-lg hover:bg-accent/50'} ${collapsed ? 'justify-center' : ''}`}>
            <Users className="h-5 w-5" />
            {!collapsed && t('users')}
          </Link>
        )}
        {userIsAdmin && (
          <Link href={`/${locale}/form-builder`} className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-200 ${pathname.includes(`/${locale}/form-builder`) ? 'bg-primary text-primary-foreground rounded-lg' : 'rounded-lg hover:bg-accent/50'} ${collapsed ? 'justify-center' : ''}`}>
            <FileText className="h-5 w-5" />
            {!collapsed && 'Form Builder'}
          </Link>
        )}
        <div>
          <button
            onClick={() => setInventoryOpen(!inventoryOpen)}
            className={`flex w-full items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-200 ${pathname.includes(`/${locale}/inventory`) ? 'bg-primary text-primary-foreground rounded-lg' : 'rounded-lg hover:bg-accent/50'} ${collapsed ? 'justify-center' : ''}`}
          >
            <Package className="h-5 w-5" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">Inventory</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${inventoryOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>
          {!collapsed && inventoryOpen && (
            <div className="ml-8 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-200">
              <Link href={`/${locale}/inventory/categories`} className={`block rounded-lg px-3 py-2 text-sm transition-all duration-200 ${pathname === `/${locale}/inventory/categories` ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/50'}`}>
                Categories
              </Link>
              <Link href={`/${locale}/inventory/products`} className={`block rounded-lg px-3 py-2 text-sm transition-all duration-200 ${pathname === `/${locale}/inventory/products` ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/50'}`}>
                Products
              </Link>
              <Link href={`/${locale}/inventory/warehouses`} className={`block rounded-lg px-3 py-2 text-sm transition-all duration-200 ${pathname === `/${locale}/inventory/warehouses` ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/50'}`}>
                Warehouses
              </Link>
              <Link href={`/${locale}/inventory/suppliers`} className={`block rounded-lg px-3 py-2 text-sm transition-all duration-200 ${pathname === `/${locale}/inventory/suppliers` ? 'bg-primary text-primary-foreground' : 'hover:bg-accent/50'}`}>
                Suppliers
              </Link>
            </div>
          )}
        </div>
        <Link href={`/${locale}/profile`} className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-200 ${pathname === `/${locale}/profile` ? 'bg-primary text-primary-foreground rounded-lg' : 'rounded-lg hover:bg-accent/50'} ${collapsed ? 'justify-center' : ''}`}>
          <User className="h-5 w-5" />
          {!collapsed && 'Profile'}
        </Link>
        {userIsAdmin && (
          <Link href={`/${locale}/settings`} className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-200 ${pathname === `/${locale}/settings` ? 'bg-primary text-primary-foreground rounded-lg' : 'rounded-lg hover:bg-accent/50'} ${collapsed ? 'justify-center' : ''}`}>
            <Settings className="h-5 w-5" />
            {!collapsed && t('settings')}
          </Link>
        )}
      </nav>
      <div className="border-t p-2 space-y-1">
        {!collapsed && (
          <div className="px-3 py-2 text-sm text-muted-foreground truncate">
            {settings.user_email || 'user@example.com'}
          </div>
        )}
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
