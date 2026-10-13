from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Patient, Vital, Alert, EmergencyEvent
from app.services.simulator import start_simulation, stop_simulation, get_simulation_status, generate_telemetry_frame
from datetime import datetime

router = APIRouter(prefix="/api/simulation", tags=["Simulation"])

@router.post("/{patient_id}/start/{scenario}")
def start_patient_simulation(patient_id: int, scenario: str, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    res = start_simulation(patient_id, scenario)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["error"])
    
    # Immediately tick a frame for fast frontend feedback
    new_vital = generate_telemetry_frame(db, patient)
    return {
        "success": True,
        "patient_id": patient_id,
        "scenario": scenario.upper(),
        "latest_vitals": {
            "heart_rate": new_vital.heart_rate,
            "spo2": new_vital.spo2,
            "temperature": new_vital.temperature,
            "respiration_rate": new_vital.respiration_rate,
            "activity_state": new_vital.activity_state
        }
    }

@router.post("/{patient_id}/stop")
def stop_patient_simulation(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return stop_simulation(patient_id)

@router.get("/{patient_id}/status")
def get_patient_simulation_status(patient_id: int):
    return get_simulation_status(patient_id)

@router.post("/demo/reset")
def reset_demo(db: Session = Depends(get_db)):
    """
    Clears active simulation states, resolves all active alerts/emergency events,
    and returns patients P001-P005 to baseline physiological values.
    """
    from app.services.simulator import ACTIVE_SIMULATIONS
    ACTIVE_SIMULATIONS.clear()

    # Clear active alerts
    db.query(Alert).filter(Alert.status == "ACTIVE").update({"status": "RESOLVED", "resolved_at": datetime.utcnow()})
    
    # Resolve active emergency events
    db.query(EmergencyEvent).filter(EmergencyEvent.resolved_at == None).update({"resolved_at": datetime.utcnow()})
    
    # Generate clean baseline vital frame for every patient
    patients = db.query(Patient).all()
    for p in patients:
        clean_vital = Vital(
            patient_id=p.id,
            timestamp=datetime.utcnow(),
            heart_rate=p.baseline_hr,
            spo2=p.baseline_spo2,
            temperature=p.baseline_temperature,
            respiration_rate=p.baseline_respiration,
            activity_state="RESTING",
            acceleration=1.0,
            orientation="UPRIGHT",
            latitude=12.9716,
            longitude=77.5946,
            speed=0.0,
            battery=98.0,
            device_connected=True
        )
        db.add(clean_vital)
    
    db.commit()
    return {"message": "Demo reset successfully. All patients returned to baseline states."}
