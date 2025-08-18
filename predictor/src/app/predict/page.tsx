"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, Upload, FileText } from "lucide-react";
import "./page.css";

// CSV parser without external library
const parseCSV = (csvText: string) => {
  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    return headers.reduce((obj, header, idx) => {
      const num = parseFloat(values[idx]);
      obj[header] = isNaN(num) ? values[idx] : num;
      return obj;
    }, {} as Record<string, any>);
  });
};

export default function Predict() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [predictedFileUrl, setPredictedFileUrl] = useState<string | null>(null);
  const [blendData, setBlendData] = useState<any[] | null>(null);

  const [trainData, setTrainData] = useState<any[]>([]);
  const [targetProperties, setTargetProperties] = useState<(number | "")[]>(
    Array(10).fill("")
  );
  const [bestMatch, setBestMatch] = useState<any | null>(null);
  const [showBestBlend, setShowBestBlend] = useState(false); // control rendering

  const router = useRouter();

  useEffect(() => {
    fetch("/train.csv")
      .then((res) => {
        if (!res.ok) throw new Error("Could not load train.csv");
        return res.text();
      })
      .then((csvText) => {
        setTrainData(parseCSV(csvText));
      })
      .catch(() => {
        toast.error("Error loading train.csv");
      });
  }, []);

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

      const text = await blob.text();
      const lines = text.trim().split("\n");
      const headers = lines[0].split(",");
      const rows = lines.slice(1).map((line) => {
        const values = line.split(",");
        return headers.reduce((obj, header, idx) => {
          obj[header] = values[idx];
          return obj;
        }, {} as Record<string, string>);
      });
      setBlendData(rows);

      toast.success("Prediction Successful", {
        description: "Results are displayed below and ready for download.",
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

  const handleTargetChange = (index: number, value: string) => {
    const updated = [...targetProperties];
    const num = parseFloat(value);
    updated[index] = isNaN(num) ? "" : num;
    setTargetProperties(updated);
  };

  const getColor = (value: number, target: number) => {
    if (!target) return "white";
    const diff = Math.abs(value - target) / target;
    if (diff < 0.05) return "#00ff0d8a"; // green
    if (diff < 0.15) return "#facc15"; // yellow
    return "#f87171"; // red
  };

  const filteredHeaders =
    trainData.length > 0
      ? Object.keys(trainData[0]).filter((h) =>
          h.toLowerCase().includes("blendproperty")
        )
      : [];

  // ------------------ Best Blend Auto-Update ------------------
  useEffect(() => {
    if (trainData.length === 0 || targetProperties.every((v) => v === "")) {
      setBestMatch(null);
      return;
    }

    let bestRow: any = null;
    let bestScore = Infinity;

    trainData.forEach((row) => {
      let score = 0;
      let count = 0;

      targetProperties.forEach((target, i) => {
        if (target !== "") {
          const header = `BlendProperty${i + 1}`;
          const value = row[header];
          if (typeof value === "number") {
            score += Math.pow(value - Number(target), 2);
            count++;
          }
        }
      });

      if (count > 0) {
        score = score / count;
        if (score < bestScore) {
          bestScore = score;
          bestRow = row;
        }
      }
    });

    setBestMatch(bestRow);
  }, [targetProperties, trainData]);
  // ---------------------------------------------------

  return (
    <div className="upload-container">
      <h2 className="upload-title">FUEL BLEND PREDICTION</h2>
      <p className="upload-subtitle">
        Upload your fuel blend CSV data. Use the template to see the required format for accurate predictions.
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
          <span className="upload-choose-btn">Select File</span>
          <div className="visualize-file-info">
            <FileText className="h-3 w-3" />
            {csvFile ? csvFile.name : "No file chosen"}
          </div>
        </label>
      </div>

      {/* Buttons Row */}
      <div className="buttons-row">
        <button className="template-btn" onClick={downloadTemplate}>
          <Download className="h-4 w-4" />
          Download Template
        </button>

        <button
          className="template-btn"
          onClick={() => setShowBestBlend(true)}
        >
          Best Blend Suggestion
        </button>

        <button className="predict-btn" onClick={handlePrediction}>
          Predict Blend Properties
        </button>

        <button
          className="visualize-btn"
          onClick={() => router.push("/output")}
        >
          Visualize Predicted Blends
        </button>

        <button
          className="dp"
          onClick={() => {
            if (predictedFileUrl) {
              const a = document.createElement("a");
              a.href = predictedFileUrl;
              a.download = "predicted_results.csv";
              a.click();
            } else {
              const a = document.createElement("a");
              a.href = "/Sample_solution.csv"; // public folder
              a.download = "Sample_solution.csv";
              a.click();
            }
          }}
        >
          <Download className="h-4 w-4" />
          Download Prediction Results
        </button>
      </div>

      {/* Show Best Blend Section */}
      {showBestBlend && (
        <>
          <h3 className="bestblend-heading">
            Best Matching Blend Based on Your Target Properties
          </h3>

          {/* BlendProperty Input Row */}
          <div className="validation-container">
            <div className="blendproperty-row">
              {targetProperties.map((val, i) => (
                <div key={i} className="blendproperty-item">
                  <label className="blendproperty-label">
                   Target BlendProperty{i + 1}
                  </label>
                  <input
                    type="number"
                    step="0.00001"
                    pattern="^[0-9]*[.,]?[0-9]{0,5}$"
                    value={val}
                    onChange={(e) => handleTargetChange(i, e.target.value)}
                    className="blendproperty-input"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Best Match Section */}
          {bestMatch && (
            <div className="bestmatch-container">
              <h3 className="bestmatch-title">Best Match Blend</h3>
              <p className="bestmatch-subtitle">
                Closest to your input properties:
              </p>
              <table className="blendproperty-table">
                <thead>
                  <tr>
                    {Object.keys(bestMatch)
                      .filter(
                        (header) =>
                          header.includes("Component") &&
                          header.includes("_fraction")
                      )
                      .map((header, idx) => (
                        <th key={idx}>{header}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {Object.entries(bestMatch)
                      .filter(
                        ([key]) =>
                          key.includes("Component") &&
                          key.includes("_fraction")
                      )
                      .map(([_, val], idx) => (
                        <td key={idx}>
                          {typeof val === "number" ? val.toFixed(5) : val}
                        </td>
                      ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Training Data Table */}
          {trainData.length > 0 && (
            <div className="overflow-x-auto">
              <table className="blendproperty-table">
                <thead>
                  <tr>
                    {filteredHeaders.map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trainData.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {filteredHeaders.map((header) => {
                        const value = row[header];
                        const isBlendProperty = header
                          .toLowerCase()
                          .includes("blendproperty");
                        const targetIndex = isBlendProperty
                          ? parseInt(header.replace(/\D/g, ""), 10) - 1
                          : -1;
                        return (
                          <td
                            key={header}
                            style={{
                              backgroundColor:
                                isBlendProperty && typeof value === "number"
                                  ? getColor(
                                      value,
                                      targetProperties[targetIndex]
                                    )
                                  : "white",
                            }}
                          >
                            {typeof value === "number" ? value.toFixed(5) : value}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Inline Blend Results Table */}
      {blendData && (
        <div className="mt-6 animate-wobble">
          <h3 className="text-lg font-bold mb-2">Predicted Blend Properties</h3>
          <p className="text-lg font-semibold mb-2">
  View all predicted values for your uploaded fuel blends. Use the export button to download results.
</p>
          <div className="overflow-x-auto">
            <table className="blendproperty-table">
              <thead>
                <tr>
                  {Object.keys(blendData[0]).map((header, idx) => (
                    <th key={idx}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {blendData.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((val, j) => (
                      <td key={j}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Requirements Section */}
      <div className="requirements-buttons-wrapper">
  <div className="requirements-box">
    <h4><strong>CSV Format Requirements for Fuel Blend Prediction</strong></h4>
    <ul>
      <li>First row must contain headers exactly as shown in the template:</li>
      <ul className="nested-list">
        <li>ID</li>
        <li>Component1_fraction, Component2_fraction, ..., Component5_fraction</li>
        <li>
          Component1_Property1, Component2_Property1, ..., Component5_Property10
        </li>
      </ul>
      <li>Fractions of all components in a single blend must sum to 1 (or 100%).</li>
      <li>Blend property values can be positive or negative numbers depending on the property type.</li>
      <li>All numeric values must be valid decimals (up to 5 decimal places recommended).</li>
      <li>Maximum file size allowed: 10MB.</li>
    </ul>
    <p className="requirements-note">
      Use the "Download Template" button to get a correctly formatted CSV with example data.
    </p>
  </div>
</div>

    </div>
  );
}