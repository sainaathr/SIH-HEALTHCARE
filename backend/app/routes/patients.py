from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Patient, Vital, MedicalHistory, EmergencyContact, EmergencyEvent
from app.schemas.schemas import PatientResponse, VitalResponse, MedicalHistorySchema, EmergencyContactSchema, RiskAssessmentResponse
from app.security import get_current_user, User
from app.services.risk_engine import calculate_patient_risk
from app.services.simulator import generate_telemetry_frame

router = APIRouter(prefix="/api/patients", tags=["Patients"])

@router.get("", response_model=List[PatientResponse])
def get_patients(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    patients = db.query(Patient).all()
    # Trigger active simulation tick for live dynamic telemetry demo
    for p in patients:
        generate_telemetry_frame(db, p)
    return patients

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(patient_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    generate_telemetry_frame(db, patient)
    return patient

@router.get("/{patient_id}/vitals", response_model=List[VitalResponse])
def get_patient_vitals(patient_id: int, limit: int = 50, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    vitals = db.query(Vital).filter(Vital.patient_id == patient_id).order_by(Vital.timestamp.desc()).limit(limit).all()
    return vitals

@router.get("/{patient_id}/history", response_model=List[MedicalHistorySchema])
def get_patient_history(patient_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    history = db.query(MedicalHistory).filter(MedicalHistory.patient_id == patient_id).order_by(MedicalHistory.id.desc()).all()
    return history

@router.get("/{patient_id}/contacts", response_model=List[EmergencyContactSchema])
def get_patient_contacts(patient_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    contacts = db.query(EmergencyContact).filter(EmergencyContact.patient_id == patient_id).order_by(EmergencyContact.priority).all()
    return contacts

@router.get("/{patient_id}/risk", response_model=RiskAssessmentResponse)
def get_patient_risk(patient_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    latest_vital = db.query(Vital).filter(Vital.patient_id == patient_id).order_by(Vital.timestamp.desc()).first()
    if not latest_vital:
        latest_vital = generate_telemetry_frame(db, patient)

    recent_vitals = db.query(Vital).filter(Vital.patient_id == patient_id).order_by(Vital.timestamp.desc()).limit(10).all()
    active_emergencies = db.query(EmergencyEvent).filter(EmergencyEvent.patient_id == patient_id, EmergencyEvent.resolved_at == None).all()

    risk_result = calculate_patient_risk(patient, latest_vital, recent_vitals, active_emergencies)
    return risk_result

@router.get("/{patient_id}/telemetry/latest", response_model=VitalResponse)
def get_latest_telemetry(patient_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    latest = db.query(Vital).filter(Vital.patient_id == patient_id).order_by(Vital.timestamp.desc()).first()
    if not latest:
        latest = generate_telemetry_frame(db, patient)
    return latest

@router.get("/{patient_id}/location")
def get_patient_location(patient_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    latest = db.query(Vital).filter(Vital.patient_id == patient_id).order_by(Vital.timestamp.desc()).first()
    return {
        "patient_id": patient.id,
        "patient_code": patient.patient_code,
        "name": patient.name,
        "latitude": latest.latitude if latest else 12.9716,
        "longitude": latest.longitude if latest else 77.5946,
        "speed": latest.speed if latest else 0.0,
        "timestamp": latest.timestamp if latest else patient.created_at
    }
