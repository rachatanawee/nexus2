import { Document, Page, View, Text } from '@react-pdf/renderer'
import { commonStyles, PDFHeader, PDFTable, PDFFooter, formatDate } from '@/lib/pdf'

interface User {
  id: string
  email: string
  full_name?: string
  roles: string[]
  created_at: string
}

interface UserListPDFProps {
  users: User[]
  generatedBy: string
}

export function UserListPDF({ users, generatedBy }: UserListPDFProps) {
  const columns = [
    { header: 'Email', key: 'email', width: 2 },
    { header: 'Full Name', key: 'full_name', width: 2 },
    { header: 'Roles', key: 'roles', width: 1 },
    { header: 'Created', key: 'created_at', width: 1 },
  ]

  const data = users.map(u => ({
    email: u.email,
    full_name: u.full_name || '-',
    roles: u.roles.join(', '),
    created_at: formatDate(new Date(u.created_at)),
  }))

  return (
    <Document>
      <Page size="A4" style={commonStyles.page}>
        <PDFHeader 
          title="User List Report" 
          subtitle={`Generated on ${formatDate(new Date())} by ${generatedBy}`}
        />
        
        <View style={commonStyles.section}>
          <Text style={commonStyles.label}>Total Users: {users.length}</Text>
        </View>

        <PDFTable columns={columns} data={data} />

        <PDFFooter text="Confidential - Internal Use Only" />
      </Page>
    </Document>
  )
}
