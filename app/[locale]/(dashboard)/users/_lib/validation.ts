import { z } from 'zod'

export const AVAILABLE_ROLES = ['admin', 'manager', 'user'] as const

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  roles: z.array(z.enum(AVAILABLE_ROLES)).min(1, 'At least one role must be selected')
})

export type CreateUserFormData = z.infer<typeof createUserSchema>
