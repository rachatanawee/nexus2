'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createWarehouse, updateWarehouse } from '../_lib/actions'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Warehouse } from '../_lib/types'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createWarehouseSchema, updateWarehouseSchema, type CreateWarehouseFormData, type UpdateWarehouseFormData } from '../_lib/validation'

interface WarehouseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  warehouse?: Warehouse | null
}

export function WarehouseFormDialog({ open, onOpenChange, warehouse }: WarehouseFormDialogProps) {
  const router = useRouter()
  const isEdit = !!warehouse
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(isEdit ? updateWarehouseSchema : createWarehouseSchema),
    defaultValues: {
      name: warehouse?.name,
      code: warehouse?.code,
      address: warehouse?.address || '',
      city: warehouse?.city || '',
      country: warehouse?.country || '',
      manager_name: warehouse?.manager_name || '',
      phone: warehouse?.phone || '',
      is_active: warehouse?.is_active || undefined,
      ...(isEdit && { id: warehouse.id })
    }
  })

  const onSubmit = async (data: Record<string, any>) => {
    setLoading(true)
    const formData = new FormData()
    if (data.name !== undefined) formData.append('name', data.name.toString())
    if (data.code !== undefined) formData.append('code', data.code.toString())
    if (data.address !== undefined) formData.append('address', data.address.toString())
    if (data.city !== undefined) formData.append('city', data.city.toString())
    if (data.country !== undefined) formData.append('country', data.country.toString())
    if (data.manager_name !== undefined) formData.append('manager_name', data.manager_name.toString())
    if (data.phone !== undefined) formData.append('phone', data.phone.toString())
    if (data.is_active !== undefined) formData.append('is_active', data.is_active.toString())
    if (isEdit && 'id' in data) formData.append('id', data.id)

    const result = await (isEdit ? updateWarehouse : createWarehouse)({ success: false, message: '' }, formData)
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
          <DialogTitle>{isEdit ? 'Edit Warehouse' : 'Create Warehouse'}</DialogTitle>
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
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                type="text"
                {...register('code')}
                className={errors.code ? 'border-red-500' : ''}
              />
              {errors.code && (
                <p className="text-sm text-red-600 mt-1">{errors.code.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                {...register('address')}
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                type="text"
                {...register('city')}
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && (
                <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                type="text"
                {...register('country')}
                className={errors.country ? 'border-red-500' : ''}
              />
              {errors.country && (
                <p className="text-sm text-red-600 mt-1">{errors.country.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="manager_name">Manager_name</Label>
              <Input
                id="manager_name"
                type="text"
                {...register('manager_name')}
                className={errors.manager_name ? 'border-red-500' : ''}
              />
              {errors.manager_name && (
                <p className="text-sm text-red-600 mt-1">{errors.manager_name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="text"
                {...register('phone')}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-red-600 mt-1">{errors.phone.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="is_active">Is_active</Label>
              <Input
                id="is_active"
                type="text"
                {...register('is_active')}
                className={errors.is_active ? 'border-red-500' : ''}
              />
              {errors.is_active && (
                <p className="text-sm text-red-600 mt-1">{errors.is_active.message}</p>
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
