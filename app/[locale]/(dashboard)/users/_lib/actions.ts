'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { createUserSchema } from './validation'
import type { ZodIssue } from 'zod'

type FormState = {
  success: boolean
  message: string
}

export async function createUser(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()
  const { data: { user: caller } } = await supabase.auth.getUser()

  if (!caller || !caller.app_metadata?.roles?.includes('admin')) {
    return { success: false, message: 'Access Denied' }
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const rolesInput = formData.get('roles') as string
  const roles = rolesInput.split(',').map(r => r.trim()).filter(Boolean)

  // Validate input data using shared Zod schema
  const validationResult = createUserSchema.safeParse({
    email,
    password,
    roles
  })

  if (!validationResult.success) {
    const errorMessages = validationResult.error.issues.map((err: ZodIssue) => err.message).join(', ')
    return { success: false, message: errorMessages }
  }

  const { error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { roles }
  })

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath('/users')
  return { success: true, message: 'User created successfully' }
}

export async function deleteUser(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()
  const { data: { user: caller } } = await supabase.auth.getUser()

  if (!caller || !caller.app_metadata?.roles?.includes('admin')) {
    return { success: false, message: 'Access Denied' }
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const userId = formData.get('userId') as string

  if (!userId) {
    return { success: false, message: 'User ID required' }
  }

  // Check if user is admin
  const { data: targetUser } = await supabaseAdmin.auth.admin.getUserById(userId)
  const isTargetAdmin = targetUser?.user?.app_metadata?.roles?.includes('admin')

  if (isTargetAdmin) {
    // Count remaining admins
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
    const adminCount = users.filter(u => u.app_metadata?.roles?.includes('admin')).length

    if (adminCount <= 1) {
      return { success: false, message: 'Cannot delete the last admin user' }
    }
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath('/users')
  return { success: true, message: 'User deleted successfully' }
}

export async function updateUserRole(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = await createClient()
  const { data: { user: caller } } = await supabase.auth.getUser()

  if (!caller || !caller.app_metadata?.roles?.includes('admin')) {
    return { success: false, message: 'Access Denied' }
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const targetUserId = formData.get('targetUserId') as string
  const newRolesInput = formData.get('newRoles') as string
  const newRoles = newRolesInput.split(',').map(r => r.trim()).filter(Boolean)

  if (!targetUserId || newRoles.length === 0) {
    return { success: false, message: 'User ID and roles required' }
  }

  // Check if removing admin role from last admin
  const { data: targetUser } = await supabaseAdmin.auth.admin.getUserById(targetUserId)
  const wasAdmin = targetUser?.user?.app_metadata?.roles?.includes('admin')
  const willBeAdmin = newRoles.includes('admin')

  if (wasAdmin && !willBeAdmin) {
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
    const adminCount = users.filter(u => u.app_metadata?.roles?.includes('admin')).length

    if (adminCount <= 1) {
      return { success: false, message: 'Cannot remove admin role from the last admin user' }
    }
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(
    targetUserId,
    { app_metadata: { roles: newRoles } }
  )

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath('/users')
  return { success: true, message: 'Roles updated successfully' }
}
