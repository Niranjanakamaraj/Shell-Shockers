import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ScrollArea } from '@/components/ui/scroll-area'

interface DataTableProps {
  data: any[]
}

function formatCell(value: any) {
  if (typeof value === 'number') return value.toFixed(3)
  if (value === null || value === undefined) return ''
  return String(value)
}

function DataTable({ data }: DataTableProps) {
  if (!data || data.length === 0) return null

  const columns = Object.keys(data[0])

  return (
<<<<<<< HEAD
    <ScrollArea className="h-96 w-full border rounded-md bg-white shadow">
      <Table>
        <TableHeader className="sticky top-0 bg-white z-10">
          <TableRow>
            <TableHead className="w-12 font-semibold text-center bg-slate-100">#</TableHead>
            {columns.map((column) => (
              <TableHead key={column} className="font-semibold min-w-32 bg-slate-100 text-center">
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index} className={index % 2 === 0 ? 'bg-slate-50' : ''}>
              <TableCell className="font-medium text-slate-500 text-center">
                {index + 1}
              </TableCell>
              {columns.map((column) => (
                <TableCell key={column} className="font-mono text-sm text-center">
                  {formatCell(row[column])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
=======
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <ScrollArea className="h-96 w-full max-w-full border rounded-md bg-white shadow" style={{ maxWidth: '100%' }}>
        <Table className="visualize-table" style={{ margin: '0 auto', width: 'max-content', minWidth: '100%' }}>
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow>
              <TableHead className="w-12 font-semibold text-center bg-slate-100">#</TableHead>
              {columns.map((column) => (
                <TableHead key={column} className="font-semibold min-w-32 bg-slate-100 text-center">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index} className={index % 2 === 0 ? 'bg-slate-50' : ''}>
                <TableCell className="font-medium text-slate-500 text-center">
                  {index + 1}
                </TableCell>
                {columns.map((column) => (
                  <TableCell key={column} className="font-mono text-sm text-center">
                    {formatCell(row[column])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
>>>>>>> stephanus
  )
}

export default DataTable;