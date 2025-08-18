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
        >
          Component Fractions
        </button>
        <button
          onClick={() => onVisualizationToggle("box-plot")}
          className={`visualize-selector-btn${selectedVisualization === "box-plot" ? " selected" : ""}`}
        >
        Property Distribution
        </button>
        <button
          onClick={() => onVisualizationToggle("correlation-matrix")}
          className={`visualize-selector-btn${selectedVisualization === "correlation-matrix" ? " selected" : ""}`}
        >
         Property Correlations
        </button>
        <button
          onClick={() => onVisualizationToggle("pair-plot")}
          className={`visualize-selector-btn${selectedVisualization === "pair-plot" ? " selected" : ""}`}
        >
          Pairwise Relationships
        </button>
        <button
          onClick={() => onVisualizationToggle("dimensionality-reduction")}
          className={`visualize-selector-btn${selectedVisualization === "dimensionality-reduction" ? " selected" : ""}`}
        >
          Blend Projection
        </button>
      </div>

      {/* Render Selected Visualization */}
      <div className="border p-4 rounded bg-white shadow" style={{ textAlign: 'center' }}>
        {selectedVisualization === "stacked-bar" && <StackedBarPlot data={data} />}
        {selectedVisualization === "box-plot" && <BoxPlot data={data} />}
        {selectedVisualization === "correlation-matrix" && <CorrelationHeatmap data={data} />}
        {selectedVisualization === "pair-plot" && <PairPlot data={data} />}
        {selectedVisualization === "dimensionality-reduction" && (
          <DimensionalityReduction data={data} />
        )}
        {!selectedVisualization && (
  <p style={{
    color: '#16213e',   // gray-500
    fontSize: '30px',
    border: 'none!important',
    marginTop: '10px',
    outline: 'none !important',       // remove any outline
    boxShadow: 'none !important',
    textAlign: 'center',
    background: 'transparent' 
  }}
  tabIndex={-1} >
    Select a visualization to explore your fuel blend data.
  </p>
)}
      </div>
    </div>
  );
}