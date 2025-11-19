'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { FormSchema, FormField } from '../../_lib/types'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface DynamicFormProps {
  schema: FormSchema
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

export function DynamicForm({ schema }: DynamicFormProps) {
  const zodSchema = createZodSchema(schema.schema.fields)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm({
    resolver: zodResolver(zodSchema)
  })

  const onSubmit = async (data: any) => {
    try {
      const supabase = createClient()
      
      // Convert form data to match database types
      const processedData: Record<string, any> = {}
      schema.schema.fields.forEach(field => {
        let value = data[field.name]
        
        if (field.type === 'number' && typeof value === 'string') {
          value = parseFloat(value)
        }
        
        processedData[field.name] = value
      })
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      // Save to _form_data table as JSON
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
        reset()
      }
    } catch (err) {
      toast.error('An error occurred')
    }
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schema.schema.fields.map(renderField)}
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => reset()}>
          Reset
        </Button>
        <Button type="submit">
          Submit
        </Button>
      </div>
    </form>
  )
}