"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Download, 
  Upload, 
  FileText, 
  Play, 
  Pause, 
  CheckCircle, 
  XCircle, 
  Clock,
  Settings,
  Database,
  Brain,
  BarChart3,
  Trash2,
  Eye
} from "lucide-react";
import "./page.css";

interface TrainingConfig {
  model_name: string;
  target_transformation: "none" | "power" | "standard" | "minmax";
  feature_engineering: boolean;
  validation_split: number;
  cross_validation_folds: number;
  device_preference: "auto" | "cpu" | "cuda";
  save_model: boolean;
}

interface TrainingJob {
  job_id: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  message: string;
  start_time?: string;
  end_time?: string;
  model_path?: string;
  metrics?: Record<string, number>;
}

interface Dataset {
  filename: string;
  upload_date: string;
  file_size: number;
  columns: number;
  sample_columns: string[];
}

interface Model {
  model_name: string;
  file_path: string;
  creation_date: string;
  file_size: number;
  config: Record<string, any>;
  metrics?: Record<string, number>;
}

export default function Train() {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const [models, setModels] = useState<Model[]>([]);
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
  const [activeTab, setActiveTab] = useState<"upload" | "configure" | "monitor" | "models">("upload");

  const [config, setConfig] = useState<TrainingConfig>({
    model_name: "",
    target_transformation: "power",
    feature_engineering: true,
    validation_split: 0.2,
    cross_validation_folds: 5,
    device_preference: "auto",
    save_model: true
  });

  const [isTraining, setIsTraining] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  const router = useRouter();

  // Load datasets, models, training jobs on mount
  useEffect(() => {
    loadDatasets();
    loadModels();
    loadTrainingJobs();
  }, []);

  // Poll training status
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentJobId && isTraining) {
      interval = setInterval(() => {
        checkTrainingStatus(currentJobId);
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentJobId, isTraining]);

  const loadDatasets = async () => {
    try {
      const response = await fetch("/api/train/datasets");
      if (response.ok) {
        const data = await response.json();
        setDatasets(data.datasets || []);
      }
    } catch (error) {
      console.error("Error loading datasets:", error);
    }
  };

  const loadModels = async () => {
    try {
      const response = await fetch("/api/train/models");
      if (response.ok) {
        const data = await response.json();
        setModels(data.models || []);
      }
    } catch (error) {
      console.error("Error loading models:", error);
    }
  };

  const loadTrainingJobs = async () => {
    try {
      const response = await fetch("/api/train/training_jobs");
      if (response.ok) {
        const data = await response.json();
        setTrainingJobs(data.jobs || []);
      }
    } catch (error) {
      console.error("Error loading training jobs:", error);
    }
  };

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

  const handleDatasetUpload = async () => {
    if (!csvFile) {
      toast.error("No File Selected", {
        description: "Please select a CSV file first.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", csvFile);

    try {
      const response = await fetch("/api/train/upload_dataset", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();
      toast.success("Dataset Uploaded", {
        description: `Successfully uploaded ${result.filename}`,
      });

      setCsvFile(null);
      loadDatasets();
      setActiveTab("configure");
    } catch (error) {
      toast.error("Upload Error", {
        description: "Failed to upload dataset.",
      });
    }
  };

  const handleStartTraining = async () => {
    if (!selectedDataset) {
      toast.error("No Dataset Selected", {
        description: "Please select a dataset to train on.",
      });
      return;
    }

    if (!config.model_name.trim()) {
      toast.error("Model Name Required", {
        description: "Please enter a name for your model.",
      });
      return;
    }

    try {
      const response = await fetch(
        `/api/train/start_training?dataset_filename=${selectedDataset}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(config),
        }
      );

      if (!response.ok) throw new Error("Training start failed");

      const result = await response.json();
      setCurrentJobId(result.job_id);
      setIsTraining(true);
      setActiveTab("monitor");

      toast.success("Training Started", {
        description: `Job ${result.job_id} has been queued.`,
      });

      loadTrainingJobs();
    } catch (error) {
      toast.error("Training Error", {
        description: "Failed to start training.",
      });
    }
  };

  const checkTrainingStatus = async (jobId: string) => {
    try {
      const response = await fetch(`/api/train/training_status/${jobId}`);
      if (response.ok) {
        const job = await response.json();

        setTrainingJobs(prev =>
          prev.map(j => (j.job_id === jobId ? job : j))
        );

        if (job.status === "completed" || job.status === "failed") {
          setIsTraining(false);
          setCurrentJobId(null);

          if (job.status === "completed") {
            toast.success("Training Completed", {
              description: `Model ${job.model_path} is ready!`,
            });
            loadModels();
          } else {
            toast.error("Training Failed", {
              description: job.message,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error checking training status:", error);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `ID,Component1_fraction,Component2_fraction,...`; // full template as needed
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "training_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteModel = async (modelName: string) => {
    if (!confirm(`Are you sure you want to delete model: ${modelName}?`)) return;

    try {
      const response = await fetch(`/api/train/models/${modelName}`, { method: "DELETE" });
      if (response.ok) {
        toast.success("Model Deleted", { description: `Successfully deleted ${modelName}` });
        loadModels();
      }
    } catch (error) {
      toast.error("Delete Error", { description: "Failed to delete model." });
    }
  };

  const downloadModel = async (modelName: string) => {
    try {
      const response = await fetch(`/api/train/download_model/${modelName}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${modelName}.pkl`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      toast.error("Download Error", { description: "Failed to download model." });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "running": return <Play className="h-4 w-4 text-blue-500 animate-spin" />;
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

 return (
  <div className="train-container">
    <h2 className="train-title">Model Training Center</h2>
    <p className="train-subtitle">
      Train new blend property prediction models with your data
    </p>

    {/* Tab Navigation */}
    <div className="tab-navigation">
      {[
        { id: "upload", label: "Upload Data", icon: Upload },
        { id: "configure", label: "Configure", icon: Settings },
        { id: "monitor", label: "Monitor", icon: BarChart3 },
        { id: "models", label: "Models", icon: Brain },
      ].map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className={`tab-button ${activeTab === id ? "active" : ""}`}
          onClick={() => setActiveTab(id as any)}
        >
          <Icon className="tab-icon" />
          {label}
        </button>
      ))}
    </div>

    {/* Upload Tab */}
    {activeTab === "upload" && (
      <div className="tab-content">
        <div className="upload-box">
          <Database className="upload-icon" />
          <p className="upload-text">Upload Training Dataset</p>
          <label className="upload-file-label">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="upload-input"
            />
            <span className="upload-choose-btn">Choose CSV File</span>
            <div className="visualize-file-info">
              <FileText className="file-info-icon" />
              {csvFile ? csvFile.name : "No file chosen"}
            </div>
          </label>
        </div>

        <div className="buttons-row">
          <button className="btn btn-primary" onClick={downloadTemplate}>
            <Download className="btn-icon" />
            Download Template
          </button>
          <button className="btn btn-primary" onClick={handleDatasetUpload}>
            <Upload className="btn-icon" />
            Upload Dataset
          </button>
        </div>

        {/* Existing Datasets */}
        {datasets.length > 0 && (
          <div className="datasets-section">
            <h3 className="section-title">Available Datasets</h3>
            <div className="table-wrapper">
              <table className="blendproperty-table">
                <thead>
                  <tr>
                    <th>Filename</th>
                    <th>Upload Date</th>
                    <th>Size</th>
                    <th>Columns</th>
                    <th>Sample Columns</th>
                  </tr>
                </thead>
                <tbody>
                  {datasets.map((dataset, idx) => (
                    <tr key={idx}>
                      <td>{dataset.filename}</td>
                      <td>
                        {new Date(dataset.upload_date).toLocaleDateString()}
                      </td>
                      <td>{formatFileSize(dataset.file_size)}</td>
                      <td>{dataset.columns}</td>
                      <td>{dataset.sample_columns.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )}

    {/* Configure Tab */}
    {activeTab === "configure" && (
      <div className="tab-content">
        <div className="config-section">
          <h3 className="section-title">Training Configuration</h3>
          {/* Dataset Selection */}
          <div className="config-group">
            <label className="config-label">Select Dataset</label>
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="config-select"
            >
              <option value="">Choose a dataset...</option>
              {datasets.map((dataset) => (
                <option key={dataset.filename} value={dataset.filename}>
                  {dataset.filename} ({dataset.columns} columns)
                </option>
              ))}
            </select>
          </div>

          {/* Model Name */}
          <div className="config-group">
            <label className="config-label">Model Name</label>
            <input
              type="text"
              value={config.model_name}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, model_name: e.target.value }))
              }
              placeholder="Enter model name..."
              className="config-input"
            />
          </div>

          {/* Target Transformation */}
          <div className="config-group">
            <label className="config-label">Target Transformation</label>
            <select
              value={config.target_transformation}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  target_transformation: e.target.value as any,
                }))
              }
              className="config-select"
            >
              <option value="power">Power Transform (Recommended)</option>
              <option value="standard">Standard Scaler</option>
              <option value="minmax">MinMax Scaler</option>
              <option value="none">No Transformation</option>
            </select>
          </div>

          {/* Feature Engineering */}
          <div className="config-group">
            <label className="config-checkbox-label">
              <input
                type="checkbox"
                checked={config.feature_engineering}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    feature_engineering: e.target.checked,
                  }))
                }
                className="config-checkbox"
              />
              Enable Feature Engineering (Weighted Averages)
            </label>
          </div>

          {/* Validation Split */}
          <div className="config-group">
            <label className="config-label">
              Validation Split: {(config.validation_split * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="0.4"
              step="0.05"
              value={config.validation_split}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  validation_split: parseFloat(e.target.value),
                }))
              }
              className="config-slider"
            />
          </div>

          {/* Cross Validation Folds */}
          <div className="config-group">
            <label className="config-label">Cross Validation Folds</label>
            <input
              type="number"
              min="3"
              max="10"
              value={config.cross_validation_folds}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  cross_validation_folds: parseInt(e.target.value),
                }))
              }
              className="config-input"
            />
          </div>

          {/* Device Preference */}
          <div className="config-group">
            <label className="config-label">Device Preference</label>
            <select
              value={config.device_preference}
              onChange={(e) =>
                setConfig((prev) => ({
                  ...prev,
                  device_preference: e.target.value as any,
                }))
              }
              className="config-select"
            >
              <option value="auto">Auto (Recommended)</option>
              <option value="cuda">CUDA (GPU)</option>
              <option value="cpu">CPU Only</option>
            </select>
          </div>
          <button
            className="btn btn-primary"
            onClick={handleStartTraining}
            disabled={
              isTraining || !selectedDataset || !config.model_name.trim()
            }
          >
            <Play className="btn-icon" />
            Start Training
          </button>
        </div>
      </div>
    )}

    {/* Monitor Tab */}
    {activeTab === "monitor" && (
      <div className="tab-content">
        <h3 className="section-title">Training Jobs</h3>
        {trainingJobs.length === 0 ? (
          <div className="empty-state">
            <Clock className="empty-icon" />
            <p>No training jobs yet. Start training a model to see progress here.</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {trainingJobs.map((job) => (
              <div key={job.job_id} className="job-card">
                <div className="job-header">
                  <div className="job-status">
                    {getStatusIcon(job.status)}
                    <span className="job-id">{job.job_id}</span>
                  </div>
                  <span className={`status-badge ${job.status}`}>
                    {job.status.toUpperCase()}
                  </span>
                </div>

                <div className="job-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      data-progress={job.progress}
                    />
                  </div>
                  <span className="progress-text">
                    {(job.progress * 100).toFixed(1)}%
                  </span>
                </div>

                <p className="job-message">{job.message}</p>

                {job.metrics && (
                  <div className="job-metrics">
                    <div className="metric">
                      <span>R²:</span>
                      <span>{job.metrics.r2?.toFixed(4)}</span>
                    </div>
                    <div className="metric">
                      <span>RMSE:</span>
                      <span>{job.metrics.rmse?.toFixed(4)}</span>
                    </div>
                    <div className="metric">
                      <span>CV R²:</span>
                      <span>
                        {job.metrics.cv_r2_mean?.toFixed(4)} ±{" "}
                        {job.metrics.cv_r2_std?.toFixed(4)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )}

    {/* Models Tab */}
    {activeTab === "models" && (
      <div className="tab-content">
        <h3 className="section-title">Trained Models</h3>
        {models.length === 0 ? (
          <div className="empty-state">
            <Brain className="empty-icon" />
            <p>No trained models yet. Complete a training job to see models here.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="blendproperty-table">
              <thead>
                <tr>
                  <th>Model Name</th>
                  <th>Created</th>
                  <th>Size</th>
                  <th>R² Score</th>
                  <th>Transformation</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {models.map((model, idx) => (
                  <tr key={idx}>
                    <td>{model.model_name}</td>
                    <td>
                      {new Date(model.creation_date).toLocaleDateString()}
                    </td>
                    <td>{formatFileSize(model.file_size)}</td>
                    <td>
                      {model.metrics?.r2
                        ? model.metrics.r2.toFixed(4)
                        : "N/A"}
                    </td>
                    <td>
                      {model.config?.target_transformation || "N/A"}
                    </td>
                    <td>
                      <div className="model-actions">
                        <button
                          onClick={() => downloadModel(model.model_name)}
                          className="btn btn-primary"
                          title="Download Model"
                        >
                          <Download className="btn-icon" />
                        </button>
                        <button
                          onClick={() => deleteModel(model.model_name)}
                          className="btn btn-primary"
                          title="Delete Model"
                        >
                          <Trash2 className="btn-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )}

    {/* Requirements Section */}
    <div className="requirements-section">
      <div className="requirements-box">
        <h4>
          <strong>Training Data Requirements:</strong>
        </h4>
        <ul>
          <li>CSV file with ID column and exactly 65 feature/target columns</li>
          <li>First 5 columns: Component fractions (sum to 1.0)</li>
          <li>Next 50 columns: Component properties (10 per component)</li>
          <li>Last 10 columns: Target blend properties</li>
          <li>All numeric values must be valid</li>
          <li>Minimum 50 training samples recommended</li>
        </ul>
      </div>
    </div>
  </div>
);
