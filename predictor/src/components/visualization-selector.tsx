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

<<<<<<< HEAD
export default function VisualizationSelector() {
  const [selectedViz, setSelectedViz] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      {/* Button Selector */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setSelectedViz("stacked-bar")}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
=======
interface VisualizationSelectorProps {
  selectedVisualization: string | null;
  onVisualizationToggle: (vizType: string) => void;
  data: any[];
}

export default function VisualizationSelector({ selectedVisualization, onVisualizationToggle, data, centerButtons }: VisualizationSelectorProps & { centerButtons?: boolean }) {
  return (
    <div className="flex flex-col gap-6" style={{ alignItems: 'center', textAlign: 'center' }}>
      {/* Button Selector */}
      <div className={centerButtons ? "visualize-selector-btns" : "flex flex-wrap gap-3"}>
        <button
          onClick={() => onVisualizationToggle("stacked-bar")}
          className={`visualize-selector-btn${selectedVisualization === "stacked-bar" ? " selected" : ""}`}
>>>>>>> stephanus
        >
          Stacked Bar
        </button>
        <button
<<<<<<< HEAD
          onClick={() => setSelectedViz("box-plot")}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
=======
          onClick={() => onVisualizationToggle("box-plot")}
          className={`visualize-selector-btn${selectedVisualization === "box-plot" ? " selected" : ""}`}
>>>>>>> stephanus
        >
          Box Plot
        </button>
        <button
<<<<<<< HEAD
          onClick={() => setSelectedViz("correlation-matrix")}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
=======
          onClick={() => onVisualizationToggle("correlation-matrix")}
          className={`visualize-selector-btn${selectedVisualization === "correlation-matrix" ? " selected" : ""}`}
>>>>>>> stephanus
        >
          Correlation Matrix
        </button>
        <button
<<<<<<< HEAD
          onClick={() => setSelectedViz("pair-plot")}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
=======
          onClick={() => onVisualizationToggle("pair-plot")}
          className={`visualize-selector-btn${selectedVisualization === "pair-plot" ? " selected" : ""}`}
>>>>>>> stephanus
        >
          Pair Plot
        </button>
        <button
<<<<<<< HEAD
          onClick={() => setSelectedViz("dimensionality-reduction")}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition"
=======
          onClick={() => onVisualizationToggle("dimensionality-reduction")}
          className={`visualize-selector-btn${selectedVisualization === "dimensionality-reduction" ? " selected" : ""}`}
>>>>>>> stephanus
        >
          Dimensionality Reduction
        </button>
      </div>

      {/* Render Selected Visualization */}
<<<<<<< HEAD
      <div className="border p-4 rounded bg-white shadow">
        {selectedViz === "stacked-bar" && <StackedBarPlot data={demoData} />}
        {selectedViz === "box-plot" && <BoxPlot data={demoData} />}
        {selectedViz === "correlation-matrix" && <CorrelationHeatmap data={demoData} />}
        {selectedViz === "pair-plot" && <PairPlot data={demoData} />}
        {selectedViz === "dimensionality-reduction" && (
          <DimensionalityReduction data={demoData} />
        )}
        {!selectedViz && (
=======
      <div className="border p-4 rounded bg-white shadow" style={{ textAlign: 'center' }}>
        {selectedVisualization === "stacked-bar" && <StackedBarPlot data={data} />}
        {selectedVisualization === "box-plot" && <BoxPlot data={data} />}
        {selectedVisualization === "correlation-matrix" && <CorrelationHeatmap data={data} />}
        {selectedVisualization === "pair-plot" && <PairPlot data={data} />}
        {selectedVisualization === "dimensionality-reduction" && (
          <DimensionalityReduction data={data} />
        )}
        {!selectedVisualization && (
>>>>>>> stephanus
          <p className="text-gray-500">Select a visualization to display.</p>
        )}
      </div>
    </div>
  );
}