import { Document, Page, View, Text } from '@react-pdf/renderer'
import { commonStyles, PDFHeader, PDFTable, PDFFooter, formatDate } from '@/lib/pdf'
import type { Product } from '../products/_lib/types'

interface ProductListPDFProps {
  products: Product[]
  generatedBy: string
}

export function ProductListPDF({ products, generatedBy }: ProductListPDFProps) {
  const columns = [
    { header: 'Name', key: 'name', width: 2 },
    { header: 'SKU', key: 'sku', width: 1 },
    { header: 'Price', key: 'price', width: 1 },
    { header: 'Stock', key: 'stock', width: 1 },
  ]

  const data = products.map(p => ({
    name: p.name,
    sku: p.sku || '-',
    price: p.price ? `$${p.price}` : '-',
    stock: p.stock?.toString() || '0',
  }))

  return (
    <Document>
      <Page size="A4" style={commonStyles.page}>
        <PDFHeader 
          title="Product List Report" 
          subtitle={`Generated on ${formatDate(new Date())} by ${generatedBy}`}
        />
        
        <View style={commonStyles.section}>
          <Text style={commonStyles.label}>Total Products: {products.length}</Text>
        </View>

        <PDFTable columns={columns} data={data} />

        <PDFFooter text="Confidential - Internal Use Only" />
      </Page>
    </Document>
  )
}
