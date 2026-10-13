from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Patient, Vital, Alert, DeviceStatus
from app.schemas.schemas import TelemetryCreate, VitalResponse
from app.services.anomaly import detect_anomalies

router = APIRouter(prefix="/api/telemetry", tags=["Telemetry"])

@router.post("", response_model=VitalResponse)
def post_telemetry(payload: TelemetryCreate, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    vital = Vital(
        patient_id=payload.patient_id,
        timestamp=payload.timestamp or datetime.utcnow(),
        heart_rate=payload.heart_rate,
        spo2=payload.spo2,
        temperature=payload.temperature,
        respiration_rate=payload.respiration_rate,
        activity_state=payload.activity_state or "RESTING",
        acceleration=payload.acceleration or 1.0,
        orientation=payload.orientation or "UPRIGHT",
        latitude=payload.latitude,
        longitude=payload.longitude,
        speed=payload.speed or 0.0,
        battery=payload.battery or 100.0,
        device_connected=payload.device_connected if payload.device_connected is not None else True
    )
    
    db.add(vital)

    # Update device status
    device = db.query(DeviceStatus).filter(DeviceStatus.patient_id == payload.patient_id).first()
    if device:
        device.last_seen = datetime.utcnow()
        device.connected = vital.device_connected
        device.battery = vital.battery

    db.commit()
    db.refresh(vital)

    # Detect anomalies & create alerts if needed
    anomalies = detect_anomalies(patient, vital)
    for anom in anomalies:
        existing_alert = db.query(Alert).filter(
            Alert.patient_id == patient.id,
            Alert.alert_type == anom["anomaly"],
            Alert.status == "ACTIVE"
        ).first()
        if not existing_alert:
            alert = Alert(
                patient_id=patient.id,
                alert_type=anom["anomaly"],
                severity=anom["severity"],
                message=anom["explanation"],
                status="ACTIVE",
                timestamp=datetime.utcnow()
            )
            db.add(alert)
            db.commit()

    return vital
