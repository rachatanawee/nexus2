'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormSchema, FormField, FormSubmission } from '../../_lib/types'
import { createClient } from '@/lib/supabase/client'
import { updateFormData } from '../../_lib/actions'

interface FormDataDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schema: FormSchema
  submission?: FormSubmission | null
}

function createZodSchema(fields: FormField[]) {
  const schemaObject: Record<string, z.ZodTypeAny> = {}
  
  fields.forEach(field => {
    let zodType: z.ZodTypeAny
    
    switch (field.type) {
      case 'number':
        zodType = z.number()
        if (field.validation?.min !== undefined) {
          zodType = (zodType as z.ZodNumber).min(field.validation.min)
        }
        if (field.validation?.max !== undefined) {
          zodType = (zodType as z.ZodNumber).max(field.validation.max)
        }
        break
      case 'checkbox':
        zodType = z.boolean()
        break
      case 'date':
        zodType = z.string().min(1, `${field.label} is required`)
        break
      default:
        zodType = z.string()
        if (field.validation?.minLength) {
          zodType = (zodType as z.ZodString).min(field.validation.minLength, `${field.label} must be at least ${field.validation.minLength} characters`)
        }
        if (field.validation?.maxLength) {
          zodType = (zodType as z.ZodString).max(field.validation.maxLength, `${field.label} must be at most ${field.validation.maxLength} characters`)
        }
        if (field.validation?.pattern) {
          zodType = (zodType as z.ZodString).regex(new RegExp(field.validation.pattern), `${field.label} format is invalid`)
        }
    }
    
    if (!field.required) {
      zodType = zodType.optional()
    }
    
    schemaObject[field.name] = zodType
  })
  
  return z.object(schemaObject)
}

export function FormDataDialog({ open, onOpenChange, schema, submission }: FormDataDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isEdit = !!submission
  const zodSchema = createZodSchema(schema.schema.fields)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm({
    resolver: zodResolver(zodSchema)
  })

  useEffect(() => {
    if (submission?.data) {
      // Reset form with submission data when editing
      reset(submission.data)
    } else {
      // Reset form with empty values when creating
      reset({})
    }
  }, [submission, reset])

  const onSubmit = async (data: any) => {
    setLoading(true)
    try {
      const processedData: Record<string, any> = {}
      schema.schema.fields.forEach(field => {
        let value = data[field.name]
        
        if (field.type === 'number' && typeof value === 'string') {
          value = parseFloat(value)
        }
        
        processedData[field.name] = value
      })
      
      if (isEdit && submission) {
        // Update existing submission
        const formData = new FormData()
        formData.append('id', submission.id)
        formData.append('data', JSON.stringify(processedData))
        
        const result = await updateFormData({ success: false, message: '' }, formData)
        
        if (result.success) {
          toast.success(result.message)
          onOpenChange(false)
          reset()
          router.refresh()
        } else {
          toast.error(result.message)
        }
      } else {
        // Create new submission
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        const { error } = await supabase
          .from('_form_data')
          .insert({
            form_schema_id: schema.id,
            data: processedData,
            submitted_by: user?.id
          })
        
        if (error) {
          toast.error(error.message)
        } else {
          toast.success('Data saved successfully')
          onOpenChange(false)
          reset()
          router.refresh()
        }
      }
    } catch (err) {
      toast.error('An error occurred')
    }
    setLoading(false)
  }

  const renderField = (field: FormField) => {
    const error = errors[field.name]
    
    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.name}>
            <Label htmlFor={field.name}>
              {field.label} {field.required && '*'}
            </Label>
            <Textarea
              id={field.name}
              {...register(field.name)}
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <p className="text-sm text-red-600 mt-1">{error.message as string}</p>
            )}
          </div>
        )
      
      case 'select':
        return (
          <div key={field.name}>
            <Label htmlFor={field.name}>
              {field.label} {field.required && '*'}
            </Label>
            <Select onValueChange={(value) => setValue(field.name, value)}>
              <SelectTrigger className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder={`Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && (
              <p className="text-sm text-red-600 mt-1">{error.message as string}</p>
            )}
          </div>
        )
      
      case 'checkbox':
        return (
          <div key={field.name} className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              onCheckedChange={(checked) => setValue(field.name, checked)}
            />
            <Label htmlFor={field.name}>
              {field.label} {field.required && '*'}
            </Label>
            {error && (
              <p className="text-sm text-red-600 mt-1">{error.message as string}</p>
            )}
          </div>
        )
      
      default:
        return (
          <div key={field.name}>
            <Label htmlFor={field.name}>
              {field.label} {field.required && '*'}
            </Label>
            <Input
              id={field.name}
              type={field.type}
              step={field.validation?.step}
              {...register(field.name, { 
                valueAsNumber: field.type === 'number' 
              })}
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <p className="text-sm text-red-600 mt-1">{error.message as string}</p>
            )}
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Data' : 'Add Data'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schema.schema.fields.map(renderField)}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (isEdit ? 'Updating...' : 'Saving...') : (isEdit ? 'Update' : 'Save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}