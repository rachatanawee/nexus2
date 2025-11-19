import { FormSchemaTable } from './_components/form-schema-table'
import { getFormSchemas } from './_lib/queries'

export default async function FormBuilderPage() {
  const { data: schemas } = await getFormSchemas()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-primary">Form Builder</h1>
      <FormSchemaTable data={schemas || []} />
    </div>
  )
}