from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
import pandas as pd
import numpy as np
import os
import io
import joblib
import torch
import asyncio
import logging
import time
from datetime import datetime
from typing import List, Dict, Any, Optional, Union
from concurrent.futures import ThreadPoolExecutor
import json
import shutil
from pathlib import Path

# ML imports
from sklearn.model_selection import KFold, train_test_split
from sklearn.multioutput import MultiOutputRegressor
from sklearn.preprocessing import PowerTransformer, StandardScaler, MinMaxScaler
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from tabpfn import TabPFNRegressor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# GPU Configuration
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
logger.info(f"Using device: {DEVICE}")

# Training configuration
MODELS_DIR = Path("trained_models")
TRAINING_LOGS_DIR = Path("training_logs")
DATASETS_DIR = Path("datasets")

# Create directories
for dir_path in [MODELS_DIR, TRAINING_LOGS_DIR, DATASETS_DIR]:
    dir_path.mkdir(exist_ok=True)

# Pydantic models
class TrainingConfig(BaseModel):
    model_name: str = Field(..., description="Name for the trained model")
    target_transformation: str = Field(default="power", description="Target transformation: 'none', 'power', 'standard', 'minmax'")
    feature_engineering: bool = Field(default=True, description="Enable weighted average feature engineering")
    validation_split: float = Field(default=0.2, ge=0.1, le=0.4, description="Validation split ratio")
    cross_validation_folds: int = Field(default=5, ge=3, le=10, description="Number of CV folds")
    device_preference: str = Field(default="auto", description="Device preference: 'auto', 'cpu', 'cuda'")
    save_model: bool = Field(default=True, description="Save trained model to disk")

class TrainingStatus(BaseModel):
    job_id: str
    status: str  # "pending", "running", "completed", "failed"
    progress: float
    message: str
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    model_path: Optional[str] = None
    metrics: Optional[Dict[str, Any]] = None

class ModelInfo(BaseModel):
    model_name: str
    file_path: str
    creation_date: datetime
    file_size: int
    config: Dict[str, Any]
    metrics: Optional[Dict[str, Any]] = None

app = FastAPI(
    title="Blend Properties Training API",
    description="API for training blend property prediction models using TabPFN",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
training_jobs: Dict[str, TrainingStatus] = {}
executor = ThreadPoolExecutor(max_workers=2)  # Limit concurrent training jobs

@app.get("/")
async def read_root():
    return {"message": "Training API is running. Go to /docs for the API documentation."}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "device": str(DEVICE),
        "cuda_available": torch.cuda.is_available(),
        "active_training_jobs": len([j for j in training_jobs.values() if j.status == "running"])
    }

def apply_feature_engineering(df: pd.DataFrame) -> pd.DataFrame:
    """Apply weighted average feature engineering"""
    df_enhanced = df.copy()
    
    blend_composition_cols = [f'Component{i}_fraction' for i in range(1, 6)]
    property_numbers = range(1, 11)
    
    for prop_num in property_numbers:
        new_feature_name = f'Weighted_Avg_Property{prop_num}'
        weighted_sum = 0.0
        
        for comp_idx in range(5):
            comp_num = comp_idx + 1
            comp_volume_frac_col = blend_composition_cols[comp_idx]
            comp_property_col = f'Component{comp_num}_Property{prop_num}'
            
            if comp_property_col in df_enhanced.columns and comp_volume_frac_col in df_enhanced.columns:
                weighted_sum += df_enhanced[comp_property_col] * df_enhanced[comp_volume_frac_col]
        
        df_enhanced[new_feature_name] = weighted_sum
    
    return df_enhanced

def get_target_transformer(transformation_type: str):
    """Get target transformer based on type"""
    if transformation_type == "power":
        return PowerTransformer()
    elif transformation_type == "standard":
        return StandardScaler()
    elif transformation_type == "minmax":
        return MinMaxScaler()
    elif transformation_type == "none":
        return None
    else:
        raise ValueError(f"Unknown transformation type: {transformation_type}")

def calculate_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """Calculate regression metrics"""
    mse = mean_squared_error(y_true, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_true, y_pred)
    r2 = r2_score(y_true, y_pred)
    
    return {
        "mse": float(mse),
        "rmse": float(rmse),
        "mae": float(mae),
        "r2": float(r2)
    }

def train_model_sync(job_id: str, train_data: pd.DataFrame, config: TrainingConfig):
    """Synchronous training function for thread pool"""
    try:
        # Update job status
        training_jobs[job_id].status = "running"
        training_jobs[job_id].start_time = datetime.now()
        training_jobs[job_id].progress = 0.1
        training_jobs[job_id].message = "Preparing data..."
        
        # Determine device
        if config.device_preference == "auto":
            device = DEVICE
        elif config.device_preference == "cuda" and torch.cuda.is_available():
            device = torch.device('cuda')
        else:
            device = torch.device('cpu')
        
        logger.info(f"Training model {config.model_name} on {device}")
        
        # Separate features and targets
        # Assuming the data structure from your original code
        if 'ID' in train_data.columns:
            train_data = train_data.drop('ID', axis=1)
        
        # Identify columns (assuming standard structure)
        all_cols = train_data.columns.tolist()
        
        # First 5 columns: blend composition
        blend_composition_cols = all_cols[:5]
        # Next 50 columns: component properties  
        component_properties_cols = all_cols[5:55]
        # Last 10 columns: target properties
        target_cols = all_cols[55:65] if len(all_cols) >= 65 else all_cols[55:]
        
        # Extract features and targets
        feature_cols = blend_composition_cols + component_properties_cols
        X = train_data[feature_cols].copy()
        y = train_data[target_cols].copy()
        
        training_jobs[job_id].progress = 0.2
        training_jobs[job_id].message = "Applying feature engineering..."
        
        # Apply feature engineering if enabled
        if config.feature_engineering:
            X = apply_feature_engineering(X)
            logger.info(f"Feature engineering applied. New shape: {X.shape}")
        
        # Convert to numpy arrays
        X_np = X.values
        y_np = y.values
        
        training_jobs[job_id].progress = 0.3
        training_jobs[job_id].message = "Setting up target transformation..."
        
        # Apply target transformation
        target_transformer = get_target_transformer(config.target_transformation)
        if target_transformer is not None:
            y_transformed = target_transformer.fit_transform(y_np)
            logger.info("Target transformation applied")
        else:
            y_transformed = y_np
            logger.info("No target transformation applied")
        
        training_jobs[job_id].progress = 0.4
        training_jobs[job_id].message = "Splitting data for validation..."
        
        # Split data for validation
        X_train, X_val, y_train, y_val = train_test_split(
            X_np, y_transformed, 
            test_size=config.validation_split, 
            random_state=42
        )
        
        training_jobs[job_id].progress = 0.5
        training_jobs[job_id].message = "Training TabPFN model..."
        
        # Train model
        model = MultiOutputRegressor(TabPFNRegressor(device=str(device)))
        model.fit(X_train, y_train)
        
        training_jobs[job_id].progress = 0.7
        training_jobs[job_id].message = "Evaluating model..."
        
        # Make predictions on validation set
        y_val_pred = model.predict(X_val)
        
        # Inverse transform predictions if transformer was used
        if target_transformer is not None:
            y_val_original = target_transformer.inverse_transform(y_val)
            y_val_pred_original = target_transformer.inverse_transform(y_val_pred)
        else:
            y_val_original = y_val
            y_val_pred_original = y_val_pred
        
        # Calculate metrics
        metrics = calculate_metrics(y_val_original, y_val_pred_original)
        
        training_jobs[job_id].progress = 0.8
        training_jobs[job_id].message = "Performing cross-validation..."
        
        # Cross-validation
        cv_scores = []
        kf = KFold(n_splits=config.cross_validation_folds, shuffle=True, random_state=42)
        
        for fold, (train_idx, val_idx) in enumerate(kf.split(X_np)):
            X_cv_train, X_cv_val = X_np[train_idx], X_np[val_idx]
            y_cv_train, y_cv_val = y_transformed[train_idx], y_transformed[val_idx]
            
            cv_model = MultiOutputRegressor(TabPFNRegressor(device=str(device)))
            cv_model.fit(X_cv_train, y_cv_train)
            y_cv_pred = cv_model.predict(X_cv_val)
            
            # Inverse transform for CV evaluation
            if target_transformer is not None:
                y_cv_val_orig = target_transformer.inverse_transform(y_cv_val)
                y_cv_pred_orig = target_transformer.inverse_transform(y_cv_pred)
            else:
                y_cv_val_orig = y_cv_val
                y_cv_pred_orig = y_cv_pred
            
            cv_r2 = r2_score(y_cv_val_orig, y_cv_pred_orig)
            cv_scores.append(cv_r2)
        
        metrics["cv_r2_mean"] = float(np.mean(cv_scores))
        metrics["cv_r2_std"] = float(np.std(cv_scores))
        
        training_jobs[job_id].progress = 0.9
        training_jobs[job_id].message = "Saving model..."
        
        # Save model if requested
        model_path = None
        if config.save_model:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            model_filename = f"{config.model_name}_{timestamp}.pkl"
            model_path = MODELS_DIR / model_filename
            
            # Create a pipeline that includes the transformer
            pipeline_dict = {
                'model': model,
                'target_transformer': target_transformer,
                'feature_columns': X.columns.tolist(),
                'target_columns': target_cols,
                'config': config.dict(),
                'metrics': metrics,
                'training_date': datetime.now().isoformat()
            }
            
            joblib.dump(pipeline_dict, model_path)
            logger.info(f"Model saved to {model_path}")
        
        # Save training log
        log_data = {
            'job_id': job_id,
            'config': config.dict(),
            'metrics': metrics,
            'model_path': str(model_path) if model_path else None,
            'training_date': datetime.now().isoformat(),
            'device_used': str(device)
        }
        
        log_file = TRAINING_LOGS_DIR / f"{job_id}.json"
        with open(log_file, 'w') as f:
            json.dump(log_data, f, indent=2)
        
        # Update job status
        training_jobs[job_id].status = "completed"
        training_jobs[job_id].progress = 1.0
        training_jobs[job_id].message = "Training completed successfully"
        training_jobs[job_id].end_time = datetime.now()
        training_jobs[job_id].model_path = str(model_path) if model_path else None
        training_jobs[job_id].metrics = metrics
        
        logger.info(f"Training job {job_id} completed successfully")
        
    except Exception as e:
        logger.error(f"Training job {job_id} failed: {e}")
        training_jobs[job_id].status = "failed"
        training_jobs[job_id].message = f"Training failed: {str(e)}"
        training_jobs[job_id].end_time = datetime.now()

@app.post("/upload_dataset")
async def upload_dataset(file: UploadFile = File(...)):
    """Upload training dataset"""
    try:
        # Validate file type
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
        # Read and validate dataset
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # Basic validation
        if df.empty:
            raise HTTPException(status_code=400, detail="Dataset is empty")
        
        if df.shape[1] < 60:  # Should have at least features + targets
            raise HTTPException(status_code=400, detail="Dataset should have at least 60 columns")
        
        # Save dataset
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        dataset_filename = f"dataset_{timestamp}.csv"
        dataset_path = DATASETS_DIR / dataset_filename
        df.to_csv(dataset_path, index=False)
        
        return {
            "message": "Dataset uploaded successfully",
            "filename": dataset_filename,
            "shape": df.shape,
            "columns": df.columns.tolist()[:10] + ["..."] if len(df.columns) > 10 else df.columns.tolist()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading dataset: {e}")
        raise HTTPException(status_code=500, detail=f"Error uploading dataset: {e}")

@app.post("/start_training")
async def start_training(
    config: TrainingConfig,
    background_tasks: BackgroundTasks,
    dataset_filename: str
):
    """Start training a new model"""
    try:
        # Check if dataset exists
        dataset_path = DATASETS_DIR / dataset_filename
        if not dataset_path.exists():
            raise HTTPException(status_code=404, detail="Dataset not found")
        
        # Generate job ID
        job_id = f"train_{int(time.time())}"
        
        # Load dataset
        train_data = pd.read_csv(dataset_path)
        
        # Initialize job status
        training_jobs[job_id] = TrainingStatus(
            job_id=job_id,
            status="pending",
            progress=0.0,
            message="Training job queued"
        )
        
        # Start training in background
        loop = asyncio.get_event_loop()
        loop.run_in_executor(executor, train_model_sync, job_id, train_data, config)
        
        return {
            "message": "Training started",
            "job_id": job_id,
            "status": "pending"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting training: {e}")
        raise HTTPException(status_code=500, detail=f"Error starting training: {e}")

@app.get("/training_status/{job_id}")
async def get_training_status(job_id: str):
    """Get training job status"""
    if job_id not in training_jobs:
        raise HTTPException(status_code=404, detail="Training job not found")
    
    return training_jobs[job_id]

@app.get("/training_jobs")
async def list_training_jobs():
    """List all training jobs"""
    return {"jobs": list(training_jobs.values())}

@app.get("/models")
async def list_models():
    """List all trained models"""
    models = []
    
    for model_file in MODELS_DIR.glob("*.pkl"):
        try:
            stat = model_file.stat()
            
            # Try to load model info
            model_info = {
                "model_name": model_file.stem,
                "file_path": str(model_file),
                "creation_date": datetime.fromtimestamp(stat.st_ctime),
                "file_size": stat.st_size,
                "config": {},
                "metrics": None
            }
            
            # Try to extract config and metrics from saved model
            try:
                pipeline_dict = joblib.load(model_file)
                if isinstance(pipeline_dict, dict):
                    model_info["config"] = pipeline_dict.get("config", {})
                    model_info["metrics"] = pipeline_dict.get("metrics")
            except:
                pass  # If we can't load the model, just show basic info
            
            models.append(model_info)
            
        except Exception as e:
            logger.warning(f"Error reading model {model_file}: {e}")
            continue
    
    return {"models": models}

@app.get("/download_model/{model_name}")
async def download_model(model_name: str):
    """Download a trained model"""
    model_files = list(MODELS_DIR.glob(f"{model_name}*.pkl"))
    
    if not model_files:
        raise HTTPException(status_code=404, detail="Model not found")
    
    # Get the most recent model if multiple exist
    model_file = max(model_files, key=lambda x: x.stat().st_ctime)
    
    return FileResponse(
        path=model_file,
        filename=model_file.name,
        media_type='application/octet-stream'
    )

@app.delete("/models/{model_name}")
async def delete_model(model_name: str):
    """Delete a trained model"""
    model_files = list(MODELS_DIR.glob(f"{model_name}*.pkl"))
    
    if not model_files:
        raise HTTPException(status_code=404, detail="Model not found")
    
    deleted_files = []
    for model_file in model_files:
        model_file.unlink()
        deleted_files.append(model_file.name)
    
    return {"message": f"Deleted {len(deleted_files)} model files", "files": deleted_files}

@app.get("/datasets")
async def list_datasets():
    """List uploaded datasets"""
    datasets = []
    
    for dataset_file in DATASETS_DIR.glob("*.csv"):
        try:
            stat = dataset_file.stat()
            df = pd.read_csv(dataset_file, nrows=1)  # Just read header
            
            datasets.append({
                "filename": dataset_file.name,
                "upload_date": datetime.fromtimestamp(stat.st_ctime),
                "file_size": stat.st_size,
                "columns": len(df.columns),
                "sample_columns": df.columns.tolist()[:10]
            })
        except Exception as e:
            logger.warning(f"Error reading dataset {dataset_file}: {e}")
            continue
    
    return {"datasets": datasets}

@app.on_event("shutdown")
async def shutdown_event():
    executor.shutdown(wait=True)
    if torch.cuda.is_available():
        torch.cuda.empty_cache()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)  # Different port from prediction API