'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createFormSchema, updateFormSchema } from '../_lib/actions'
import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormSchema } from '../_lib/types'

const formSchemaSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  table_name: z.string().min(1, 'Table name is required'),
  schema: z.string().min(1, 'Schema is required'),
})

type FormSchemaData = z.infer<typeof formSchemaSchema>

interface FormSchemaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schema?: FormSchema | null
}

const defaultSchema = JSON.stringify({
  fields: [
    {
      name: "name",
      type: "text",
      label: "Name",
      required: true,
      validation: {
        minLength: 1,
        maxLength: 100
      }
    },
    {
      name: "description",
      type: "textarea",
      label: "Description",
      required: false
    }
  ]
}, null, 2)

export function FormSchemaDialog({ open, onOpenChange, schema }: FormSchemaDialogProps) {
  const isEdit = !!schema
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormSchemaData>({
    resolver: zodResolver(formSchemaSchema),
    defaultValues: {
      name: schema?.name || '',
      description: schema?.description || '',
      table_name: schema?.table_name || '',
      schema: schema ? JSON.stringify(schema.schema, null, 2) : defaultSchema
    }
  })

  const onSubmit = async (data: FormSchemaData) => {
    setLoading(true)
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('description', data.description || '')
    formData.append('table_name', data.table_name)
    formData.append('schema', data.schema)
    if (isEdit && schema) formData.append('id', schema.id)

    const result = await (isEdit ? updateFormSchema : createFormSchema)({ success: false, message: '' }, formData)
    setLoading(false)

    if (result.success) {
      toast.success(result.message)
      onOpenChange(false)
      reset()
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Form Schema' : 'Create Form Schema'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="table_name">Table Name *</Label>
              <Input
                id="table_name"
                {...register('table_name')}
                className={errors.table_name ? 'border-red-500' : ''}
              />
              {errors.table_name && (
                <p className="text-sm text-red-600 mt-1">{errors.table_name.message}</p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              {...register('description')}
            />
          </div>
          <div>
            <Label htmlFor="schema">JSON Schema *</Label>
            <Textarea
              id="schema"
              rows={15}
              {...register('schema')}
              className={`font-mono text-sm ${errors.schema ? 'border-red-500' : ''}`}
            />
            {errors.schema && (
              <p className="text-sm text-red-600 mt-1">{errors.schema.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update' : 'Create')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}