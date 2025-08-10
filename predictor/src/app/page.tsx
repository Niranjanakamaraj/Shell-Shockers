import React from "react";
import "./home/page.css";

export default function Home() {
  return (
    <div className="home-container">
      <div className="home-title">Shell Fuel Blend Prediction Tool</div>
      <div className="home-subtitle">
        Advanced machine learning-powered tool for predicting fuel blend properties.<br />
        Optimize your fuel compositions with precision and confidence.
      </div>
      <div className="home-btn-row">
        <button className="home-btn-primary">Get Started →</button>
        <button className="home-btn-secondary">View Documentation</button>
      </div>
      <div className="home-card-grid">
        <div className="home-card">
          <span className="home-card-icon" role="img" aria-label="upload">📤</span>
          <div className="home-card-title">Data Input</div>
          <div className="home-card-desc">Manual input forms and CSV upload with automatic validation</div>
          <div className="home-card-action">
            <button className="home-card-action-btn">Start Input</button>
          </div>
        </div>
        <div className="home-card">
          <span className="home-card-icon" role="img" aria-label="lightning">⚡</span>
          <div className="home-card-title">Predictions</div>
          <div className="home-card-desc">Get accurate predictions for 10 key blend properties instantly</div>
          <div className="home-card-action">
            <button className="home-card-action-btn">View Results</button>
          </div>
        </div>
        <div className="home-card">
          <span className="home-card-icon" role="img" aria-label="chart">📊</span>
          <div className="home-card-title">Visualization</div>
          <div className="home-card-desc">Interactive charts and dashboards for blend analysis</div>
          <div className="home-card-action">
            <button className="home-card-action-btn">Open Dashboard</button>
          </div>
        </div>
        <div className="home-card">
          <span className="home-card-icon" role="img" aria-label="gear">⚙️</span>
          <div className="home-card-title">Scenario Exploration</div>
          <div className="home-card-desc">Interactive sliders for real-time blend optimization</div>
        </div>
        <div className="home-card">
          <span className="home-card-icon" role="img" aria-label="doc">📄</span>
          <div className="home-card-title">Documentation</div>
          <div className="home-card-desc">Comprehensive guides, examples, and troubleshooting</div>
        </div>
        <div className="home-card">
          <span className="home-card-icon" role="img" aria-label="csv">📄 CSV</span>
          <div className="home-card-title">Quick Start</div>
          <div className="home-card-desc">Download sample data and get started immediately</div>
        </div>
      </div>
    </div>
  );
}