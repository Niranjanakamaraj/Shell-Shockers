export async function parseCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string
        const lines = csvText.split('\n').filter(line => line.trim() !== '')
        
        if (lines.length === 0) {
          reject(new Error('Empty file'))
          return
        }
        
        // Parse header
        const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''))
        
        // Parse data rows
        const data = lines.slice(1).map((line, index) => {
          const values = line.split(',').map(value => value.trim().replace(/"/g, ''))
          const row: any = {}
          
          headers.forEach((header, i) => {
            const value = values[i] || ''
            // Try to convert to number if possible
            const numValue = parseFloat(value)
            row[header] = isNaN(numValue) ? value : numValue
          })
          
          return row
        })
        
        resolve(data)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}