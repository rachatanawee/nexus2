import { User } from '@supabase/supabase-js'

// Permission helpers
export function hasRole(user: User | null, role: string): boolean {
  if (!user) return false
  const roles = user.app_metadata?.roles || []
  return roles.includes(role)
}

export function hasAnyRole(user: User | null, roles: string[]): boolean {
  if (!user) return false
  const userRoles = user.app_metadata?.roles || []
  return roles.some(role => userRoles.includes(role))
}

export function hasAllRoles(user: User | null, roles: string[]): boolean {
  if (!user) return false
  const userRoles = user.app_metadata?.roles || []
  return roles.every(role => userRoles.includes(role))
}

export function isAdmin(user: User | null): boolean {
  return hasRole(user, 'admin')
}

export function isManager(user: User | null): boolean {
  return hasRole(user, 'manager')
}

// UI Permission check
export function canAccessScreen(user: User | null, requiredRoles: string[]): boolean {
  return hasAnyRole(user, requiredRoles)
}
