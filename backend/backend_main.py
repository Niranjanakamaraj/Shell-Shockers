from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import os
import io
import pickle
import torch
from contextlib import contextmanager
from typing import List, Dict, Any, Union
import numpy as np
from concurrent.futures import ThreadPoolExecutor
import asyncio
import logging
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# GPU Configuration
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
logger.info(f"Using device: {DEVICE}")

@contextmanager
def patch_torch_load_for_device():
    original_torch_load = torch.load
    def new_torch_load(f, map_location=None, pickle_module=pickle, **kwargs):
        return original_torch_load(f, map_location=DEVICE, pickle_module=pickle_module, **kwargs)
    torch.load = new_torch_load
    try:
        yield
    finally:
        torch.load = original_torch_load

def move_to_device_recursive(obj, device):
    """Recursively move all PyTorch tensors and models to specified device"""
    if isinstance(obj, torch.nn.Module):
        obj.to(device)
        return obj
    elif isinstance(obj, torch.Tensor):
        return obj.to(device)
    elif hasattr(obj, '__dict__'):
        for key, value in obj.__dict__.items():
            try:
                obj.__dict__[key] = move_to_device_recursive(value, device)
            except Exception as e:
                logger.warning(f"Could not move {key} to {device}: {e}")
                continue
    elif isinstance(obj, (list, tuple)):
        return type(obj)(move_to_device_recursive(item, device) for item in obj)
    elif isinstance(obj, dict):
        return {key: move_to_device_recursive(value, device) for key, value in obj.items()}
    return obj

def load_model(file_path):
    logger.info(f"Loading model from {file_path} for device: {DEVICE}")
    
    try:
        with patch_torch_load_for_device():
            model = joblib.load(file_path)
    except RuntimeError as e:
        logger.warning(f"RuntimeError: {e}. Trying alternative loading...")
        if "CUDA" in str(e) or "device" in str(e):
            try:
                model = joblib.load(file_path)
            except Exception as cpu_error:
                raise RuntimeError(f"Error loading pipeline: {cpu_error}")
        else:
            raise e

    try:
        logger.info(f"Moving model components to {DEVICE}...")
        
        if isinstance(model, torch.nn.Module):
            model.to(DEVICE)
        
        if hasattr(model, 'steps'):
            new_steps = []
            for name, step in model.steps:
                if isinstance(step, torch.nn.Module):
                    step.to(DEVICE)
                    logger.info(f"Moved pipeline step '{name}' to {DEVICE}")
                elif hasattr(step, '__dict__'):
                    step = move_to_device_recursive(step, DEVICE)
                new_steps.append((name, step))
            model.steps = new_steps
        else:
            model = move_to_device_recursive(model, DEVICE)
        
        logger.info(f"Successfully moved model to {DEVICE}")
        
    except Exception as e:
        logger.warning(f"Warning: Could not fully move model to {DEVICE}: {e}")

    return model

# Pydantic model for single prediction (used by /predict)
class Blend(BaseModel):
    component1_fraction: float = Field(..., ge=0, le=1)
    component2_fraction: float = Field(..., ge=0, le=1)
    component3_fraction: float = Field(..., ge=0, le=1)
    component4_fraction: float = Field(..., ge=0, le=1)
    component5_fraction: float = Field(..., ge=0, le=1)
    component1_properties: List[float] = Field(..., min_length=10, max_length=10)
    component2_properties: List[float] = Field(..., min_length=10, max_length=10)
    component3_properties: List[float] = Field(..., min_length=10, max_length=10)
    component4_properties: List[float] = Field(..., min_length=10, max_length=10)
    component5_properties: List[float] = Field(..., min_length=10, max_length=10)

# Pydantic model for batch prediction (used by /predict_batch)
class BatchBlend(BaseModel):
    blends: List[Blend]

app = FastAPI(
    title="Blend Properties Predictor",
    description="API for predicting blend properties using a TabPFN model.",
    version="1.0.0"
)

model_pipeline = None
executor = ThreadPoolExecutor(max_workers=4)

@app.on_event("startup")
async def startup_event():
    global model_pipeline
    model_file_path = "multi_output_tabpfn_model.pkl"
    if not os.path.exists(model_file_path):
        raise RuntimeError(f"Pipeline file '{model_file_path}' not found.")
    try:
        model_pipeline = load_model(model_file_path)
        logger.info("✓ Model loaded successfully")
        
        # Dummy prediction for warming up the model
        dummy_blend = Blend(
            component1_fraction=0.2, component2_fraction=0.2, component3_fraction=0.2,
            component4_fraction=0.2, component5_fraction=0.2,
            component1_properties=[1.0]*10, component2_properties=[1.0]*10,
            component3_properties=[1.0]*10, component4_properties=[1.0]*10,
            component5_properties=[1.0]*10
        )
        df_dummy = prepare_dataframe_for_prediction(dummy_blend)
        _ = await asyncio.get_event_loop().run_in_executor(executor, lambda x: gpu_predict(x), df_dummy.values)
        logger.info("✓ Model warmed up successfully")
    except Exception as e:
        logger.error(f"✗ Failed to load or warm up model: {e}")
        raise RuntimeError(f"Error loading pipeline: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    executor.shutdown(wait=True)
    if torch.cuda.is_available():
        torch.cuda.empty_cache()

def prepare_dataframe_for_prediction(blend: Union[Blend, Dict[str, Any]]) -> pd.DataFrame:
    """Helper function to create a 55-feature DataFrame."""
    input_data = {}
    input_data['Component1_fraction'] = [blend.component1_fraction]
    input_data['Component2_fraction'] = [blend.component2_fraction]
    input_data['Component3_fraction'] = [blend.component3_fraction]
    input_data['Component4_fraction'] = [blend.component4_fraction]
    input_data['Component5_fraction'] = [blend.component5_fraction]
    
    for i in range(1, 6):
        properties = blend[f'component{i}_properties'] if isinstance(blend, dict) else getattr(blend, f'component{i}_properties')
        for j in range(1, 11):
            input_data[f'Component{i}_Property{j}'] = [properties[j-1]]
    
    return pd.DataFrame(input_data)

def gpu_predict(X: np.ndarray) -> np.ndarray:
    """Synchronous prediction function for thread pool."""
    try:
        prediction = model_pipeline.predict(X)
        if torch.is_tensor(prediction):
            prediction = prediction.cpu().numpy()
        return prediction
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")

@app.get("/health")
async def health_check():
    """Health check endpoint with GPU info"""
    return {"status": "healthy", "model_loaded": model_pipeline is not None}

@app.post("/predict_from_csv")
async def predict_from_csv(file: UploadFile = File(...)):
    """
    Accepts a CSV file, performs predictions, and returns a JSON response
    with the original 'id' and the 10 predicted properties.
    """
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))

        # Ensure 'id' column exists
        if 'id' not in df.columns:
            raise HTTPException(status_code=400, detail="CSV must contain an 'id' column.")
        
        # Separate ID column from features
        ids = df['id']
        feature_df = df.drop(columns=['id'])

        # Verify the number of features matches the model's expectation (55)
        if feature_df.shape[1] != 55:
            raise HTTPException(status_code=400, detail=f"CSV file must contain exactly 55 feature columns (excluding 'id'), but found {feature_df.shape[1]}.")

        # Convert to numpy array for prediction
        X = feature_df.values.astype(np.float32)
        
        loop = asyncio.get_event_loop()
        predictions = await loop.run_in_executor(executor, lambda x: gpu_predict(x), X)
        
        # Format the output to include the 'id'
        results = []
        for i, pred in enumerate(predictions):
            results.append({
                "id": ids.iloc[i],
                "predicted_properties": pred.tolist()
            })
            
        return {"predictions": results}

    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error processing CSV file: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing file: {e}")

@app.post("/predict")
async def predict_properties(blend: Blend):
    """Single prediction endpoint with Pydantic model input."""
    try:
        df = prepare_dataframe_for_prediction(blend)
        loop = asyncio.get_event_loop()
        prediction = await loop.run_in_executor(executor, lambda x: gpu_predict(x), df.values)
        predicted_properties = prediction[0].tolist()
        return {"predicted_properties": predicted_properties}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")

@app.post("/predict_batch")
async def predict_properties_batch(batch: BatchBlend):
    """Batch prediction endpoint for maximum GPU efficiency."""
    try:
        # Note: This is an example of how you might handle batch data from a Pydantic model.
        # It's not a direct implementation of the CSV file logic.
        df_list = [prepare_dataframe_for_prediction(b) for b in batch.blends]
        df = pd.concat(df_list, ignore_index=True)
        
        loop = asyncio.get_event_loop()
        predictions = await loop.run_in_executor(executor, lambda x: gpu_predict(x), df.values)
        
        results = []
        for i, prediction in enumerate(predictions):
            results.append({
                "blend_index": i,
                "predicted_properties": prediction.tolist()
            })
        return {"predictions": results}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Batch prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Batch prediction error: {e}")