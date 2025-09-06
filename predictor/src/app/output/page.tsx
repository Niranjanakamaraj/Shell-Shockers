"use client";

import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import dynamic from "next/dynamic";
import "./page.css";

// ✅ Dynamically import Plotly so it's not used during SSR
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

// --- Define CSV row type ---
type BlendRow = {
  [key: string]: string | number; // all columns can be string or number
};

export default function OutputPage() {
  const [data, setData] = useState<BlendRow[]>([]); // ✅ updated type
  const [selectedRow, setSelectedRow] = useState(0);

  // Load CSV from /public
  useEffect(() => {
    Papa.parse("/sample_solution.csv", {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (result) => {
        setData(result.data);
      },
    });
  }, []);

  if (data.length === 0) {
    return <p className="loading-text">Loading data...</p>;
  }

  const row = data[selectedRow];

  // ---------- Bar Chart ----------
  const barCategories = Object.keys(row).slice(1, 11);
  const barValues = barCategories.map((col) => row[col] ?? 0);

  const barData = [
    {
      type: "bar",
      x: barCategories,
      y: barValues,
      marker: { color: "teal" },
    },
  ];

  // ---------- Parallel Coordinates ----------
  const parallelData = [
    {
      type: "parcoords",
      line: { color: "blue" },
      dimensions: Object.keys(data[0])
        .slice(1, 6)
        .map((col) => ({
          label: col,
          values: data.map((r) => r[col]),
        })),
    },
  ];

  // ---------- Radar Chart ----------
  const radarCategories = Object.keys(row).slice(1, 11);
  const radarValues = radarCategories.map((col) => row[col] ?? 0);

  const radarData = [
    {
      type: "scatterpolar",
      r: radarValues,
      theta: radarCategories,
      fill: "toself",
      name: `Row ${selectedRow + 1}`,
    },
  ];

  // ---------- Pie Chart ----------
  const pieLabels = Object.keys(row).slice(1, 11);
  const pieValues = pieLabels.map((col) => row[col]);

  const pieData = [
    {
      type: "pie",
      labels: pieLabels,
      values: pieValues,
    },
  ];

  return (
    <div className="output-container">
      <h1 className="page-title">Visualization Dashboard</h1>

      {/* Row Selector */}
      <div className="row-selector">
        <label className="row-label">Select Row:</label>
        <select
          value={selectedRow}
          onChange={(e) => setSelectedRow(Number(e.target.value))}
          className="row-select"
        >
          {data.map((_, i) => (
            <option key={i} value={i}>
              Row {i + 1}
            </option>
          ))}
        </select>
      </div>

      <div className="chart-card">
        <h2>Bar Chart</h2>
        <p>
          <b> Compares the magnitude of each blend property
          for the selected row. </b><br />
        </p>
        <Plot data={barData} layout={{ height: 400 }} /><br />
        <b> Lets you see which property dominates and
          which ones are weaker at a glance.</b>
      </div>

      <div className="chart-card">
        <h2>Parallel Coordinates</h2>
    
        <b> Each blend property is placed on a vertical
          axis, and the row values are connected across axes.</b> 
         
        <Plot data={parallelData} layout={{ height: 400 }} /><br />
        <b> Helps visualize relationships and patterns
          across all rows simultaneously</b>.
      </div>

      <div className="chart-card">
        <h2>Radar Chart</h2>
      
        <b>Plots all blend properties in a circular layout
          for the selected row.</b>  <br />
          
        <Plot
          data={radarData}
          layout={{
            polar: { radialaxis: { visible: true } },
            showlegend: false,
            height: 400,
          }}
        /><br />
        <b>You can easily spot balance or imbalance —
          e.g., if one property spikes much higher, it shows asymmetry.
        </b> 
      </div>

      <div className="chart-card">
        <h2>Pie Chart</h2>
        <b> Displays the percentage contribution of each blend property for the selected row.</b>
        <br />
         
        <Plot data={pieData} layout={{ height: 400 }} />
        <br />
        <b> Great for showing distribution — which
          properties take up most of the “blend composition”.</b>
      </div>
    </div>
  );
}