'use client'

import { useEffect, useRef } from 'react'

interface CorrelationHeatmapProps {
  data: any[]
}

export function CorrelationHeatmap({ data }: CorrelationHeatmapProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current || !data.length) return

    import('plotly.js-dist-min').then((PlotlyModule) => {
      const Plotly = PlotlyModule.default || PlotlyModule
      
      // Get only numerical columns
      const allColumns = Object.keys(data[0])
      const numericalColumns = allColumns.filter(col => 
        typeof data[0][col] === 'number' && 
        data.every(row => typeof row[col] === 'number' && !isNaN(row[col]))
      )
      
      if (numericalColumns.length < 2) {
        chartRef.current!.innerHTML = '<div class="text-center p-8 text-slate-500">Not enough numerical columns for correlation analysis</div>'
        return
      }
      
      // Calculate correlation matrix
      const correlationMatrix = numericalColumns.map(col1 => 
        numericalColumns.map(col2 => {
          if (col1 === col2) return 1
          
          const values1 = data.map(d => d[col1])
          const values2 = data.map(d => d[col2])
          
          // Calculate Pearson correlation coefficient
          const n = values1.length
          const mean1 = values1.reduce((a, b) => a + b, 0) / n
          const mean2 = values2.reduce((a, b) => a + b, 0) / n
          
          const numerator = values1.reduce((sum, v1, i) => 
            sum + (v1 - mean1) * (values2[i] - mean2), 0)
          
          const denominator = Math.sqrt(
            values1.reduce((sum, v) => sum + Math.pow(v - mean1, 2), 0) *
            values2.reduce((sum, v) => sum + Math.pow(v - mean2, 2), 0)
          )
          
          return denominator === 0 ? 0 : numerator / denominator
        })
      )

      const trace = {
        z: correlationMatrix,
        x: numericalColumns,
        y: numericalColumns,
        type: 'heatmap' as const,
        colorscale: 'RdBu' as const,
        zmid: 0,
        showscale: true,
        text: correlationMatrix.map(row => 
          row.map(val => val.toFixed(3))
        ),
        texttemplate: '%{text}',
        textfont: { size: 10 }
      }

      const layout = {
        title: 'Property Correlation Matrix',
        xaxis: { title: 'Properties', tickangle: -45 },
        yaxis: { title: 'Properties' },
        height: Math.max(400, numericalColumns.length * 40),
        margin: { t: 50, r: 50, b: 150, l: 150 }
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
      <div className="text-sm text-slate-600 bg-red-50 p-3 rounded-lg">
        <strong>Insight:</strong> This correlation heatmap reveals relationships between different 
        numerical properties. Red indicates positive correlation, blue indicates negative correlation. 
        Strong correlations (close to +1 or -1) suggest dependencies or redundancy in features.
      </div>
      <div ref={chartRef} className="w-full" />
    </div>
  )
}