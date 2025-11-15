'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { hasAnyRole } from '@/lib/permissions'
import { User } from '@supabase/supabase-js'

interface RoleGuardProps {
  children: React.ReactNode
  requiredRoles: string[]
  fallback?: React.ReactNode
}

export function RoleGuard({ children, requiredRoles, fallback }: RoleGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })
  }, [])

  if (loading) return null
  if (!hasAnyRole(user, requiredRoles)) return fallback || null

  return <>{children}</>
}
