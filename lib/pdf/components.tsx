import { View, Text } from '@react-pdf/renderer'
import { commonStyles } from './styles'

interface TableColumn {
  header: string
  key: string
  width?: number
}

interface TableProps {
  columns: TableColumn[]
  data: any[]
}

export function PDFTable({ columns, data }: TableProps) {
  return (
    <View style={commonStyles.table}>
      <View style={[commonStyles.tableRow, commonStyles.tableHeader]} fixed>
        {columns.map((col) => (
          <Text key={col.key} style={[commonStyles.tableCell, col.width ? { flex: col.width } : {}]}>
            {col.header}
          </Text>
        ))}
      </View>
      {data.map((row, idx) => (
        <View key={idx} style={commonStyles.tableRow}>
          {columns.map((col) => (
            <Text key={col.key} style={[commonStyles.tableCell, col.width ? { flex: col.width } : {}]}>
              {row[col.key] || '-'}
            </Text>
          ))}
        </View>
      ))}
    </View>
  )
}

interface HeaderProps {
  title: string
  subtitle?: string
}

export function PDFHeader({ title, subtitle }: HeaderProps) {
  return (
    <View style={commonStyles.header}>
      <Text style={commonStyles.title}>{title}</Text>
      {subtitle && <Text style={commonStyles.subtitle}>{subtitle}</Text>}
    </View>
  )
}

interface FooterProps {
  text: string
}

export function PDFFooter({ text }: FooterProps) {
  return (
    <Text style={commonStyles.footer} fixed>
      {text}
    </Text>
  )
}
