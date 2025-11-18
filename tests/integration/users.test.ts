/* eslint-disable */
import { config } from 'dotenv'
config({ path: '.env.test' })

import { createUser, deleteUser, updateUserRole } from '@/app/[locale]/(dashboard)/users/_lib/actions'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// Mock Supabase client for authentication checks
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}))

// Mock next/cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}))

const mockCreateClient = createClient as jest.Mock

// Real Supabase admin client for integration testing
let supabaseAdmin: ReturnType<typeof createAdminClient>

// Store created test users for cleanup
const createdTestUsers: string[] = []

// Generate unique test email
const generateTestEmail = (): string => `test-user-${Date.now()}@${Math.random().toString(36).substring(7)}.com`

describe('Users Server Actions (Integration)', () => {
  beforeAll(() => {
    // Create real admin client for integration tests
    supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  })

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock the createClient for authentication checks
    const mockSupabaseClient = {
      auth: {
        getUser: jest.fn()
      }
    }
    mockCreateClient.mockResolvedValue(mockSupabaseClient)
  })

  afterEach(async () => {
    // Clean up created test users
    for (const userId of createdTestUsers) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(userId)
      } catch (error) {
        console.warn(`Failed to cleanup test user ${userId}:`, error)
      }
    }
    createdTestUsers.length = 0
  })

  describe('createUser', () => {
    it('should create user successfully with valid admin caller', async () => {
      // Arrange
      const adminCaller = {
        id: 'admin-123',
        app_metadata: { roles: ['admin'] }
      }

      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: adminCaller } })
        }
      }
      mockCreateClient.mockResolvedValue(mockSupabaseClient)

      const testEmail = generateTestEmail()
      const formData = new FormData()
      formData.append('email', testEmail)
      formData.append('password', 'password123')
      formData.append('roles', 'user,editor')

      // Act
      const result = await createUser({ success: false, message: '' }, formData)

      // Assert
      expect(result.success).toBe(true)
      expect(result.message).toBe('User created successfully')
      expect(revalidatePath).toHaveBeenCalledWith('/users')

      // Verify user was actually created in database
      const { data: users } = await supabaseAdmin.auth.admin.listUsers()
      const createdUser = users.users.find((u: any) => u.email === testEmail)
      expect(createdUser).toBeDefined()
      expect(createdUser?.app_metadata?.roles).toEqual(['user', 'editor'])

      // Store for cleanup
      if (createdUser?.id) {
        createdTestUsers.push(createdUser.id)
      }
    })

    it('should return error when caller is not authenticated', async () => {
      // Arrange
      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } })
        }
      }
      mockCreateClient.mockResolvedValue(mockSupabaseClient)

      const formData = new FormData()
      formData.append('email', 'newuser@example.com')
      formData.append('password', 'password123')

      // Act
      const result = await createUser({ success: false, message: '' }, formData)

      // Assert
      expect(result.success).toBe(false)
      expect(result.message).toBe('Access Denied')
    })

    it('should return error when caller is not admin', async () => {
      // Arrange
      const regularUser = {
        id: 'user-123',
        app_metadata: { roles: ['user'] }
      }

      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: regularUser } })
        }
      }
      mockCreateClient.mockResolvedValue(mockSupabaseClient)

      const formData = new FormData()
      formData.append('email', 'newuser@example.com')
      formData.append('password', 'password123')

      // Act
      const result = await createUser({ success: false, message: '' }, formData)

      // Assert
      expect(result.success).toBe(false)
      expect(result.message).toBe('Access Denied')
    })

    it('should return error when email or password is missing', async () => {
      // Arrange
      const adminCaller = {
        id: 'admin-123',
        app_metadata: { roles: ['admin'] }
      }

      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: adminCaller } })
        }
      }
      mockCreateClient.mockResolvedValue(mockSupabaseClient)

      const formData = new FormData()
      formData.append('email', 'newuser@example.com')
      formData.append('roles', 'user') // Provide roles to avoid split error
      // Missing password

      // Act
      const result = await createUser({ success: false, message: '' }, formData)

      // Assert
      expect(result.success).toBe(false)
      expect(result.message).toBe('Email and password required')
    })
  })

  describe('deleteUser', () => {
    it('should delete user successfully with valid admin caller', async () => {
      // First create a test user to delete
      const testEmail = generateTestEmail()
      const { data: createResult } = await supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: 'password123',
        email_confirm: true,
        app_metadata: { roles: ['user'] }
      })

      expect(createResult?.user?.id).toBeDefined()
      const userIdToDelete = createResult!.user!.id

      // Arrange
      const adminCaller = {
        id: 'admin-123',
        app_metadata: { roles: ['admin'] }
      }

      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: adminCaller } })
        }
      }
      mockCreateClient.mockResolvedValue(mockSupabaseClient)

      const formData = new FormData()
      formData.append('userId', userIdToDelete)

      // Act
      const result = await deleteUser({ success: false, message: '' }, formData)

      // Assert
      expect(result.success).toBe(true)
      expect(result.message).toBe('User deleted successfully')
      expect(revalidatePath).toHaveBeenCalledWith('/users')

      // Verify user was actually deleted from database
      const { data: users } = await supabaseAdmin.auth.admin.listUsers()
      const deletedUser = users.users.find((u: any) => u.id === userIdToDelete)
      expect(deletedUser).toBeUndefined()
    })

    it('should return error when caller is not admin', async () => {
      // Arrange
      const regularUser = {
        id: 'user-123',
        app_metadata: { roles: ['user'] }
      }

      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: regularUser } })
        }
      }
      mockCreateClient.mockResolvedValue(mockSupabaseClient)

      const formData = new FormData()
      formData.append('userId', 'user-to-delete-123')

      // Act
      const result = await deleteUser({ success: false, message: '' }, formData)

      // Assert
      expect(result.success).toBe(false)
      expect(result.message).toBe('Access Denied')
    })

    it('should return error when user ID is missing', async () => {
      // Arrange
      const adminCaller = {
        id: 'admin-123',
        app_metadata: { roles: ['admin'] }
      }

      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: adminCaller } })
        }
      }
      mockCreateClient.mockResolvedValue(mockSupabaseClient)

      const formData = new FormData()
      // Missing userId

      // Act
      const result = await deleteUser({ success: false, message: '' }, formData)

      // Assert
      expect(result.success).toBe(false)
      expect(result.message).toBe('User ID required')
    })
  })

  describe('updateUserRole', () => {
    it('should update user role successfully with valid admin caller', async () => {
      // First create a test user to update
      const testEmail = generateTestEmail()
      const { data: createResult } = await supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: 'password123',
        email_confirm: true,
        app_metadata: { roles: ['user'] }
      })

      expect(createResult?.user?.id).toBeDefined()
      const userIdToUpdate = createResult!.user!.id
      createdTestUsers.push(userIdToUpdate) // Add to cleanup list

      // Arrange
      const adminCaller = {
        id: 'admin-123',
        app_metadata: { roles: ['admin'] }
      }

      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: adminCaller } })
        }
      }
      mockCreateClient.mockResolvedValue(mockSupabaseClient)

      const formData = new FormData()
      formData.append('targetUserId', userIdToUpdate)
      formData.append('newRoles', 'user,editor')

      // Act
      const result = await updateUserRole({ success: false, message: '' }, formData)

      // Assert
      expect(result.success).toBe(true)
      expect(result.message).toBe('Roles updated successfully')
      expect(revalidatePath).toHaveBeenCalledWith('/users')

      // Verify user roles were actually updated in database
      const { data: users } = await supabaseAdmin.auth.admin.listUsers()
      const updatedUser = users.users.find((u: any) => u.id === userIdToUpdate)
      expect(updatedUser?.app_metadata?.roles).toEqual(['user', 'editor'])
    })

    it('should return error when caller is not admin', async () => {
      // Arrange
      const regularUser = {
        id: 'user-123',
        app_metadata: { roles: ['user'] }
      }

      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: regularUser } })
        }
      }
      mockCreateClient.mockResolvedValue(mockSupabaseClient)

      const formData = new FormData()
      formData.append('targetUserId', 'user-to-update-123')
      formData.append('newRoles', 'editor')

      // Act
      const result = await updateUserRole({ success: false, message: '' }, formData)

      // Assert
      expect(result.success).toBe(false)
      expect(result.message).toBe('Access Denied')
    })

    it('should return error when user ID or roles are missing', async () => {
      // Arrange
      const adminCaller = {
        id: 'admin-123',
        app_metadata: { roles: ['admin'] }
      }

      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: adminCaller } })
        }
      }
      mockCreateClient.mockResolvedValue(mockSupabaseClient)

      const formData = new FormData()
      formData.append('targetUserId', 'user-to-update-123')
      formData.append('newRoles', '') // Provide empty roles to avoid split error
      // Missing newRoles content

      // Act
      const result = await updateUserRole({ success: false, message: '' }, formData)

      // Assert
      expect(result.success).toBe(false)
      expect(result.message).toBe('User ID and roles required')
    })
  })
})
