import { getFormSchema, getFormData } from '../_lib/queries'
import { FormDataTable } from './_components/form-data-table'
import { notFound } from 'next/navigation'

interface FormViewPageProps {
  params: Promise<{ id: string }>
}

export default async function FormViewPage({ params }: FormViewPageProps) {
  const { id } = await params
  const { data: schema, error } = await getFormSchema(id)
  const { data: formData } = await getFormData(id)

  if (error || !schema) {
    notFound()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-primary">{schema.name}</h1>
      <FormDataTable data={formData || []} schema={schema} />
    </div>
  )
}