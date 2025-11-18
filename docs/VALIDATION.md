# Zod Validation Guide

Complete form validation system using Zod schemas for type-safe client and server-side validation.

## Setup

### Dependencies
```bash
# Zod and form handling (already included)
bun add zod react-hook-form @hookform/resolvers
```

## Schema Structure

### Base Schemas

**lib/validations/common.ts:**
```typescript
import { z } from 'zod'

// Common field validations
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email format')

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
  .optional()

export const uuidSchema = z
  .string()
  .uuid('Invalid UUID format')

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type PaginationInput = z.infer<typeof paginationSchema>
```

### Authentication Schemas

**lib/validations/auth.ts:**
```typescript
import { z } from 'zod'
import { emailSchema, passwordSchema } from './common'

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  full_name: z.string().min(1, 'Full name is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const resetPasswordSchema = z.object({
  email: emailSchema,
})

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
```

### User Management Schemas

**lib/validations/user.ts:**
```typescript
import { z } from 'zod'
import { emailSchema, passwordSchema, phoneSchema, uuidSchema } from './common'

export const roleSchema = z.enum(['admin', 'manager', 'user'])

export const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  full_name: z.string().min(1, 'Full name is required'),
  phone: phoneSchema,
  roles: z.array(roleSchema).min(1, 'At least one role is required'),
})

export const updateUserSchema = z.object({
  id: uuidSchema,
  email: emailSchema,
  full_name: z.string().min(1, 'Full name is required'),
  phone: phoneSchema,
  roles: z.array(roleSchema).min(1, 'At least one role is required'),
})

export const deleteUserSchema = z.object({
  id: uuidSchema,
})

export const userProfileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  phone: phoneSchema,
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type DeleteUserInput = z.infer<typeof deleteUserSchema>
export type UserProfileInput = z.infer<typeof userProfileSchema>
export type Role = z.infer<typeof roleSchema>
```

### Business Logic Schemas

**lib/validations/inventory.ts:**
```typescript
import { z } from 'zod'
import { uuidSchema } from './common'

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
})

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be positive'),
  category_id: uuidSchema.optional(),
  sku: z.string().min(1, 'SKU is required'),
  stock_quantity: z.coerce.number().min(0, 'Stock quantity must be positive'),
})

export const warehouseSchema = z.object({
  name: z.string().min(1, 'Warehouse name is required'),
  address: z.string().min(1, 'Address is required'),
  capacity: z.coerce.number().min(1, 'Capacity must be positive'),
})

export type CategoryInput = z.infer<typeof categorySchema>
export type ProductInput = z.infer<typeof productSchema>
export type WarehouseInput = z.infer<typeof warehouseSchema>
```

## Server-Side Validation

### Server Actions

**app/[locale]/(dashboard)/users/_lib/actions.ts:**
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createUserSchema, deleteUserSchema } from '@/lib/validations/user'
import { supabase } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/permissions'

export async function createUser(formData: FormData) {
  // Check permissions
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdmin({ user })) {
    throw new Error('Unauthorized')
  }

  // Validate input
  const validatedFields = createUserSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    full_name: formData.get('full_name'),
    phone: formData.get('phone'),
    roles: formData.getAll('roles'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password, full_name, phone, roles } = validatedFields.data

  try {
    // Create user in Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name,
        phone,
        roles,
      },
    })

    if (authError) throw authError

    revalidatePath('/users')
    return { success: true }
  } catch (error) {
    return {
      errors: {
        _form: ['Failed to create user'],
      },
    }
  }
}

export async function deleteUser(formData: FormData) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!isAdmin({ user })) {
    throw new Error('Unauthorized')
  }

  const validatedFields = deleteUserSchema.safeParse({
    id: formData.get('id'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  try {
    const { error } = await supabase.auth.admin.deleteUser(validatedFields.data.id)
    if (error) throw error

    revalidatePath('/users')
    return { success: true }
  } catch (error) {
    return {
      errors: {
        _form: ['Failed to delete user'],
      },
    }
  }
}
```

### API Routes

**app/api/users/route.ts:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createUserSchema, paginationSchema } from '@/lib/validations'
import { supabase } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const validatedParams = paginationSchema.safeParse({
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
    search: searchParams.get('search'),
    sortBy: searchParams.get('sortBy'),
    sortOrder: searchParams.get('sortOrder'),
  })

  if (!validatedParams.success) {
    return NextResponse.json(
      { error: 'Invalid parameters', details: validatedParams.error.flatten() },
      { status: 400 }
    )
  }

  const { page, limit, search, sortBy, sortOrder } = validatedParams.data

  try {
    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })
      .range((page - 1) * limit, page * limit - 1)

    if (search) {
      query = query.ilike('full_name', `%${search}%`)
    }

    if (sortBy) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    }

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  const validatedFields = createUserSchema.safeParse(body)

  if (!validatedFields.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validatedFields.error.flatten() },
      { status: 400 }
    )
  }

  // Process validated data...
}
```

## Client-Side Validation

### React Hook Form Integration

**components/create-user-dialog.tsx:**
```typescript
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createUserSchema, type CreateUserInput } from '@/lib/validations/user'
import { createUser } from '@/app/[locale]/(dashboard)/users/_lib/actions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

export function CreateUserDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      password: '',
      full_name: '',
      phone: '',
      roles: [],
    },
  })

  async function onSubmit(values: CreateUserInput) {
    setIsLoading(true)
    
    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(item => formData.append(key, item))
      } else {
        formData.append(key, value)
      }
    })

    const result = await createUser(formData)

    if (result?.errors) {
      // Handle server validation errors
      Object.entries(result.errors).forEach(([field, messages]) => {
        if (field === '_form') {
          form.setError('root', { message: messages[0] })
        } else {
          form.setError(field as keyof CreateUserInput, { message: messages[0] })
        }
      })
    } else {
      setOpen(false)
      form.reset()
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create User</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="roles"
              render={() => (
                <FormItem>
                  <FormLabel>Roles</FormLabel>
                  <div className="space-y-2">
                    {['admin', 'manager', 'user'].map((role) => (
                      <FormField
                        key={role}
                        control={form.control}
                        name="roles"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(role)}
                                onCheckedChange={(checked) => {
                                  const updatedRoles = checked
                                    ? [...(field.value || []), role]
                                    : field.value?.filter((r) => r !== role) || []
                                  field.onChange(updatedRoles)
                                }}
                              />
                            </FormControl>
                            <FormLabel className="capitalize">{role}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <div className="text-sm text-red-500">
                {form.formState.errors.root.message}
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
```

### Search and Filter Validation

**components/users-table.tsx:**
```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const searchSchema = z.object({
  search: z.string().optional(),
  role: z.enum(['all', 'admin', 'manager', 'user']).default('all'),
  sortBy: z.enum(['email', 'full_name', 'created_at']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

type SearchInput = z.infer<typeof searchSchema>

export function UsersTable() {
  const form = useForm<SearchInput>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      search: '',
      role: 'all',
      sortBy: 'created_at',
      sortOrder: 'desc',
    },
  })

  function onSearch(values: SearchInput) {
    // Update URL params or trigger API call
    const params = new URLSearchParams()
    Object.entries(values).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value)
      }
    })
    // router.push(`/users?${params.toString()}`)
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSearch)} className="flex gap-4 mb-4">
          <FormField
            control={form.control}
            name="search"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Search users..." {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          
          <Button type="submit">Search</Button>
        </form>
      </Form>
      
      {/* Table component */}
    </div>
  )
}
```

## Advanced Validation Patterns

### Conditional Validation

```typescript
const productSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['physical', 'digital']),
  weight: z.number().optional(),
  downloadUrl: z.string().url().optional(),
}).refine((data) => {
  if (data.type === 'physical' && !data.weight) {
    return false
  }
  if (data.type === 'digital' && !data.downloadUrl) {
    return false
  }
  return true
}, {
  message: "Physical products require weight, digital products require download URL",
  path: ["type"],
})
```

### Transform and Preprocess

```typescript
const priceSchema = z
  .string()
  .transform((val) => parseFloat(val))
  .pipe(z.number().min(0, 'Price must be positive'))

const dateSchema = z
  .string()
  .transform((val) => new Date(val))
  .pipe(z.date())
```

### Custom Validation

```typescript
const uniqueEmailSchema = z
  .string()
  .email()
  .refine(async (email) => {
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()
    
    return !data
  }, {
    message: "Email already exists",
  })
```

## Error Handling

### Centralized Error Display

**components/form-error.tsx:**
```typescript
interface FormErrorProps {
  errors?: Record<string, string[]>
}

export function FormError({ errors }: FormErrorProps) {
  if (!errors || Object.keys(errors).length === 0) return null

  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="text-sm text-red-700">
        {Object.entries(errors).map(([field, messages]) => (
          <div key={field}>
            <strong className="capitalize">{field}:</strong> {messages[0]}
          </div>
        ))}
      </div>
    </div>
  )
}
```

### Toast Notifications

```typescript
import { toast } from 'sonner'

function handleValidationError(error: z.ZodError) {
  const firstError = error.errors[0]
  toast.error(`${firstError.path.join('.')}: ${firstError.message}`)
}
```

## Testing Validation

### Schema Testing

```typescript
// __tests__/lib/validations/user.test.ts
import { createUserSchema } from '@/lib/validations/user'

describe('User Validation', () => {
  describe('createUserSchema', () => {
    it('validates correct user data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
        full_name: 'Test User',
        roles: ['user'],
      }

      const result = createUserSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('rejects invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Password123',
        full_name: 'Test User',
        roles: ['user'],
      }

      const result = createUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toBe('Invalid email format')
    })

    it('requires at least one role', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'Password123',
        full_name: 'Test User',
        roles: [],
      }

      const result = createUserSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })
  })
})
```

## Best Practices

### Schema Organization
- Group related schemas in separate files
- Use common schemas for reusable validations
- Export both schema and inferred types
- Use descriptive error messages

### Performance
- Use `.safeParse()` for error handling
- Cache compiled schemas when possible
- Avoid complex async validations in forms
- Use transforms sparingly

### Type Safety
- Always export inferred types
- Use schemas as single source of truth
- Validate at boundaries (API, forms)
- Keep client and server validation in sync

### Error Messages
- Provide clear, actionable messages
- Use field-specific error paths
- Support internationalization
- Include context when helpful

This validation system ensures data integrity across the entire application while providing excellent developer experience with full type safety.