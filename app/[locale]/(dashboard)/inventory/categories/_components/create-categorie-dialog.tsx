'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCategorie } from '../_lib/actions'
import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'

interface CreateCategorieDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCategorieDialog({ open, onOpenChange }: CreateCategorieDialogProps) {
  const [state, formAction, isPending] = useActionState(createCategorie, {
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
          <DialogTitle>Create Categorie</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description"  />
          </div>
          <div>
            <Label htmlFor="icon">Icon</Label>
            <Input id="icon" name="icon"  />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Creating...' : 'Create'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
