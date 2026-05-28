/**
 * Export utility for generating CSV downloads with Persian text support
 */

/**
 * Convert an array of objects to CSV string with UTF-8 BOM for Excel compatibility
 */
export function objectsToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T; label: string }[]
): string {
  // UTF-8 BOM for Excel to recognize encoding
  const BOM = '\uFEFF'
  
  // Header row
  const header = columns.map(col => `"${col.label}"`).join(',')
  
  // Data rows
  const rows = data.map(item => {
    return columns.map(col => {
      const value = item[col.key]
      // Handle null/undefined
      if (value === null || value === undefined) return '""'
      // Escape quotes and wrap in quotes
      const str = String(value).replace(/"/g, '""')
      return `"${str}"`
    }).join(',')
  })
  
  return BOM + header + '\n' + rows.join('\n')
}

/**
 * Trigger a CSV file download in the browser
 */
export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export data to CSV and download
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T; label: string }[],
  filename: string
) {
  const csv = objectsToCSV(data, columns)
  downloadCSV(csv, filename)
}
