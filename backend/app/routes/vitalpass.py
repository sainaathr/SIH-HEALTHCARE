from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, Hospital, Patient, Vital, Alert, EmergencyContact, MedicalHistory, DeviceStatus, AccessLog, EmergencyEvent
from app.schemas.schemas import VitalPassScanRequest, EmergencyAccessRequest, AccessLogResponse
from app.security import get_current_user, RoleChecker
from app.services.geofence import is_within_geofence
from app.services.risk_engine import calculate_patient_risk
from app.services.simulator import generate_telemetry_frame

router = APIRouter(tags=["VitalPass & Security"])

@router.post("/api/vitalpass/scan")
def scan_vitalpass(
    request: VitalPassScanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Secure VitalPass authentication check.
    Validates user authentication, scanner authorization, hospital geofence,
    patient existence, and role RBAC before rendering health passport data.
    """
    # 1. Patient lookup
    patient = db.query(Patient).filter(
        (Patient.patient_code == request.patient_identifier) | (Patient.id == int(request.patient_identifier) if request.patient_identifier.isdigit() else False)
    ).first()
    
    if not patient:
        # Log failed attempt
        log = AccessLog(
            user_id=current_user.id,
            patient_id=None,
            hospital_id=current_user.hospital_id,
            access_type="VITALPASS_SCAN",
            reason=f"Failed scan: Patient identifier '{request.patient_identifier}' not found",
            timestamp=datetime.utcnow(),
            success=False,
            scanner_device_id=request.scanner_device_id
        )
        db.add(log)
        db.commit()
        raise HTTPException(status_code=404, detail="INVALID PATIENT IDENTIFIER")

    # 2. Scanner device authorization lookup
    device = db.query(DeviceStatus).filter(DeviceStatus.device_id == request.scanner_device_id).first()
    if not device or not device.authorized:
        log = AccessLog(
            user_id=current_user.id,
            patient_id=patient.id,
            hospital_id=current_user.hospital_id,
            access_type="VITALPASS_SCAN",
            reason=f"Failed scan: Scanner device '{request.scanner_device_id}' unauthorized",
            timestamp=datetime.utcnow(),
            success=False,
            scanner_device_id=request.scanner_device_id
        )
        db.add(log)
        db.commit()
        raise HTTPException(status_code=403, detail=f"UNAUTHORIZED SCANNER DEVICE ({request.scanner_device_id})")

    # 3. Hospital Geofence check
    hospital = db.query(Hospital).filter(Hospital.id == device.hospital_id).first()
    if not hospital:
        hospital = db.query(Hospital).first()  # Fallback to default hospital if unset

    inside_geofence, dist_meters = is_within_geofence(
        request.scanner_latitude,
        request.scanner_longitude,
        hospital.latitude,
        hospital.longitude,
        hospital.geofence_radius
    )

    if not inside_geofence:
        log = AccessLog(
            user_id=current_user.id,
            patient_id=patient.id,
            hospital_id=hospital.id,
            access_type="VITALPASS_SCAN",
            reason=f"Failed scan: Scanner location ({request.scanner_latitude}, {request.scanner_longitude}) is {dist_meters:.0f}m outside hospital geofence ({hospital.geofence_radius}m max)",
            timestamp=datetime.utcnow(),
            success=False,
            scanner_device_id=request.scanner_device_id
        )
        db.add(log)
        db.commit()
        raise HTTPException(
            status_code=403, 
            detail=f"SCANNER OUTSIDE HOSPITAL GEOFENCE. Scanner is {dist_meters:.0f}m away from {hospital.name} (Max allowed: {hospital.geofence_radius}m)."
        )

    # 4. Successful Scan Logging
    log = AccessLog(
        user_id=current_user.id,
        patient_id=patient.id,
        hospital_id=hospital.id,
        access_type="VITALPASS_SCAN",
        reason=f"Routine VitalPass scan by {current_user.role} {current_user.full_name}",
        timestamp=datetime.utcnow(),
        success=True,
        scanner_device_id=request.scanner_device_id
    )
    db.add(log)
    db.commit()

    # 5. Build VitalPass Summary Data according to User Role
    latest_vital = db.query(Vital).filter(Vital.patient_id == patient.id).order_by(Vital.timestamp.desc()).first()
    if not latest_vital:
        latest_vital = generate_telemetry_frame(db, patient)

    recent_vitals = db.query(Vital).filter(Vital.patient_id == patient.id).order_by(Vital.timestamp.desc()).limit(10).all()
    active_emergencies = db.query(EmergencyEvent).filter(EmergencyEvent.patient_id == patient.id, EmergencyEvent.resolved_at == None).all()
    risk = calculate_patient_risk(patient, latest_vital, recent_vitals, active_emergencies)

    contacts = db.query(EmergencyContact).filter(EmergencyContact.patient_id == patient.id).order_by(EmergencyContact.priority).all()
    alerts = db.query(Alert).filter(Alert.patient_id == patient.id, Alert.status == "ACTIVE").all()

    # Nurse Summary View
    emergency_summary = {
        "patient_id": patient.id,
        "patient_code": patient.patient_code,
        "name": patient.name,
        "age": patient.age,
        "gender": patient.gender,
        "blood_group": patient.blood_group,
        "allergies": patient.allergies or "None reported",
        "critical_conditions": patient.critical_conditions or "None reported",
        "current_medication": patient.current_medications or "None reported",
        "vitals": {
            "heart_rate": latest_vital.heart_rate,
            "spo2": latest_vital.spo2,
            "temperature": latest_vital.temperature,
            "respiration_rate": latest_vital.respiration_rate,
            "battery": latest_vital.battery,
            "connected": latest_vital.device_connected,
            "timestamp": latest_vital.timestamp
        },
        "risk_score": risk["score"],
        "risk_level": risk["risk_level"],
        "emergency_contacts": [
            {"name": c.name, "relationship": c.relationship, "phone": c.phone, "priority": c.priority} for c in contacts
        ],
        "location": {
            "latitude": latest_vital.latitude or 12.9716,
            "longitude": latest_vital.longitude or 77.5946,
            "hospital_name": hospital.name
        },
        "recent_alerts": [
            {"type": a.alert_type, "severity": a.severity, "message": a.message, "timestamp": a.timestamp} for a in alerts
        ]
    }

    # Doctor Additional Access View
    doctor_access = None
    if current_user.role in ["doctor", "emergency_admin"]:
        medical_histories = db.query(MedicalHistory).filter(MedicalHistory.patient_id == patient.id).all()
        doctor_access = {
            "medical_history": [
                {"date": h.date, "condition": h.condition, "procedure": h.procedure, "notes": h.notes} for h in medical_histories
            ],
            "previous_procedures": [h.procedure for h in medical_histories if h.procedure],
            "hospitalizations": ["Admitted to ICU Ward A", "Admitted for Hypertension Observation"],
            "medication_history": patient.current_medications,
            "relevant_clinical_notes": f"Baseline HR {patient.baseline_hr:.0f} bpm, Baseline SpO2 {patient.baseline_spo2:.1f}%. High vigilance for respiratory changes."
        }

    return {
        "access_granted": True,
        "scanned_by": {
            "user_id": current_user.id,
            "name": current_user.full_name,
            "role": current_user.role
        },
        "hospital": hospital.name,
        "geofence_verified": True,
        "emergency_summary": emergency_summary,
        "doctor_access": doctor_access
    }

@router.post("/api/vitalpass/{patient_id}/emergency-access")
def request_emergency_access(
    patient_id: int,
    request: EmergencyAccessRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Break-glass emergency override access for critical patient care.
    Logs access reason to security audit trail.
    """
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    hospital = db.query(Hospital).first()

    # Log emergency access event
    log = AccessLog(
        user_id=current_user.id,
        patient_id=patient.id,
        hospital_id=current_user.hospital_id or hospital.id,
        access_type="EMERGENCY_ACCESS",
        reason=f"EMERGENCY OVERRIDE ACCESS: {request.reason}",
        timestamp=datetime.utcnow(),
        success=True,
        scanner_device_id="SCANNER-EMERGENCY-OVERRIDE"
    )
    db.add(log)
    db.commit()

    medical_histories = db.query(MedicalHistory).filter(MedicalHistory.patient_id == patient.id).all()
    latest_vital = db.query(Vital).filter(Vital.patient_id == patient.id).order_by(Vital.timestamp.desc()).first()

    return {
        "success": True,
        "message": "EMERGENCY ACCESS GRANTED",
        "audit_log_id": log.id,
        "unlocked_records": {
            "patient_code": patient.patient_code,
            "name": patient.name,
            "blood_group": patient.blood_group,
            "allergies": patient.allergies,
            "critical_conditions": patient.critical_conditions,
            "current_medications": patient.current_medications,
            "medical_history": [
                {"date": h.date, "condition": h.condition, "procedure": h.procedure, "notes": h.notes} for h in medical_histories
            ],
            "vitals": {
                "heart_rate": latest_vital.heart_rate if latest_vital else patient.baseline_hr,
                "spo2": latest_vital.spo2 if latest_vital else patient.baseline_spo2,
                "temperature": latest_vital.temperature if latest_vital else patient.baseline_temperature,
                "respiration_rate": latest_vital.respiration_rate if latest_vital else patient.baseline_respiration
            }
        }
    }

@router.get("/api/access-logs", response_model=List[AccessLogResponse])
def get_access_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(RoleChecker(["doctor", "emergency_admin"]))
):
    """
    Retrieves system security access logs for VitalPass scans and emergency access requests.
    Only doctors and emergency admins are authorized to view audit logs.
    """
    logs = db.query(AccessLog).order_by(AccessLog.timestamp.desc()).all()
    results = []
    for l in logs:
        u = db.query(User).filter(User.id == l.user_id).first() if l.user_id else None
        p = db.query(Patient).filter(Patient.id == l.patient_id).first() if l.patient_id else None
        h = db.query(Hospital).filter(Hospital.id == l.hospital_id).first() if l.hospital_id else None

        item = AccessLogResponse.model_validate(l)
        item.username = u.username if u else "System"
        item.patient_code = p.patient_code if p else "N/A"
        item.hospital_name = h.name if h else "Unknown Hospital"
        results.append(item)
    return results
