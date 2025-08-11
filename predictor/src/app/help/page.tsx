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
      <div className="doc-subtitle">Complete guides, examples, and troubleshooting for the fuel blend prediction tool</div>
      <div className="doc-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`doc-tab${activeTab === tab.key ? " active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="doc-content">
        {activeTab === "getting-started" && <GettingStarted />}
        {activeTab === "user-guide" && <UserGuide />}
        {activeTab === "faq" && <FAQ />}
        {activeTab === "samples" && <Samples />}
      </div>
    </div>
  );
}

function GettingStarted() {
  return (
    <div className="doc-section">
      <h2 className="doc-section-title">Quick Start Guide</h2>
      <ol className="doc-quickstart-list">
        <li>
          <span className="doc-step-num">1</span>
          <b>Prepare Your Data</b> – Gather component fractions and properties (density, viscosity, sulfur content) for your fuel blend.
        </li>
        <li>
          <span className="doc-step-num">2</span>
          <b>Input Your Blend</b> – Use the manual input form or upload a CSV file with your blend composition data.
        </li>
        <li>
          <span className="doc-step-num">3</span>
          <b>Get Predictions</b> – View predicted properties and download results for further analysis.
        </li>
        <li>
          <span className="doc-step-num">4</span>
          <b>Analyze & Optimize</b> – Use visualization tools and scenario exploration to optimize your blend.
        </li>
      </ol>
    </div>
  );
}

function UserGuide() {
  return (
    <div className="doc-section">
      <h2 className="doc-section-title">User Guide</h2>
      <ul className="doc-feature-list">
        <li><b>Input Validation:</b> Upload your CSV or use the form. The tool checks for correct format and missing data.</li>
        <li><b>Prediction:</b> Predicts 10+ blend properties using machine learning models.</li>
        <li><b>Visualization:</b> Interactive charts and dashboards for blend analysis.</li>
        <li><b>Download Results:</b> Export predictions and visualizations for reporting.</li>
        <li><b>Error Handling:</b> Clear feedback for invalid input or processing errors.</li>
      </ul>
    </div>
  );
}

function FAQ() {
  return (
    <div className="doc-section">
      <h2 className="doc-section-title">Frequently Asked Questions</h2>
      <ul className="doc-faq-list">
        <li><b>What format should my CSV be in?</b><br />See the Samples tab for a template and example.</li>
        <li><b>What do I do if I get a validation error?</b><br />Check your CSV for missing columns or invalid values. See the User Guide for details.</li>
        <li><b>How accurate are the predictions?</b><br />The models are trained on extensive Shell blend data for high accuracy, but results depend on input quality.</li>
        <li><b>How do I interpret the charts?</b><br />Hover over chart elements for tooltips. See the User Guide for more info.</li>
      </ul>
    </div>
  );
}

function Samples() {
  return (
    <div className="doc-section">
      <h2 className="doc-section-title">Sample Files & Examples</h2>
      <div className="doc-sample-row">
        <div className="doc-sample-col">
          <b>Template Files</b>
          <div><a className="doc-download-btn" href="/sample.csv" download>CSV Template</a></div>
          <div><a className="doc-download-btn" href="/advanced-sample.csv" download>Advanced Template</a></div>
        </div>
        <div className="doc-sample-col">
          <b>Example Data</b>
          <div><a className="doc-download-btn" href="/diesel-blends.csv" download>Diesel Blends</a></div>
          <div><a className="doc-download-btn" href="/gasoline-blends.csv" download>Gasoline Blends</a></div>
        </div>
      </div>
      <div className="doc-csv-example">
        <b>CSV Format Example</b>
        <pre>{`Component Name,Fraction (%),Density (kg/m³),Viscosity (cSt),Sulfur (ppm)
Base Diesel,60.0,845.2,2.8,12.5
Bio Component,25.0,880.1,4.2,2.1
Additive Package,15.0,820.5,1.9,8.7`}</pre>
      </div>
    </div>
  );
}
