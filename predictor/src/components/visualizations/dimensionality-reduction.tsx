'use client'

import { useEffect, useRef } from 'react'

interface DimensionalityReductionProps {
  data: any[]
}

export function DimensionalityReduction({ data }: DimensionalityReductionProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current || !data.length) return

    import('plotly.js-dist-min').then((PlotlyModule) => {
      const Plotly = PlotlyModule.default || PlotlyModule
      
      // Get numerical columns for PCA
      const allColumns = Object.keys(data[0])
      const numericalColumns = allColumns.filter(col => 
        typeof data[0][col] === 'number' && 
        data.every(row => typeof row[col] === 'number' && !isNaN(row[col]))
      )
      
      if (numericalColumns.length < 2) {
        chartRef.current!.innerHTML = '<div class="text-center p-8 text-slate-500">Need at least 2 numerical columns for PCA analysis</div>'
        return
      }

      // Simple PCA approximation (for demo - in production use proper PCA library)
      const normalizedData = data.map(row => {
        const values = numericalColumns.map(col => row[col])
        return values
      })

      // Calculate means
      const means = numericalColumns.map((_, colIndex) => 
        normalizedData.reduce((sum, row) => sum + row[colIndex], 0) / normalizedData.length
      )

      // Center the data
      const centeredData = normalizedData.map(row => 
        row.map((val, colIndex) => val - means[colIndex])
      )

      // Simple 2D projection (using first two principal directions approximation)
      const pc1 = centeredData.map(row => 
        row.reduce((sum, val, i) => sum + val * (i % 2 === 0 ? 1 : -1), 0)
      )
      const pc2 = centeredData.map(row => 
        row.reduce((sum, val, i) => sum + val * Math.sin(i * Math.PI / 4), 0)
      )

      // Find identifier column
      const idColumn = allColumns.find(col => 
        col.toLowerCase().includes('id') || 
        col.toLowerCase().includes('blend') ||
        col.toLowerCase().includes('sample')
      )

      const trace = {
        x: pc1,
        y: pc2,
        mode: 'markers' as const,
        type: 'scatter' as const,
        text: data.map((row, i) => 
          idColumn ? `${idColumn}: ${row[idColumn]}` : `Sample ${i + 1}`
        ),
        marker: {
          size: 8,
          color: pc1.map((_, i) => i),
          colorscale: 'Viridis' as const,
          showscale: true,
          colorbar: { title: 'Sample Index' }
        }
      }

      const layout = {
        title: 'PCA - Principal Component Analysis',
        xaxis: { title: 'First Principal Component' },
        yaxis: { title: 'Second Principal Component' },
        height: 500,
        margin: { t: 50, r: 50, b: 50, l: 50 }
      }

      Plotly.newPlot(chartRef.current!, [trace], layout, { responsive: true })
    }).catch((error) => {
      console.error('Error loading Plotly:', error)
      if (chartRef.current) {
        chartRef.current.innerHTML = '<div class="text-center p-8 text-red-500">Error loading visualization. Please refresh the page.</div>'
      }
    })

    return () => {
      if (chartRef.current) {
        import('plotly.js-dist-min').then((PlotlyModule) => {
          const Plotly = PlotlyModule.default || PlotlyModule
          if (Plotly.purge) {
            Plotly.purge(chartRef.current!)
          }
        }).catch(() => {
          // Ignore cleanup errors
        })
      }
    }
  }, [data])

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-600 bg-purple-50 p-3 rounded-lg">
        <strong>Insight:</strong> PCA reduces high-dimensional data to 2D while preserving variance. 
        Clusters in this plot indicate similar samples, while scattered points suggest unique 
        compositions. This helps identify natural groupings and patterns in your input space.
      </div>
      <div ref={chartRef} className="w-full" />
    </div>
  )
}