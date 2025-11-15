'use client'

import { Sidebar } from './sidebar'
import { PageTransition } from './page-transition'
import { useState } from 'react'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className="flex-1 bg-gray-50 p-6">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  )
}
