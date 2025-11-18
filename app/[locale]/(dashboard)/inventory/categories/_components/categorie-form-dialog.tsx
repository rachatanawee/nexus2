'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCategorie, updateCategorie } from '../_lib/actions'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Categorie } from '../_lib/types'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createCategorieSchema, updateCategorieSchema, type CreateCategorieFormData, type UpdateCategorieFormData } from '../_lib/validation'

interface CategorieFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categorie?: Categorie | null
}

export function CategorieFormDialog({ open, onOpenChange, categorie }: CategorieFormDialogProps) {
  const router = useRouter()
  const isEdit = !!categorie
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CreateCategorieFormData | UpdateCategorieFormData>({
    resolver: zodResolver(isEdit ? updateCategorieSchema : createCategorieSchema),
    defaultValues: {
      name: categorie?.name || '',
      description: categorie?.description || '',
      icon: categorie?.icon || '',
      ...(isEdit && { id: categorie.id })
    }
  })

  const onSubmit = async (data: CreateCategorieFormData | UpdateCategorieFormData) => {
    setLoading(true)
    const formData = new FormData()
    formData.append('name', data.name)
    if (data.description) formData.append('description', data.description)
    if (data.icon) formData.append('icon', data.icon)
    if (isEdit && 'id' in data) formData.append('id', data.id)

    const result = await (isEdit ? updateCategorie : createCategorie)({ success: false, message: '' }, formData)
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
          <DialogTitle>{isEdit ? 'Edit Categorie' : 'Create Categorie'}</DialogTitle>
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
              <Label htmlFor="icon">Icon</Label>
              <Input
                id="icon"
                type="text"
                {...register('icon')}
                className={errors.icon ? 'border-red-500' : ''}
              />
              {errors.icon && (
                <p className="text-sm text-red-600 mt-1">{errors.icon.message}</p>
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
