import { createProduct, updateProduct, deleteProduct } from '@/app/[locale]/(dashboard)/inventory/products/_lib/actions'
import { createClient } from '@/lib/supabase/server'

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn()
}))

// Mock the createClient function
const mockSupabaseClient = {
  from: jest.fn(() => ({
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    eq: jest.fn()
  }))
}

const mockCreateClient = createClient as jest.Mock

describe('Product Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateClient.mockResolvedValue(mockSupabaseClient)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('createProduct', () => {
    it('should create product successfully with valid data', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('name', 'Test Product')
      formData.append('sku', 'TEST-001')
      formData.append('price', '99.99')
      formData.append('cost', '49.99')
      formData.append('stock_quantity', '100')

      const mockInsert = jest.fn().mockResolvedValue({ error: null })
      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert
      })

      // Act
      const result = await createProduct({ success: false, message: '' }, formData)

      // Assert
      expect(result.success).toBe(true)
      expect(result.message).toBe('Product created successfully')
      expect(mockInsert).toHaveBeenCalledWith({
        name: 'Test Product',
        sku: 'TEST-001',
        description: null,
        category_id: null,
        price: 99.99,
        cost: 49.99,
        stock_quantity: 100,
        min_stock_level: null,
        image_url: null,
        is_active: null
      })
    })

    it('should return error when name is missing', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('sku', 'TEST-001')
      formData.append('price', '99.99')
      formData.append('cost', '49.99')
      formData.append('stock_quantity', '100')

      // Act
      const result = await createProduct({ success: false, message: '' }, formData)

      // Assert
      expect(result.success).toBe(false)
      expect(result.message).toBe('Name is required')
    })

    it('should return error when database insert fails', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('name', 'Test Product')
      formData.append('sku', 'TEST-001')
      formData.append('price', '99.99')
      formData.append('cost', '49.99')
      formData.append('stock_quantity', '100')

      const mockInsert = jest.fn().mockResolvedValue({
        error: { message: 'Database error' }
      })
      mockSupabaseClient.from.mockReturnValue({
        insert: mockInsert
      })

      // Act
      const result = await createProduct({ success: false, message: '' }, formData)

      // Assert
      expect(result.success).toBe(false)
      expect(result.message).toBe('Database error')
    })

    it('should handle unexpected errors', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('name', 'Test Product')
      formData.append('sku', 'TEST-001')
      formData.append('price', '99.99')
      formData.append('cost', '49.99')
      formData.append('stock_quantity', '100')

      mockCreateClient.mockRejectedValue(new Error('Network error'))

      // Act
      const result = await createProduct({ success: false, message: '' }, formData)

      // Assert
      expect(result.success).toBe(false)
      expect(result.message).toBe('Unexpected error occurred')
    })
  })

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('id', '123')
      formData.append('name', 'Updated Product')
      formData.append('sku', 'TEST-001')
      formData.append('price', '199.99')
      formData.append('cost', '99.99')
      formData.append('stock_quantity', '50')

      const mockUpdate = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null })
      })
      mockSupabaseClient.from.mockReturnValue({
        update: mockUpdate
      })

      // Act
      const result = await updateProduct({ success: false, message: '' }, formData)

      // Assert
      expect(result.success).toBe(true)
      expect(result.message).toBe('Product updated successfully')
      expect(mockUpdate).toHaveBeenCalledWith({
        name: 'Updated Product',
        sku: 'TEST-001',
        description: null,
        category_id: null,
        price: 199.99,
        cost: 99.99,
        stock_quantity: 50,
        min_stock_level: null,
        image_url: null,
        is_active: null
      })
    })

    it('should return error when id is missing', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('name', 'Updated Product')
      formData.append('sku', 'TEST-001')
      formData.append('price', '199.99')
      formData.append('cost', '99.99')
      formData.append('stock_quantity', '50')

      // Act
      const result = await updateProduct({ success: false, message: '' }, formData)

      // Assert
      expect(result.success).toBe(false)
      expect(result.message).toBe('ID is required')
    })
  })

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      // Arrange
      const formData = new FormData()
      formData.append('id', '123')

      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null })
      })
      mockSupabaseClient.from.mockReturnValue({
        delete: mockDelete
      })

      // Act
      const result = await deleteProduct({ success: false, message: '' }, formData)

      // Assert
      expect(result.success).toBe(true)
      expect(result.message).toBe('Product deleted successfully')
    })

    it('should return error when id is missing', async () => {
      // Arrange
      const formData = new FormData()

      // Act
      const result = await deleteProduct({ success: false, message: '' }, formData)

      // Assert
      expect(result.success).toBe(false)
      expect(result.message).toBe('ID is required')
    })
  })
})

// Alternative: Testing with real Supabase (Integration test)
describe('Product Server Actions - Integration Tests', () => {
  // These tests would run against a real test database
  // Use a separate test database or use transactions

  it.skip('should create product in real database', async () => {
    // This would require setting up a test database
    // and proper cleanup after tests
  })
})

// Testing with dependency injection approach
describe('Product Server Actions - Dependency Injection', () => {
  // Alternative pattern: Pass dependencies as parameters
  // This makes testing easier

  async function createProductDI(
    supabaseClient: any,
    formData: FormData
  ): Promise<{ success: boolean; message: string }> {
    try {
      const name = formData.get('name') as string
      if (!name) return { success: false, message: 'Name is required' }

      const sku = formData.get('sku') as string
      if (!sku) return { success: false, message: 'Sku is required' }

      const price = parseFloat(formData.get('price') as string)
      if (!price || isNaN(price)) return { success: false, message: 'Price is required' }

      const { error } = await supabaseClient.from('products').insert({
        name,
        sku,
        price,
        cost: parseFloat(formData.get('cost') as string),
        stock_quantity: parseFloat(formData.get('stock_quantity') as string)
      })

      if (error) return { success: false, message: error.message }
      return { success: true, message: 'Product created successfully' }
    } catch (err) {
      return { success: false, message: 'Unexpected error occurred' }
    }
  }

  it('should create product with dependency injection', async () => {
    // Arrange
    const mockSupabase = {
      from: jest.fn(() => ({
        insert: jest.fn().mockResolvedValue({ error: null })
      }))
    }

    const formData = new FormData()
    formData.append('name', 'Test Product')
    formData.append('sku', 'TEST-001')
    formData.append('price', '99.99')
    formData.append('cost', '49.99')
    formData.append('stock_quantity', '100')

    // Act
    const result = await createProductDI(mockSupabase, formData)

    // Assert
    expect(result.success).toBe(true)
    expect(result.message).toBe('Product created successfully')
  })
})
