'use client'

export function formatNumber(value: number, locale = 'en-US', decimals = 2, useThousands = true) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: useThousands
  }).format(value)
}

export function formatDate(date: Date, format = 'MM/dd/yyyy') {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  switch (format) {
    case 'dd/MM/yyyy': return `${day}/${month}/${year}`
    case 'yyyy-MM-dd': return `${year}-${month}-${day}`
    default: return `${month}/${day}/${year}`
  }
}
