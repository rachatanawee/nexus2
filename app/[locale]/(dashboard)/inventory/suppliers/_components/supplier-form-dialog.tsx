'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createSupplier, updateSupplier } from '../_lib/actions'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Supplier } from '../_lib/types'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createSupplierSchema, updateSupplierSchema, type CreateSupplierFormData, type UpdateSupplierFormData } from '../_lib/validation'

interface SupplierFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier?: Supplier | null
}

export function SupplierFormDialog({ open, onOpenChange, supplier }: SupplierFormDialogProps) {
  const router = useRouter()
  const isEdit = !!supplier
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: zodResolver(isEdit ? updateSupplierSchema : createSupplierSchema),
    defaultValues: {
      name: supplier?.name,
      code: supplier?.code,
      contact_person: supplier?.contact_person || '',
      email: supplier?.email || '',
      phone: supplier?.phone || '',
      address: supplier?.address || '',
      city: supplier?.city || '',
      country: supplier?.country || '',
      payment_terms: supplier?.payment_terms || '',
      is_active: supplier?.is_active || undefined,
      ...(isEdit && { id: supplier.id })
    }
  })

  const onSubmit = async (data: Record<string, any>) => {
    setLoading(true)
    const formData = new FormData()
    if (data.name !== undefined) formData.append('name', data.name.toString())
    if (data.code !== undefined) formData.append('code', data.code.toString())
    if (data.contact_person !== undefined) formData.append('contact_person', data.contact_person.toString())
    if (data.email !== undefined) formData.append('email', data.email.toString())
    if (data.phone !== undefined) formData.append('phone', data.phone.toString())
    if (data.address !== undefined) formData.append('address', data.address.toString())
    if (data.city !== undefined) formData.append('city', data.city.toString())
    if (data.country !== undefined) formData.append('country', data.country.toString())
    if (data.payment_terms !== undefined) formData.append('payment_terms', data.payment_terms.toString())
    if (data.is_active !== undefined) formData.append('is_active', data.is_active.toString())
    if (isEdit && 'id' in data) formData.append('id', data.id)

    const result = await (isEdit ? updateSupplier : createSupplier)({ success: false, message: '' }, formData)
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
          <DialogTitle>{isEdit ? 'Edit Supplier' : 'Create Supplier'}</DialogTitle>
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
              <Label htmlFor="contact_person">Contact_person</Label>
              <Input
                id="contact_person"
                type="text"
                {...register('contact_person')}
                className={errors.contact_person ? 'border-red-500' : ''}
              />
              {errors.contact_person && (
                <p className="text-sm text-red-600 mt-1">{errors.contact_person.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="text"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
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
              <Label htmlFor="payment_terms">Payment_terms</Label>
              <Input
                id="payment_terms"
                type="text"
                {...register('payment_terms')}
                className={errors.payment_terms ? 'border-red-500' : ''}
              />
              {errors.payment_terms && (
                <p className="text-sm text-red-600 mt-1">{errors.payment_terms.message}</p>
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
