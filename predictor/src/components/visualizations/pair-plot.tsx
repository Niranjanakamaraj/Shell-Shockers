'use client'

import { useEffect, useRef } from 'react'

interface PairPlotProps {
  data: any[]
}

export function PairPlot({ data }: PairPlotProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current || !data.length) return

    import('plotly.js-dist-min').then((PlotlyModule) => {
      const Plotly = PlotlyModule.default || PlotlyModule
      
      // Get numerical columns
      const allColumns = Object.keys(data[0])
      const numericalColumns = allColumns.filter(col => 
        typeof data[0][col] === 'number' && 
        data.every(row => typeof row[col] === 'number' && !isNaN(row[col]))
      ).slice(0, 4) // Limit to first 4 for readability
      
      if (numericalColumns.length < 2) {
        chartRef.current!.innerHTML = '<div class="text-center p-8 text-slate-500">Need at least 2 numerical columns for pair plot analysis</div>'
        return
      }

      // Create scatter plots for each pair
      const traces: any[] = []
      
      for (let i = 0; i < numericalColumns.length; i++) {
        for (let j = 0; j < numericalColumns.length; j++) {
          if (i !== j) {
            traces.push({
              x: data.map(d => d[numericalColumns[j]]),
              y: data.map(d => d[numericalColumns[i]]),
              mode: 'markers',
              type: 'scatter',
              name: `${numericalColumns[i]} vs ${numericalColumns[j]}`,
              showlegend: false,
              marker: {
                size: 4,
                color: '#3b82f6',
                opacity: 0.6
              },
              xaxis: `x${j + 1}`,
              yaxis: `y${i + 1}`
            })
          }
        }
      }

      const layout: any = {
        title: 'Pairwise Property Relationships',
        height: 600,
        margin: { t: 80, r: 50, b: 80, l: 80 }
      }

      // Configure subplot axes
      for (let i = 0; i < numericalColumns.length; i++) {
        for (let j = 0; j < numericalColumns.length; j++) {
          const axisIndex = i * numericalColumns.length + j + 1
          if (axisIndex === 1) {
            layout.xaxis = { title: numericalColumns[j], domain: [j / numericalColumns.length, (j + 1) / numericalColumns.length] }
            layout.yaxis = { title: numericalColumns[i], domain: [1 - (i + 1) / numericalColumns.length, 1 - i / numericalColumns.length] }
          } else {
            layout[`xaxis${axisIndex}`] = { 
              title: numericalColumns[j], 
              domain: [j / numericalColumns.length, (j + 1) / numericalColumns.length],
              anchor: `y${axisIndex}`
            }
            layout[`yaxis${axisIndex}`] = { 
              title: numericalColumns[i], 
              domain: [1 - (i + 1) / numericalColumns.length, 1 - i / numericalColumns.length],
              anchor: `x${axisIndex}`
            }
          }
        }
      }

      Plotly.newPlot(chartRef.current!, traces, layout, { responsive: true })
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
      <div className="text-sm text-slate-600 bg-orange-50 p-3 rounded-lg">
        <strong>Insight:</strong> Pair plots show relationships between every combination of numerical 
        properties. Look for linear trends, clusters, or outliers that indicate how properties 
        relate to each other across your samples. This helps identify correlations and dependencies.
      </div>
      <div ref={chartRef} className="w-full" />
    </div>
  )
}