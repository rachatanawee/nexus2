import { updateSettings } from '@/app/[locale]/(dashboard)/settings/_lib/actions'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/permissions'

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}))

// Mock permissions
jest.mock('@/lib/permissions', () => ({
  isAdmin: jest.fn()
}))

const mockCreateClient = createClient as jest.Mock
const mockIsAdmin = isAdmin as jest.Mock

// Mock the createClient function
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn()
  },
  from: jest.fn(() => ({
    update: jest.fn(),
    eq: jest.fn()
  }))
}

describe('Settings Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateClient.mockResolvedValue(mockSupabaseClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('updateSettings', () => {
    it('should update settings successfully with valid admin user', async () => {
      // Arrange
      const adminUser = { id: 'admin-123', app_metadata: { roles: ['admin'] } }
      const updates = { 'site_title': 'New Title', 'theme': 'dark' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: adminUser } })
      mockIsAdmin.mockReturnValue(true)

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null })
      })
      mockSupabaseClient.from.mockReturnValue({
        update: mockUpdate,
        eq: jest.fn()
      })

      const formData = new FormData()
      formData.append('updates', JSON.stringify(updates))

      // Act
      const result = await updateSettings({ success: false, message: '' }, formData)

      // Assert
      expect(result.success).toBe(true)
      expect(result.message).toBe('Settings saved successfully')
      expect(mockUpdate).toHaveBeenCalledTimes(2) // Called for each setting
      expect(mockUpdate).toHaveBeenCalledWith({ value: 'New Title' })
      expect(mockUpdate).toHaveBeenCalledWith({ value: 'dark' })
    })

    it('should return error when user is not authenticated', async () => {
      // Arrange
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null } })

      const formData = new FormData()
      formData.append('updates', JSON.stringify({ 'site_title': 'New Title' }))

      // Act
      const result = await updateSettings({ success: false, message: '' }, formData)

      // Assert
      expect(result.success).toBe(false)
      expect(result.message).toBe('Access Denied')
    })

    it('should return error when user is not admin', async () => {
      // Arrange
      const regularUser = { id: 'user-123', app_metadata: { roles: ['user'] } }
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: regularUser } })
      mockIsAdmin.mockReturnValue(false)

      const formData = new FormData()
      formData.append('updates', JSON.stringify({ 'site_title': 'New Title' }))

      // Act
      const result = await updateSettings({ success: false, message: '' }, formData)

      // Assert
      expect(result.success).toBe(false)
      expect(result.message).toBe('Access Denied')
    })

    it('should return error when database update fails', async () => {
      // Arrange
      const adminUser = { id: 'admin-123', app_metadata: { roles: ['admin'] } }
      const updates = { 'site_title': 'New Title' }

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: adminUser } })
      mockIsAdmin.mockReturnValue(true)

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: { message: 'Database error' } })
      })
      mockSupabaseClient.from.mockReturnValue({
        update: mockUpdate,
        eq: jest.fn()
      })

      const formData = new FormData()
      formData.append('updates', JSON.stringify(updates))

      // Act
      const result = await updateSettings({ success: false, message: '' }, formData)

      // Assert
      expect(result.success).toBe(false)
      expect(result.message).toBe('Database error')
    })

    it('should handle unexpected errors', async () => {
      // Arrange
      const adminUser = { id: 'admin-123', app_metadata: { roles: ['admin'] } }
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: adminUser } })
      mockIsAdmin.mockReturnValue(true)

      mockCreateClient.mockRejectedValue(new Error('Network error'))

      const formData = new FormData()
      formData.append('updates', JSON.stringify({ 'site_title': 'New Title' }))

      // Act & Assert
      await expect(updateSettings({ success: false, message: '' }, formData)).rejects.toThrow('Network error')
    })
  })
})
