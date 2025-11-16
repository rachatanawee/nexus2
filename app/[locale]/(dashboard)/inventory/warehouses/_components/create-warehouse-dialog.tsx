'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createWarehouse } from '../_lib/actions'
import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'

interface CreateWarehouseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateWarehouseDialog({ open, onOpenChange }: CreateWarehouseDialogProps) {
  const [state, formAction, isPending] = useActionState(createWarehouse, {
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
          <DialogTitle>Create Warehouse</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div>
            <Label htmlFor="code">Code</Label>
            <Input id="code" name="code" required />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address"  />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city"  />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input id="country" name="country"  />
          </div>
          <div>
            <Label htmlFor="manager_name">Manager_name</Label>
            <Input id="manager_name" name="manager_name"  />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone"  />
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
