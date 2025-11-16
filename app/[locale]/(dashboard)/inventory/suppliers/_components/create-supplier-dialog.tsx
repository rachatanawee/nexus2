'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createSupplier } from '../_lib/actions'
import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'

interface CreateSupplierDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateSupplierDialog({ open, onOpenChange }: CreateSupplierDialogProps) {
  const [state, formAction, isPending] = useActionState(createSupplier, {
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
          <DialogTitle>Create Supplier</DialogTitle>
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
            <Label htmlFor="contact_person">Contact_person</Label>
            <Input id="contact_person" name="contact_person"  />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email"  />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone"  />
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
            <Label htmlFor="payment_terms">Payment_terms</Label>
            <Input id="payment_terms" name="payment_terms"  />
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
