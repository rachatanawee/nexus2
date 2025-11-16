'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createProduct } from '../_lib/actions'
import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'

interface CreateProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateProductDialog({ open, onOpenChange }: CreateProductDialogProps) {
  const [state, formAction, isPending] = useActionState(createProduct, {
    success: false,
    message: ''
  })

  useEffect(() => {
    if (state.success) {
      toast.success(state.message)
      onOpenChange(false)
      window.location.reload()
    } else if (state.message) {
      toast.error(state.message)
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div>
            <Label htmlFor="sku">Sku</Label>
            <Input id="sku" name="sku" required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description"  />
          </div>
          <div>
            <Label htmlFor="category_id">Category_id</Label>
            <Input id="category_id" name="category_id"  />
          </div>
          <div>
            <Label htmlFor="price">Price</Label>
            <Input id="price" name="price" required />
          </div>
          <div>
            <Label htmlFor="cost">Cost</Label>
            <Input id="cost" name="cost" required />
          </div>
          <div>
            <Label htmlFor="stock_quantity">Stock_quantity</Label>
            <Input id="stock_quantity" name="stock_quantity" required />
          </div>
          <div>
            <Label htmlFor="min_stock_level">Min_stock_level</Label>
            <Input id="min_stock_level" name="min_stock_level"  />
          </div>
          <div>
            <Label htmlFor="image_url">Image_url</Label>
            <Input id="image_url" name="image_url"  />
          </div>
          <div>
            <Label htmlFor="is_active">Is_active</Label>
            <Input id="is_active" name="is_active"  />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
