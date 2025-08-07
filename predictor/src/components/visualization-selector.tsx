"use client";
import React, { useState } from "react";

// Importing existing visualizations
import { BoxPlot } from "@/components/visualizations/box-plot";
import { CorrelationHeatmap } from "@/components/visualizations/correlation-heatmap";
import { DimensionalityReduction } from "@/components/visualizations/dimensionality-reduction";
import { PairPlot } from "@/components/visualizations/pair-plot";
import { StackedBarPlot } from "@/components/visualizations/stacked-bar-plot";

// Sample data for demo/testing
const demoData = [
  { BlendID: "Sample 1", ComponentA: 0.3, ComponentB: 0.5, ComponentC: 0.2 },
  { BlendID: "Sample 2", ComponentA: 0.1, ComponentB: 0.6, ComponentC: 0.3 },
  { BlendID: "Sample 3", ComponentA: 0.4, ComponentB: 0.2, ComponentC: 0.4 },
];

export default function VisualizationSelector() {
  const [selectedViz, setSelectedViz] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      {/* Button Selector */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setSelectedViz("stacked-bar")}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
        >
          Stacked Bar
        </button>
        <button
          onClick={() => setSelectedViz("box-plot")}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
        >
          Box Plot
        </button>
        <button
          onClick={() => setSelectedViz("correlation-matrix")}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
        >
          Correlation Matrix
        </button>
        <button
          onClick={() => setSelectedViz("pair-plot")}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
        >
          Pair Plot
        </button>
        <button
          onClick={() => setSelectedViz("dimensionality-reduction")}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
        >
          Dimensionality Reduction
        </button>
      </div>

      {/* Render Selected Visualization */}
      <div className="border p-4 rounded bg-white shadow">
        {selectedViz === "stacked-bar" && <StackedBarPlot data={demoData} />}
        {selectedViz === "box-plot" && <BoxPlot data={demoData} />}
        {selectedViz === "correlation-matrix" && <CorrelationHeatmap data={demoData} />}
        {selectedViz === "pair-plot" && <PairPlot data={demoData} />}
        {selectedViz === "dimensionality-reduction" && (
          <DimensionalityReduction data={demoData} />
        )}
        {!selectedViz && (
          <p className="text-gray-500">Select a visualization to display.</p>
        )}
      </div>
    </div>
  );
}