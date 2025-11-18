'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createProduct, updateProduct } from '../_lib/actions'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Product } from '../_lib/types'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProductSchema, updateProductSchema, type CreateProductFormData, type UpdateProductFormData } from '../_lib/validation'

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
}

export function ProductFormDialog({ open, onOpenChange, product }: ProductFormDialogProps) {
  const router = useRouter()
  const isEdit = !!product
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(isEdit ? updateProductSchema : createProductSchema),
    defaultValues: {
      name: product?.name || '',
      sku: product?.sku || '',
      description: product?.description || '',
      category_id: product?.category_id || '',
      price: product?.price || undefined,
      cost: product?.cost || undefined,
      stock_quantity: product?.stock_quantity || undefined,
      min_stock_level: product?.min_stock_level || undefined,
      image_url: product?.image_url || '',
      is_active: product?.is_active || undefined,
      ...(isEdit && { id: product.id })
    }
  })

  const onSubmit = async (data: Record<string, any>) => {
    setLoading(true)
    const formData = new FormData()
    if (data.name !== undefined) formData.append('name', data.name.toString())
    if (data.sku !== undefined) formData.append('sku', data.sku.toString())
    if (data.description !== undefined) formData.append('description', data.description.toString())
    if (data.category_id !== undefined) formData.append('category_id', data.category_id.toString())
    if (data.price !== undefined) formData.append('price', data.price.toString())
    if (data.cost !== undefined) formData.append('cost', data.cost.toString())
    if (data.stock_quantity !== undefined) formData.append('stock_quantity', data.stock_quantity.toString())
    if (data.min_stock_level !== undefined) formData.append('min_stock_level', data.min_stock_level.toString())
    if (data.image_url !== undefined) formData.append('image_url', data.image_url.toString())
    if (data.is_active !== undefined) formData.append('is_active', data.is_active.toString())
    if (isEdit && 'id' in data) formData.append('id', data.id)

    const result = await (isEdit ? updateProduct : createProduct)({ success: false, message: '' }, formData)
    setLoading(false)

    if (result.success) {
      toast.success(result.message)
      onOpenChange(false)
      reset()
      router.refresh()
    } else {
      toast.error(result.message)
      setMessage(result.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Product' : 'Create Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                type="text"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="sku">Sku *</Label>
              <Input
                id="sku"
                type="text"
                {...register('sku')}
                className={errors.sku ? 'border-red-500' : ''}
              />
              {errors.sku && (
                <p className="text-sm text-red-600 mt-1">{errors.sku.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                type="text"
                {...register('description')}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="category_id">Category_id</Label>
              <Input
                id="category_id"
                type="text"
                {...register('category_id')}
                className={errors.category_id ? 'border-red-500' : ''}
              />
              {errors.category_id && (
                <p className="text-sm text-red-600 mt-1">{errors.category_id.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input
                id="price"
                type="number" step="0.01"
                {...register('price')}
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && (
                <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="cost">Cost *</Label>
              <Input
                id="cost"
                type="number" step="0.01"
                {...register('cost')}
                className={errors.cost ? 'border-red-500' : ''}
              />
              {errors.cost && (
                <p className="text-sm text-red-600 mt-1">{errors.cost.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="stock_quantity">Stock_quantity *</Label>
              <Input
                id="stock_quantity"
                type="number"
                {...register('stock_quantity')}
                className={errors.stock_quantity ? 'border-red-500' : ''}
              />
              {errors.stock_quantity && (
                <p className="text-sm text-red-600 mt-1">{errors.stock_quantity.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="min_stock_level">Min_stock_level</Label>
              <Input
                id="min_stock_level"
                type="number"
                {...register('min_stock_level')}
                className={errors.min_stock_level ? 'border-red-500' : ''}
              />
              {errors.min_stock_level && (
                <p className="text-sm text-red-600 mt-1">{errors.min_stock_level.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="image_url">Image_url</Label>
              <Input
                id="image_url"
                type="text"
                {...register('image_url')}
                className={errors.image_url ? 'border-red-500' : ''}
              />
              {errors.image_url && (
                <p className="text-sm text-red-600 mt-1">{errors.image_url.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="is_active">Is_active</Label>
              <Input
                id="is_active"
                type="text"
                {...register('is_active')}
                className={errors.is_active ? 'border-red-500' : ''}
              />
              {errors.is_active && (
                <p className="text-sm text-red-600 mt-1">{errors.is_active.message}</p>
              )}
            </div>
          </div>
          {message && (
            <p className={`text-sm ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
