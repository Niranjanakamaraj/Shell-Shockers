"use client";
import React, { useState } from "react";
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
      if (!text || typeof text !== 'string') return;
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
    <div className="validation-bg">
      <div className="validation-container">
        <div className="validation-title">CSV Format Validation</div>
        <label className="amazing-upload-label">
          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleCSVUpload}
            className="amazing-upload-input"
          />
          <span className="amazing-upload-btn">Choose File</span>
          <span className="amazing-upload-filename">{userColumns.length > 0 ? userColumns.join(', ') : 'No file chosen'}</span>
        </label>
        {matchPercent !== null && (
          <div className="validation-result">
            <div className="validation-bar-outer">
              <div className="validation-bar-inner" style={{ width: `${matchPercent}%` }}></div>
            </div>
            <div className="validation-label">{matchPercent}% match ({matchCount} of {requiredColumns.length} columns)</div>
            {matchPercent < 100 && (
              <div className="validation-missing-cols">
                <span>Missing columns:</span>
                <ul>
                  {requiredColumns.filter(col => !userColumns.includes(col)).slice(0, 10).map(col => (
                    <li key={col}>{col}</li>
                  ))}
                  {requiredColumns.filter(col => !userColumns.includes(col)).length > 10 && <li>...and more</li>}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
