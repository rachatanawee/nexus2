'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createWarehouse, updateWarehouse } from '../_lib/actions'
import { useActionState, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Warehouse } from '../_lib/types'
import { useRouter } from 'next/navigation'

interface WarehouseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  warehouse?: Warehouse | null
}

export function WarehouseFormDialog({ open, onOpenChange, warehouse }: WarehouseFormDialogProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const isEdit = !!warehouse
  
  const [state, formAction, isPending] = useActionState(
    isEdit ? updateWarehouse : createWarehouse,
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
          <DialogTitle>{isEdit ? 'Edit Warehouse' : 'Create Warehouse'}</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          {isEdit && <input type="hidden" name="id" value={warehouse.id} />}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" type="text" defaultValue={warehouse?.name} required />
            </div>
            <div>
              <Label htmlFor="code">Code *</Label>
              <Input id="code" name="code" type="text" defaultValue={warehouse?.code} required />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" type="text" defaultValue={warehouse?.address || ''}  />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" type="text" defaultValue={warehouse?.city || ''}  />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" name="country" type="text" defaultValue={warehouse?.country || ''}  />
            </div>
            <div>
              <Label htmlFor="manager_name">Manager_name</Label>
              <Input id="manager_name" name="manager_name" type="text" defaultValue={warehouse?.manager_name || ''}  />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="text" defaultValue={warehouse?.phone || ''}  />
            </div>
            <div>
              <Label htmlFor="is_active">Is_active</Label>
              <Input id="is_active" name="is_active" type="text" defaultValue={warehouse?.is_active ? 'true' : 'false'}  />
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
