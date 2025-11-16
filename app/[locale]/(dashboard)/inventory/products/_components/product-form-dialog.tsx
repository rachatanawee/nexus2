'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createProduct, updateProduct } from '../_lib/actions'
import { useActionState, useEffect, useRef, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Product } from '../_lib/types'
import { useRouter } from 'next/navigation'

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
  onSuccess?: () => void
}

export function ProductFormDialog({ open, onOpenChange, product, onSuccess }: ProductFormDialogProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const isEdit = !!product
  
  const [state, formAction, isPending] = useActionState(
    isEdit ? updateProduct : createProduct,
    { success: false, message: '' }
  )

  const handleSubmit = (formData: FormData) => {
    const data: Record<string, string> = {}
    for (const [key, value] of formData.entries()) {
      data[key] = value.toString()
    }
    setFormData(data)
    formAction(formData)
  }

  useEffect(() => {
    if (state.success) {
      toast.success(state.message)
      onOpenChange(false)
      // Reset form data and form
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setFormData({})
      formRef.current?.reset()
      // Call success callback if provided
      onSuccess?.()
    } else if (state.message) {
      toast.error(state.message)
    }
  }, [state, onOpenChange, onSuccess])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Product' : 'Create Product'}</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          {isEdit && <input type="hidden" name="id" value={product.id} />}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" defaultValue={product?.name} required />
            </div>
            <div>
              <Label htmlFor="sku">SKU *</Label>
              <Input id="sku" name="sku" defaultValue={product?.sku} required />
            </div>
            <div>
              <Label htmlFor="price">Price *</Label>
              <Input id="price" name="price" type="number" step="0.01" defaultValue={product?.price} required />
            </div>
            <div>
              <Label htmlFor="cost">Cost *</Label>
              <Input id="cost" name="cost" type="number" step="0.01" defaultValue={product?.cost} required />
            </div>
            <div>
              <Label htmlFor="stock_quantity">Stock Quantity *</Label>
              <Input id="stock_quantity" name="stock_quantity" type="number" defaultValue={product?.stock_quantity} required />
            </div>
            <div>
              <Label htmlFor="min_stock_level">Min Stock Level</Label>
              <Input id="min_stock_level" name="min_stock_level" type="number" defaultValue={product?.min_stock_level || ''} />
            </div>
            <div>
              <Label htmlFor="category_id">Category ID</Label>
              <Input id="category_id" name="category_id" defaultValue={product?.category_id || ''} />
            </div>
            <div>
              <Label htmlFor="is_active">Is Active</Label>
              <Input id="is_active" name="is_active" defaultValue={product?.is_active ? 'true' : 'false'} />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" defaultValue={product?.description || ''} />
          </div>
          <div>
            <Label htmlFor="image_url">Image URL</Label>
            <Input id="image_url" name="image_url" defaultValue={product?.image_url || ''} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
