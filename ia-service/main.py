from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import time

app = FastAPI(title="SWP1 IA-Service")

class PerformanceData(BaseModel):
    actividad: str
    tiempo_promedio: float
    cantidad_tramites: int

class AnalysisRequest(BaseModel):
    politica_id: str
    datos: List[PerformanceData]

@app.get("/")
def read_root():
    return {"message": "SWP1 IA-Service is running!", "status": "online"}

@app.post("/analyze/bottlenecks")
def analyze_bottlenecks(request: AnalysisRequest):
    # Lógica de simulación de análisis de LangChain
    if not request.datos:
        raise HTTPException(status_code=400, detail="No data provided")
    
    # Encontrar la actividad con mayor tiempo
    slowest = max(request.datos, key=lambda x: x.tiempo_promedio)
    
    recommendation = f"La actividad '{slowest.actividad}' presenta un tiempo promedio de {slowest.tiempo_promedio}s. "
    if slowest.tiempo_promedio > 300: # Ejemplo: más de 5 mins
        recommendation += "Se recomienda asignar más personal del departamento responsable o subdividir la tarea."
    else:
        recommendation += "El flujo parece estar dentro de los parámetros normales."

    return {
        "politica_id": request.politica_id,
        "slowest_activity": slowest.actividad,
        "recommendation": recommendation,
        "analysis_timestamp": time.time()
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}
