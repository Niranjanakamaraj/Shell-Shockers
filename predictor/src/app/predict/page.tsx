"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, Upload, FileText } from "lucide-react";
import "./page.css";

export default function Predict() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [predictedFileUrl, setPredictedFileUrl] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
    } else {
      toast.error("Invalid File", {
        description: "Please upload a valid CSV file.",
      });
    }
  };

  const handlePrediction = async () => {
    if (!csvFile) {
      toast.error("No File Selected", {
        description: "Please upload a CSV file first.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Prediction failed");

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      setPredictedFileUrl(downloadUrl);

      toast.success("Prediction Successful", {
        description: "Download the result using the button below.",
      });
    } catch (error) {
      toast.error("Error", {
        description: "Failed to get prediction from the server.",
      });
    }
  };

  const downloadTemplate = () => {
    const csvContent =
      "Component Name,Fraction (%),Density (kg/m³),Viscosity (cSt),Sulfur (ppm)\nComponent 1,50,850,2.5,10\nComponent 2,30,820,1.8,15\nComponent 3,20,880,3.2,5";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "blend_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="upload-container">
      <h2 className="upload-title">CSV File Upload</h2>
      <p className="upload-subtitle">
        Upload a CSV file with your blend data. Download the template to see the required format.
      </p>

      {/* Upload Box */}
      <div className="upload-box">
        <Upload className="upload-icon" />
        <p className="upload-text">Drop your CSV file here</p>
        <label className="upload-file-label">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="upload-input"
          />
          <span className="upload-choose-btn">Choose File</span>
          <div className="visualize-file-info">
            <FileText className="h-3 w-3" />
            {csvFile ? csvFile.name : "No file chosen"}
          </div>
        </label>
      </div>

     {/* Buttons Row — all in one flex container */}
<div className="buttons-row">
  <button className="template-btn" onClick={downloadTemplate}>
    <Download className="h-4 w-4" />
    Download Template
  </button>

  <button
    className="predict-btn"
    onClick={handlePrediction}
  >
    Predict
  </button>

  <button
    className="visualize-btn"
    onClick={() => router.push("/output")}
  >
    Visualize Output
  </button>

  <button
    className="dp"
    onClick={() => {
      if (!predictedFileUrl) return;
      const a = document.createElement("a");
      a.href = predictedFileUrl;
      a.download = "predicted_results.csv";
      a.click();
    }}
  >
    <Download className="h-4 w-4" />
    Download Prediction
  </button>
</div>


      {/* Requirements Section */}
      <div className="requirements-buttons-wrapper">
        <div className="requirements-box">
          <h4>
            <strong>CSV Format Requirements:</strong>
          </h4>
          <ul>
            <li>First row must contain headers</li>
            <li>Component fractions must sum to 100%</li>
            <li>All numeric values must be positive</li>
            <li>Maximum file size: 10MB</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
