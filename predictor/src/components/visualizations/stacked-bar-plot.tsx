'use client';

import { useEffect, useRef } from 'react';

interface StackedBarPlotProps {
  data?: any[]; // ✅ allow undefined
}

export function StackedBarPlot({ data = [] }: StackedBarPlotProps) { // ✅ default to empty array
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current || !Array.isArray(data) || data.length === 0) return;

    import('plotly.js-dist-min')
      .then((PlotlyModule) => {
        const Plotly = PlotlyModule.default || PlotlyModule;

        const allColumns = Object.keys(data[0] || {});
        const componentColumns = allColumns.filter((col) =>
          col.toLowerCase().includes('component') ||
          col.toLowerCase().includes('fraction') ||
          col.toLowerCase().includes('comp')
        );

        if (componentColumns.length === 0) {
          const numericColumns = allColumns.filter(
            (col) => typeof data[0][col] === 'number' && data[0][col] <= 1
          );
          componentColumns.push(...numericColumns.slice(0, 4));
        }

        const idColumn =
          allColumns.find(
            (col) =>
              col.toLowerCase().includes('id') ||
              col.toLowerCase().includes('blend') ||
              col.toLowerCase().includes('sample')
          ) || allColumns[0];

        const identifiers = data.map(
          (row, index) => row[idColumn] || `Sample ${index + 1}`
        );

        const traces = componentColumns.map((component, index) => ({
          x: identifiers,
          y: data.map((row) => row[component] || 0),
          name: component,
          type: 'bar' as const,
          marker: {
            color: [
              '#3b82f6',
              '#ef4444',
              '#10b981',
              '#f59e0b',
              '#8b5cf6',
              '#f97316',
              '#06b6d4',
              '#84cc16',
            ][index % 8],
          },
        }));

        const layout = {
          title: 'Component Fractions per Sample',
          xaxis: { title: idColumn },
          yaxis: { title: 'Fraction' },
          barmode: 'stack' as const,
          height: 500,
          margin: { t: 50, r: 50, b: 100, l: 50 },
        };

        Plotly.newPlot(chartRef.current!, traces, layout, { responsive: true });
      })
      .catch((error) => {
        console.error('Error loading Plotly:', error);
        if (chartRef.current) {
          chartRef.current.innerHTML =
            '<div class="text-center p-8 text-red-500">Error loading visualization. Please refresh the page.</div>';
        }
      });

    return () => {
      if (chartRef.current) {
        import('plotly.js-dist-min')
          .then((PlotlyModule) => {
            const Plotly = PlotlyModule.default || PlotlyModule;
            if (Plotly.purge) {
              Plotly.purge(chartRef.current!);
            }
          })
          .catch(() => {
            // Ignore cleanup errors
          });
      }
    };
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg">
        <strong>Insight:</strong> This stacked bar chart shows how much each component contributes
        to the total composition. Each bar represents a sample, and the colored segments show the fraction
        of each component. This helps identify which samples are dominated by specific components.
      </div>
      <div ref={chartRef} className="w-full" />
    </div>
  );
}