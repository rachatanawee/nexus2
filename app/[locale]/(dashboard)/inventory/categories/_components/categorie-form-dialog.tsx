'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCategorie, updateCategorie } from '../_lib/actions'
import { useActionState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { Categorie } from '../_lib/types'
import { useRouter } from 'next/navigation'

interface CategorieFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categorie?: Categorie | null
}

export function CategorieFormDialog({ open, onOpenChange, categorie }: CategorieFormDialogProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const isEdit = !!categorie
  
  const [state, formAction, isPending] = useActionState(
    isEdit ? updateCategorie : createCategorie,
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
          <DialogTitle>{isEdit ? 'Edit Categorie' : 'Create Categorie'}</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={formAction} className="space-y-4">
          {isEdit && <input type="hidden" name="id" value={categorie.id} />}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" type="text" defaultValue={categorie?.name} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" type="text" defaultValue={categorie?.description || ''}  />
            </div>
            <div>
              <Label htmlFor="icon">Icon</Label>
              <Input id="icon" name="icon" type="text" defaultValue={categorie?.icon || ''}  />
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
