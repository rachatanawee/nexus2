'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createProduct, updateProduct } from '../_lib/actions'
import { useActionState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Product } from '../_lib/types'
import { useRouter } from 'next/navigation'

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product | null
}

export function ProductFormDialog({ open, onOpenChange, product }: ProductFormDialogProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const isEdit = !!product
  
  const [state, formAction, isPending] = useActionState(
    isEdit ? updateProduct : createProduct,
    { success: false, message: '' }
  )

  useEffect(() => {
    if (state.success) {
      toast.success(state.message)
      onOpenChange(false)
      formRef.current?.reset()
      router.refresh()
    } else if (state.message) {
      toast.error(state.message)
    }
  }, [state.success, state.message])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Product' : 'Create Product'}</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-4">
          {isEdit && <input type="hidden" name="id" value={product.id} />}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" type="text" defaultValue={product?.name} required />
            </div>
            <div>
              <Label htmlFor="sku">Sku *</Label>
              <Input id="sku" name="sku" type="text" defaultValue={product?.sku} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" type="text" defaultValue={product?.description || ''}  />
            </div>
            <div>
              <Label htmlFor="category_id">Category_id</Label>
              <Input id="category_id" name="category_id" type="text" defaultValue={product?.category_id || ''}  />
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
              <Label htmlFor="stock_quantity">Stock_quantity *</Label>
              <Input id="stock_quantity" name="stock_quantity" type="number" defaultValue={product?.stock_quantity} required />
            </div>
            <div>
              <Label htmlFor="min_stock_level">Min_stock_level</Label>
              <Input id="min_stock_level" name="min_stock_level" type="number" defaultValue={product?.min_stock_level || ''}  />
            </div>
            <div>
              <Label htmlFor="image_url">Image_url</Label>
              <Input id="image_url" name="image_url" type="text" defaultValue={product?.image_url || ''}  />
            </div>
            <div>
              <Label htmlFor="is_active">Is_active</Label>
              <Input id="is_active" name="is_active" type="text" defaultValue={product?.is_active ? 'true' : 'false'}  />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
