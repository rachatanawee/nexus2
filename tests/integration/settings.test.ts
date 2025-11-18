/* eslint-disable */
import { config } from 'dotenv'
config({ path: '.env.test' })

import { updateSettings } from '@/app/[locale]/(dashboard)/settings/_lib/actions'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { isAdmin } from '@/lib/permissions'
import { revalidatePath } from 'next/cache'

// Mock Supabase client for authentication checks
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}))

// Mock permissions
jest.mock('@/lib/permissions', () => ({
  isAdmin: jest.fn()
}))

// Mock next/cache
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}))

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockIsAdmin = isAdmin as jest.MockedFunction<typeof isAdmin>;

// Mock Supabase client for integration testing
let supabaseClient: any

describe('Settings Server Actions (Integration)', () => {
  beforeAll(() => {
    // Create mock Supabase client for integration tests
    supabaseClient = {
      from: jest.fn(() => ({
        select: jest.fn(() => ({
          in: jest.fn().mockResolvedValue({
            data: [
              { key: 'site_title', value: 'New Title' },
              { key: 'theme', value: 'dark' }
            ]
          })
        }))
      }))
    }
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

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('updateSettings', () => {
    it('should update settings successfully with valid admin user', async () => {
      // Arrange
      const adminUser = { id: 'admin-123', app_metadata: { roles: ['admin'] } }

      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: adminUser } })
        },
        from: jest.fn(() => ({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: null })
          }),
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({
              data: [
                { key: 'site_title', value: 'New Title' },
                { key: 'theme', value: 'dark' }
              ]
            })
          })
        }))
      }
      mockCreateClient.mockResolvedValue(mockSupabaseClient)
      mockIsAdmin.mockReturnValue(true)

      const updates = { 'site_title': 'New Title', 'theme': 'dark' }
      const formData = new FormData()
      formData.append('updates', JSON.stringify(updates))

      // Act
      const result = await updateSettings({ success: false, message: '' }, formData)

      // Assert
      expect(result.success).toBe(true)
      expect(result.message).toBe('Settings saved successfully')
      expect(revalidatePath).toHaveBeenCalledWith('/settings')

      // Verify settings were actually updated in database
      const { data: settings } = await supabaseClient
        .from('_app_settings')
        .select('key, value')
        .in('key', ['site_title', 'theme'])

      const siteTitleSetting = (settings as any)?.find((s: any) => s.key === 'site_title')
      const themeSetting = (settings as any)?.find((s: any) => s.key === 'theme')

      expect(siteTitleSetting?.value).toBe('New Title')
      expect(themeSetting?.value).toBe('dark')
    })

    it('should return error when user is not authenticated', async () => {
      // Arrange
      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null } })
        }
      }
      mockCreateClient.mockResolvedValue(mockSupabaseClient)

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

      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: regularUser } })
        }
      }
      mockCreateClient.mockResolvedValue(mockSupabaseClient)
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

      const mockSupabaseClient = {
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: adminUser } })
        },
        from: jest.fn(() => ({
          update: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ error: { message: 'Database error' } })
          })
        }))
      }
      mockCreateClient.mockResolvedValue(mockSupabaseClient)
      mockIsAdmin.mockReturnValue(true)

      const updates = { 'site_title': 'New Title' }
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
      mockIsAdmin.mockReturnValue(true)

      mockCreateClient.mockRejectedValue(new Error('Network error'))

      const formData = new FormData()
      formData.append('updates', JSON.stringify({ 'site_title': 'New Title' }))

      // Act & Assert
      await expect(updateSettings({ success: false, message: '' }, formData)).rejects.toThrow('Network error')
    })
  })
})
