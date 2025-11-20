'use client'

import { Sidebar } from './sidebar'
import { PageTransition } from './page-transition'
import { useState, useEffect } from 'react'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    document.body.style.cursor = 'default'
  }, [])

  return (
    <div className="flex">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`flex-1 bg-gray-50 p-6 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-56'}`}>
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  )
}
