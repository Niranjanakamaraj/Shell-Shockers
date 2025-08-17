"use client";

import React, { useState } from "react";
import "./page.css";

const tabs = [
  { label: "Getting Started", key: "getting-started" },
  { label: "User Guide", key: "user-guide" },
  { label: "FAQ", key: "faq" },
  { label: "Samples", key: "samples" },
];

export default function Help() {
  const [activeTab, setActiveTab] = useState("getting-started");

  return (
    <div className="doc-bg">
      <h1 className="doc-title">Documentation & Help</h1>
      <div className="doc-subtitle">
        Complete guides, examples, and troubleshooting for the fuel blend prediction tool
      </div>

      {/* Tabs */}
      <div className="doc-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`doc-tab${activeTab === tab.key ? " active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="doc-content">
        {activeTab === "getting-started" && <GettingStarted />}
        {activeTab === "user-guide" && <UserGuide />}
        {activeTab === "faq" && <FAQ />}
        {activeTab === "samples" && <Samples />}
      </div>
    </div>
  );
}

// ------------------ Tab Components ------------------

function GettingStarted() {
  return (
    <div className="doc-section">
      <h2 className="doc-section-title">Quick Start Guide</h2>
      <ol className="doc-quickstart-list">
        <li>
          <span className="doc-step-num">1</span>
          <b>Prepare Your Blend Data</b> – Collect component fractions and property data (BlendProperty1–10) for all fuel components.
        </li>
        <li>
          <span className="doc-step-num">2</span>
          <b>Upload or Enter Data</b> – Use the CSV upload or the manual input form to provide blend composition.
        </li>
        <li>
          <span className="doc-step-num">3</span>
          <b>Predict Properties</b> – The system predicts blend properties automatically.
        </li>
        <li>
          <span className="doc-step-num">4</span>
          <b>Analyze & Optimize</b> – Use interactive visualizations to find the optimal fuel blend.
        </li>
      </ol>
    </div>
  );
}

function UserGuide() {
  return (
    <div className="doc-section">
      <h2 className="doc-section-title">User Guide</h2>

      <p className="userguide-intro">
        This guide explains how to use the Fuel Blend Property Prediction tool effectively.
        Follow the instructions below to input data, predict properties, analyze results, and
        export your data.
      </p>

      <div className="userguide-item">
        <h3>CSV Validation</h3>
        <p className="userguide-desc">
          Upload your blend data using a CSV file. The tool checks for required headers
          (Component fractions, Component properties) and validates numerical values.
          Invalid or missing data is highlighted to prevent errors during prediction.
        </p>
      </div>

      <div className="userguide-item">
        <h3>Property Prediction</h3>
        <p className="userguide-desc">
          The tool predicts BlendProperty1 to BlendProperty10 for your uploaded or manually
          entered blend data. Predictions are computed using trained machine learning models
          based on historical fuel blend datasets.
        </p>
      </div>

      <div className="userguide-item">
        <h3>Best Blend Selection</h3>
        <p className="userguide-desc">
          Enter target values for specific blend properties. The tool automatically highlights
          the blend from your dataset that best matches these targets, making optimization
          simple and fast.
        </p>
      </div>

      <div className="userguide-item">
        <h3>Visualization Tools</h3>
        <p className="userguide-desc">
          Explore your blend data using interactive visualizations including Stacked Bar
          Charts, Box Plots, Correlation Heatmaps, Pair Plots, and Dimensionality Reduction
          (PCA/TSNE).
        </p>
      </div>

      <div className="userguide-item">
        <h3>Export Results</h3>
        <p className="userguide-desc">
          Download predictions, best blend tables, and visualizations as CSV or image files
          for reporting or further analysis. All exported files preserve the same structure
          and property precision.
        </p>
      </div>

      <div className="userguide-item">
        <h3>Error Handling</h3>
        <p className="userguide-desc">
          The tool provides clear notifications if your CSV contains missing or invalid data,
          if prediction fails, or if input values are out of acceptable ranges. This ensures
          you can quickly correct issues without confusion.
        </p>
      </div>
    </div>
  );
}


function FAQ() {
  return (
    <div className="doc-section">
      <h2 className="doc-section-title">Frequently Asked Questions</h2>
      <ul className="doc-faq-list">
        <li>
          <b>What headers should my CSV have?</b><br />
          The first row must contain: ID, Component1_fraction–Component5_fraction, Component1_Property1–Component5_Property10.
        </li>
        <li>
          <b>What if my CSV fails validation?</b><br />
          Check for missing columns or incorrect numeric values. Fractions must sum to 1 (or 100%). 
        </li>
        <li>
          <b>How reliable are the predictions?</b><br />
          Predictions use trained models based on historical fuel blends; accuracy depends on input quality.
        </li>
        <li>
          <b>How do I interpret visualizations?</b><br />
          Hover over charts for tooltips; colors indicate deviation from target properties.
        </li>
      </ul>
    </div>
  );
}

function Samples() {
  return (
    <div className="doc-section">
      <h2 className="doc-section-title">Sample File & Example</h2>
      <div className="doc-sample-row">
        <div className="doc-sample-col">
          <b>Template Files</b>
          <div><a className="doc-download-btn" href="/sample.csv" download>CSV Template</a></div>
        </div>
      </div>
      <div className="doc-csv-example">
        <b>CSV Format Example</b>
        <pre>{`ID,Component1_fraction,Component2_fraction,Component3_fraction,Component4_fraction,Component5_fraction,Component1_Property1,...,Component5_Property10
1,0.18,0.05,0.32,0.37,0.08,-0.177804157,...,-0.77705749`}</pre>
      </div>
    </div>
  );
}