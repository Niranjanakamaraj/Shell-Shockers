"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "./page.css";

export default function Home() {
  const router = useRouter();
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = '/sample.csv';
    link.download = 'sample.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    <div className="separate-bg">
      {/* Hero Section */}
      <div className="separate-hero">
        <h1 className="separate-title">
          Shell Fuel Blend Prediction Tool
        </h1>
        <div className="separate-subtitle">
         <b> Predict key fuel blend properties, optimize compositions, and make data-driven decisions with precision.</b>
        </div>
        <div className="separate-btn-row">
          <button className="separate-btn-primary" onClick={() => router.push('/predict')}>Get Started →</button>
          <button className="separate-btn-secondary" onClick={() => router.push('/help')}>View Documentation</button>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="separate-card-row features">
        {/* Data Input */}
        <div className="separate-card feature-card">
          <div className="separate-card-icon red"><span role="img" aria-label="upload">⤴️</span></div>
          <div className="separate-card-title">Input Validation</div>
          <div className="separate-card-desc">Check your CSV inputs for correct format before predicting.</div>
          <button className="separate-card-action amazing" onClick={() => router.push('/validation')}>Start Validation</button>
        </div>
        {/* Predictions */}
        <div className="separate-card feature-card">
          <div className="separate-card-icon yellow"><span role="img" aria-label="lightning">⚡</span></div>
          <div className="separate-card-title">Predictions</div>
          <div className="separate-card-desc">Get accurate predictions for 10 key blend properties instantly</div>
          <button className="separate-card-action amazing" onClick={() => router.push('/predict')}>View Results</button>
        </div>
        {/* Visualization */}
        <div className="separate-card feature-card">
          <div className="separate-card-icon red"><span role="img" aria-label="bar chart">📊</span></div>
          <div className="separate-card-title">Visualization</div>
          <div className="separate-card-desc">Explore interactive charts and dashboards for blend analysis and comparisons.</div>
          <button className="separate-card-action amazing" onClick={() => router.push('/visualize')}>Open Dashboard</button>
        </div>
        {/* Quick Start */}
        <div className="separate-card feature-card">
          <div className="separate-card-icon yellow"><span role="img" aria-label="csv">📄<span className="csv-label">CSV</span></span></div>
          <div className="separate-card-title">Quick Start</div>
          <div className="separate-card-desc">Download a sample CSV and begin predicting immediately.</div>
          <button className="separate-card-action amazing quick" onClick={handleDownload}>Download Sample CSV</button>
        </div>
        {/* Documentation */}
        <div className="separate-card feature-card">
          <div className="separate-card-icon red"><span role="img" aria-label="docs">📄</span></div>
          <div className="separate-card-title">Documentation</div>
          <div className="separate-card-desc">Comprehensive user guide</div>
          <button className="separate-card-action amazing doc" onClick={() => router.push('/help')}>Read Docs</button>
        </div>
      </div>

    {/* Why Use This Tool Section */}
    <div className="whyuse-section">
      <div className="whyuse-title">Why Use This Tool?</div>
      <div className="whyuse-features-row">
        <div className="whyuse-feature-card">
          <div className="whyuse-feature-icon red">🎯</div>
          <div className="whyuse-feature-title red">Accurate Predictions</div>
          <div className="whyuse-feature-desc">Machine learning models trained on extensive fuel blend data</div>
        </div>
        <div className="whyuse-feature-card center">
          <div className="whyuse-feature-icon yellow">✨</div>
          <div className="whyuse-feature-title yellow">Intuitive Interface</div>
          <div className="whyuse-feature-desc">Simple upload, validation, and prediction workflow</div>
        </div>
        <div className="whyuse-feature-card">
          <div className="whyuse-feature-icon red">📊</div>
          <div className="whyuse-feature-title red">Comprehensive Analysis</div>
          <div className="whyuse-feature-desc">Visual dashboards let you explore trends and scenarios quickly</div>
        </div>
      </div>
    </div>
  </div>
  );
}