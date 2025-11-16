'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createSupplier, updateSupplier } from '../_lib/actions'
import { useActionState, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Supplier } from '../_lib/types'
import { useRouter } from 'next/navigation'

interface SupplierFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier?: Supplier | null
}

export function SupplierFormDialog({ open, onOpenChange, supplier }: SupplierFormDialogProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const isEdit = !!supplier
  
  const [state, formAction, isPending] = useActionState(
    isEdit ? updateSupplier : createSupplier,
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
      setFormData({})
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
          <DialogTitle>{isEdit ? 'Edit Supplier' : 'Create Supplier'}</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          {isEdit && <input type="hidden" name="id" value={supplier.id} />}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" type="text" defaultValue={supplier?.name} required />
            </div>
            <div>
              <Label htmlFor="code">Code *</Label>
              <Input id="code" name="code" type="text" defaultValue={supplier?.code} required />
            </div>
            <div>
              <Label htmlFor="contact_person">Contact_person</Label>
              <Input id="contact_person" name="contact_person" type="text" defaultValue={supplier?.contact_person || ''}  />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="text" defaultValue={supplier?.email || ''}  />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="text" defaultValue={supplier?.phone || ''}  />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" type="text" defaultValue={supplier?.address || ''}  />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" type="text" defaultValue={supplier?.city || ''}  />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" type="text" defaultValue={supplier?.country || ''}  />
            </div>
            <div>
              <Label htmlFor="payment_terms">Payment_terms</Label>
              <Input id="payment_terms" name="payment_terms" type="text" defaultValue={supplier?.payment_terms || ''}  />
            </div>
            <div>
              <Label htmlFor="is_active">Is_active</Label>
              <Input id="is_active" name="is_active" type="text" defaultValue={supplier?.is_active || ''}  />
            </div>
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
