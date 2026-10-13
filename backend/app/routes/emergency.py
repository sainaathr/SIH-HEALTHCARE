from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Patient, Vital, Alert, EmergencyEvent
from app.schemas.schemas import AlertResponse
from app.services.simulator import generate_telemetry_frame

router = APIRouter(prefix="/api/emergency", tags=["Emergency"])

@router.post("/{patient_id}/fall")
def trigger_fall_event(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    latest_vital = db.query(Vital).filter(Vital.patient_id == patient_id).order_by(Vital.timestamp.desc()).first()

    # Create emergency event
    event = EmergencyEvent(
        patient_id=patient.id,
        event_type="FALL_POSSIBLE",
        severity="CRITICAL",
        latitude=latest_vital.latitude if latest_vital else 12.9716,
        longitude=latest_vital.longitude if latest_vital else 77.5946,
        created_at=datetime.utcnow(),
        notes="High acceleration impact followed by horizontal orientation detected."
    )
    db.add(event)

    # Create active alert
    alert = Alert(
        patient_id=patient.id,
        alert_type="FALL",
        severity="CRITICAL",
        message="⚠ POSSIBLE FALL DETECTED! Confirmation countdown active.",
        status="ACTIVE",
        timestamp=datetime.utcnow()
    )
    db.add(alert)
    db.commit()

    return {
        "success": True,
        "patient_id": patient_id,
        "event_id": event.id,
        "alert_id": alert.id,
        "status": "FALL_POSSIBLE",
        "countdown_seconds": 10
    }

@router.post("/{patient_id}/fall/confirm")
def confirm_fall_event(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Update fall event to confirmed
    event = db.query(EmergencyEvent).filter(
        EmergencyEvent.patient_id == patient_id,
        EmergencyEvent.event_type == "FALL_POSSIBLE",
        EmergencyEvent.resolved_at == None
    ).first()

    if event:
        event.event_type = "FALL_CONFIRMED"
        event.notes = "Fall confirmed after 10-second confirmation window elapsed without cancellation."

    # Update alert message
    alert = db.query(Alert).filter(
        Alert.patient_id == patient_id,
        Alert.alert_type == "FALL",
        Alert.status == "ACTIVE"
    ).first()

    if alert:
        alert.message = "🔴 FALL CONFIRMED! Patient uninjured/unconscious state requiring immediate response."

    db.commit()
    return {"success": True, "patient_id": patient_id, "status": "FALL_CONFIRMED"}

@router.post("/{patient_id}/fall/cancel")
def cancel_fall_event(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Resolve event and alert
    events = db.query(EmergencyEvent).filter(
        EmergencyEvent.patient_id == patient_id,
        EmergencyEvent.resolved_at == None
    ).all()
    for e in events:
        e.resolved_at = datetime.utcnow()
        e.notes = "Fall alert cancelled by patient/nurse."

    alerts = db.query(Alert).filter(
        Alert.patient_id == patient_id,
        Alert.alert_type == "FALL",
        Alert.status == "ACTIVE"
    ).all()
    for a in alerts:
        a.status = "RESOLVED"
        a.resolved_at = datetime.utcnow()

    db.commit()
    return {"success": True, "patient_id": patient_id, "status": "CANCELLED"}

@router.post("/{patient_id}/sos")
def trigger_sos(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    latest_vital = db.query(Vital).filter(Vital.patient_id == patient_id).order_by(Vital.timestamp.desc()).first()

    event = EmergencyEvent(
        patient_id=patient.id,
        event_type="SOS",
        severity="CRITICAL",
        latitude=latest_vital.latitude if latest_vital else 12.9716,
        longitude=latest_vital.longitude if latest_vital else 77.5946,
        created_at=datetime.utcnow(),
        notes="Patient pressed physical SOS panic button on wearable device."
    )
    db.add(event)

    alert = Alert(
        patient_id=patient.id,
        alert_type="SOS",
        severity="CRITICAL",
        message="🆘 SOS PANIC ALERT TRIGGERED BY PATIENT!",
        status="ACTIVE",
        timestamp=datetime.utcnow()
    )
    db.add(alert)
    db.commit()

    return {"success": True, "patient_id": patient_id, "status": "SOS_ACTIVE"}
