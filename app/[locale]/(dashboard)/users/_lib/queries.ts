import { createClient as createAdminClient } from '@supabase/supabase-js'

export async function getAuthUsers() {
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase.auth.admin.listUsers()
  
  if (error) return { data: null, error }

  const users = data.users.map(user => ({
    id: user.id,
    email: user.email || '',
    roles: user.app_metadata?.roles || [],
    created_at: user.created_at
  }))

  return { data: users, error: null }
}

export async function getUserById(id: string) {
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase.auth.admin.getUserById(id)
  
  if (error || !data.user) return { data: null, error }

  return {
    data: {
      id: data.user.id,
      email: data.user.email || '',
      roles: data.user.app_metadata?.roles || [],
      created_at: data.user.created_at
    },
    error: null
  }
}
