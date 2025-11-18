import { createUser, deleteUser, updateUserRole } from '@/app/[locale]/(dashboard)/users/_lib/actions'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}))

// Mock Supabase admin client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn()
}))

const mockCreateClient = createClient as jest.Mock
const mockCreateAdminClient = createAdminClient as jest.Mock

// Mock the createClient function
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn()
  }
}

// Mock the admin client
const mockSupabaseAdminClient = {
  auth: {
    admin: {
      createUser: jest.fn(),
      deleteUser: jest.fn(),
      getUserById: jest.fn(),
      listUsers: jest.fn(),
      updateUserById: jest.fn()
    }
  }
}

describe('Users Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateClient.mockResolvedValue(mockSupabaseClient)
    mockCreateAdminClient.mockReturnValue(mockSupabaseAdminClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('createUser', () => {
    it('should create user successfully with valid admin caller', async () => {
      // Arrange
      const adminCaller = {
        id: 'admin-123',
        app_metadata: { roles: ['admin'] }
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: adminCaller } })
      mockSupabaseAdminClient.auth.admin.createUser.mockResolvedValue({
        data: { user: { id: 'new-user-123' } },
        error: null
      })

      const formData = new FormData()
      formData.append('email', 'newuser@example.com')
      formData.append('password', 'password123')
      formData.append('roles', 'user,editor')

      // Act
      const result = await createUser({ success: false, message: '' }, formData)

      // Assert
      expect(result.success).toBe(true)
      expect(result.message).toBe('User created successfully')
      expect(mockSupabaseAdminClient.auth.admin.createUser).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
        email_confirm: true,
        app_metadata: { roles: ['user', 'editor'] }
      })
    })

    it('should return error when caller is not authenticated', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null } })

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

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: regularUser } })

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

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: adminCaller } })

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

    it('should return error when user creation fails', async () => {
      // Arrange
      const adminCaller = {
        id: 'admin-123',
        app_metadata: { roles: ['admin'] }
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: adminCaller } })
      mockSupabaseAdminClient.auth.admin.createUser.mockResolvedValue({
        data: null,
        error: { message: 'User already exists' }
      })

      const formData = new FormData()
      formData.append('email', 'existing@example.com')
      formData.append('password', 'password123')
      formData.append('roles', 'user') // Provide roles to avoid split error

      // Act
      const result = await createUser({ success: false, message: '' }, formData)

      // Assert
      expect(result.success).toBe(false)
      expect(result.message).toBe('User already exists')
    })
  })

  describe('deleteUser', () => {
    it('should delete user successfully with valid admin caller', async () => {
      // Arrange
      const adminCaller = {
        id: 'admin-123',
        app_metadata: { roles: ['admin'] }
      }
      const targetUser = {
        user: { app_metadata: { roles: ['user'] } }
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: adminCaller } })
      mockSupabaseAdminClient.auth.admin.getUserById.mockResolvedValue({ data: targetUser })
      mockSupabaseAdminClient.auth.admin.listUsers.mockResolvedValue({
        data: { users: [
          { app_metadata: { roles: ['admin'] } },
          { app_metadata: { roles: ['admin'] } },
          { app_metadata: { roles: ['user'] } }
        ]}
      })
      mockSupabaseAdminClient.auth.admin.deleteUser.mockResolvedValue({ error: null })

      const formData = new FormData()
      formData.append('userId', 'user-to-delete-123')

      // Act
      const result = await deleteUser({ success: false, message: '' }, formData)

      // Assert
      expect(result.success).toBe(true)
      expect(result.message).toBe('User deleted successfully')
      expect(mockSupabaseAdminClient.auth.admin.deleteUser).toHaveBeenCalledWith('user-to-delete-123')
    })

    it('should return error when trying to delete the last admin', async () => {
      // Arrange
      const adminCaller = {
        id: 'admin-123',
        app_metadata: { roles: ['admin'] }
      }
      const targetUser = {
        user: { app_metadata: { roles: ['admin'] } }
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: adminCaller } })
      mockSupabaseAdminClient.auth.admin.getUserById.mockResolvedValue({ data: targetUser })
      mockSupabaseAdminClient.auth.admin.listUsers.mockResolvedValue({
        data: { users: [
          { app_metadata: { roles: ['admin'] } } // Only one admin left
        ]}
      })

      const formData = new FormData()
      formData.append('userId', 'admin-to-delete-123')

      // Act
      const result = await deleteUser({ success: false, message: '' }, formData)

      // Assert
      expect(result.success).toBe(false)
      expect(result.message).toBe('Cannot delete the last admin user')
    })

    it('should return error when caller is not admin', async () => {
      // Arrange
      const regularUser = {
        id: 'user-123',
        app_metadata: { roles: ['user'] }
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: regularUser } })

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

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: adminCaller } })

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
      // Arrange
      const adminCaller = {
        id: 'admin-123',
        app_metadata: { roles: ['admin'] }
      }
      const targetUser = {
        user: { app_metadata: { roles: ['user'] } }
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: adminCaller } })
      mockSupabaseAdminClient.auth.admin.getUserById.mockResolvedValue({ data: targetUser })
      mockSupabaseAdminClient.auth.admin.listUsers.mockResolvedValue({
        data: { users: [
          { app_metadata: { roles: ['admin'] } },
          { app_metadata: { roles: ['admin'] } }
        ]}
      })
      mockSupabaseAdminClient.auth.admin.updateUserById.mockResolvedValue({ error: null })

      const formData = new FormData()
      formData.append('targetUserId', 'user-to-update-123')
      formData.append('newRoles', 'user,editor')

      // Act
      const result = await updateUserRole({ success: false, message: '' }, formData)

      // Assert
      expect(result.success).toBe(true)
      expect(result.message).toBe('Roles updated successfully')
      expect(mockSupabaseAdminClient.auth.admin.updateUserById).toHaveBeenCalledWith(
        'user-to-update-123',
        { app_metadata: { roles: ['user', 'editor'] } }
      )
    })

    it('should return error when trying to remove admin role from last admin', async () => {
      // Arrange
      const adminCaller = {
        id: 'admin-123',
        app_metadata: { roles: ['admin'] }
      }
      const targetUser = {
        user: { app_metadata: { roles: ['admin'] } }
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: adminCaller } })
      mockSupabaseAdminClient.auth.admin.getUserById.mockResolvedValue({ data: targetUser })
      mockSupabaseAdminClient.auth.admin.listUsers.mockResolvedValue({
        data: { users: [
          { app_metadata: { roles: ['admin'] } } // Only one admin left
        ]}
      })

      const formData = new FormData()
      formData.append('targetUserId', 'admin-to-update-123')
      formData.append('newRoles', 'user') // Removing admin role

      // Act
      const result = await updateUserRole({ success: false, message: '' }, formData)

      // Assert
      expect(result.success).toBe(false)
      expect(result.message).toBe('Cannot remove admin role from the last admin user')
    })

    it('should return error when caller is not admin', async () => {
      // Arrange
      const regularUser = {
        id: 'user-123',
        app_metadata: { roles: ['user'] }
      }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: regularUser } })

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

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: adminCaller } })

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
