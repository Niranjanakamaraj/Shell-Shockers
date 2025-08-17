"use client";
import React, { useState } from "react";
import { Upload, FileText, Grid3X3 } from 'lucide-react'
import "./page.css";

export default function ValidationPage() {
  const requiredColumns = [
    "ID",
    ...Array.from({ length: 5 }, (_, i) => `Component${i + 1}_fraction`),
    ...Array.from({ length: 10 }, (_, propIdx) =>
      Array.from({ length: 5 }, (_, compIdx) => `Component${compIdx + 1}_Property${propIdx + 1}`)
    ).flat()
  ];

  const [matchPercent, setMatchPercent] = useState<number | null>(null);
  const [matchCount, setMatchCount] = useState<number>(0);
  const [userColumns, setUserColumns] = useState<string[]>([]);

  function handleCSVUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
      const text = evt.target?.result;
      if (!text || typeof text !== "string") return;

      const firstLine = text.split(/\r?\n/)[0];
      const columns = firstLine.split(/,|\t/).map((s: string) => s.trim());

      setUserColumns(columns);

      let match = 0;
      for (let col of requiredColumns) {
        if (columns.includes(col)) match++;
      }
      setMatchCount(match);
      setMatchPercent(Math.round((match / requiredColumns.length) * 100));
    };
    reader.readAsText(file);
  }

  return (
    <div className="upload-container">
      <div className="upload-title">FUEL BLEND CSV VALIDATION</div>
      <div className="upload-subtitle">Upload your CSV to ensure it has the correct format for blend property prediction</div>

      <div className="upload-box">
        <label className="upload-file-label">
          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleCSVUpload}
            className="upload-input"
          />
            <Upload className="upload-icon-large" />
          <span className="upload-text">Drag & Drop or</span>
          <span className="upload-choose-btn">Select File</span>
          {userColumns.length > 0 && (
            <span className="upload-filename">{userColumns.join(", ")}</span>
          )}
        </label>
      </div>

      {matchPercent !== null && (
        <div className="requirements-box">
          <h4>Validation Results</h4>
          <div className="validation-bar-outer">
            <div
              className="validation-bar-inner"
              style={{ width: `${matchPercent}%` }}
            ></div>
          </div>
          <p className="validation-label">
            {matchPercent}% Column match :({matchCount} of {requiredColumns.length} columns)
          </p>

          {matchPercent < 100 && (
            <div className="validation-missing-cols">
              <span>Missing required columns:</span>
              <ul>
                {requiredColumns
                  .filter((col) => !userColumns.includes(col))
                  .slice(0, 10)
                  .map((col) => (
                    <li key={col}>{col}</li>
                  ))}
                {requiredColumns.filter((col) => !userColumns.includes(col))
                  .length > 10 && <li>...and more</li>}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}