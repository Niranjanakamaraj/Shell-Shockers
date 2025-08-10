'use client'

import { useEffect, useRef } from 'react'

interface BoxPlotProps {
  data: any[]
}

export function BoxPlot({ data }: BoxPlotProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current || !data || data.length === 0) return

    import('plotly.js-dist-min').then((PlotlyModule) => {
      const Plotly = PlotlyModule.default || PlotlyModule

      const numericKeys = Object.keys(data[0]).filter(
        (key) => typeof data[0][key] === 'number'
      )

      const traces = numericKeys.map((key, index) => ({
        y: data.map((row) => row[key]),
        name: key,
        type: 'box' as const,
        boxpoints: 'all',
        jitter: 0.5,
        pointpos: -1.8
      }))

      const layout = {
        title: 'Box Plot of Components',
        yaxis: { title: 'Value' },
        height: 500
      }

      Plotly.newPlot(chartRef.current!, traces, layout, { responsive: true })
    })

    return () => {
      if (chartRef.current) {
        import('plotly.js-dist-min').then((PlotlyModule) => {
          const Plotly = PlotlyModule.default || PlotlyModule
          Plotly.purge(chartRef.current!)
        })
      }
    }
  }, [data])

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-600 bg-purple-50 p-3 rounded-lg">
        <strong>Insight:</strong> This box plot visualizes the distribution of each component across
        samples, highlighting medians, ranges, and outliers.
      </div>
      <div ref={chartRef} className="w-full" />
    </div>
  )
}