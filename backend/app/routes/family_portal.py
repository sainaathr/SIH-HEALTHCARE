from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import (
    User, Patient, Vital, Alert, DeviceStatus, MedicalReport,
    Medication, FamilyRelationship, VitalCirclePermission, EmergencyEvent
)
from app.schemas.schemas import (
    FamilyPatientSummaryResponse, VitalCirclePermissionResponse,
    VitalResponse, AlertResponse
)
from app.security import get_current_user, RoleChecker
from app.services.risk_engine import RiskEngine

router = APIRouter(prefix="/api/family", tags=["Family Portal"])
require_family = RoleChecker(["family_member", "doctor", "nurse", "emergency_admin"])

def get_family_permission(family_user_id: int, patient_id: int, db: Session) -> VitalCirclePermission:
    perm = db.query(VitalCirclePermission).filter(
        VitalCirclePermission.family_user_id == family_user_id,
        VitalCirclePermission.patient_id == patient_id
    ).first()
    if not perm:
        # Default restricted permission
        perm = VitalCirclePermission(
            family_user_id=family_user_id,
            patient_id=patient_id,
            can_view_vitals=True,
            can_view_summary=True,
            can_view_alerts=True,
            can_view_device_status=True,
            can_view_location_emergency=True,
            can_view_medication_reminders=True,
            can_view_medical_reports=False,
            can_view_medical_history=False
        )
        db.add(perm)
        db.commit()
        db.refresh(perm)
    return perm

@router.get("/patients")
def get_family_linked_patients(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Find all relationships for this family user
    relationships = db.query(FamilyRelationship).filter(FamilyRelationship.family_user_id == current_user.id).all()
    
    # If no explicit links, link default family_priya to P001 for demo
    if not relationships:
        demo_patient = db.query(Patient).filter(Patient.patient_code == "P001").first()
        if demo_patient:
            rel = FamilyRelationship(family_user_id=current_user.id, patient_id=demo_patient.id, relationship_label="Daughter")
            db.add(rel)
            db.commit()
            relationships = [rel]

    summaries = []
    for rel in relationships:
        p = db.query(Patient).filter(Patient.id == rel.patient_id).first()
        if not p: continue
        
        perm = get_family_permission(current_user.id, p.id, db)
        latest_vital = db.query(Vital).filter(Vital.patient_id == p.id).order_by(Vital.timestamp.desc()).first()
        device = db.query(DeviceStatus).filter(DeviceStatus.patient_id == p.id).first()
        risk = RiskEngine.assess_patient_risk(db, p.id)

        vitals_dict = None
        if perm.can_view_vitals and latest_vital:
            vitals_dict = {
                "heart_rate": latest_vital.heart_rate,
                "spo2": latest_vital.spo2,
                "temperature": latest_vital.temperature,
                "respiration_rate": latest_vital.respiration_rate,
                "last_sync": latest_vital.timestamp.strftime("%H:%M")
            }

        summaries.append({
            "patient_id": p.id,
            "patient_code": p.patient_code,
            "name": p.name,
            "status": p.status.upper(),
            "relationship": rel.relationship_label,
            "risk_score": risk["score"],
            "risk_level": risk["risk_level"],
            "wearable_connected": device.connected if device else True,
            "battery": device.battery if device else 87.0,
            "permissions": VitalCirclePermissionResponse.from_orm(perm),
            "vitals": vitals_dict
        })

    return summaries

@router.get("/patients/{patient_id}")
def get_family_patient_detail(patient_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Verify link
    rel = db.query(FamilyRelationship).filter(
        FamilyRelationship.family_user_id == current_user.id,
        FamilyRelationship.patient_id == patient_id
    ).first()
    
    # Non-family role fallback for demo testing
    if not rel and current_user.role != "family_member":
        rel = FamilyRelationship(family_user_id=current_user.id, patient_id=patient_id, relationship_label="Authorized Viewer")

    if not rel:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: You are not authorized to view this patient's records."
        )

    p = db.query(Patient).filter(Patient.id == patient_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Patient not found.")

    perm = get_family_permission(current_user.id, p.id, db)
    risk = RiskEngine.assess_patient_risk(db, p.id)
    latest_vital = db.query(Vital).filter(Vital.patient_id == p.id).order_by(Vital.timestamp.desc()).first()
    device = db.query(DeviceStatus).filter(DeviceStatus.patient_id == p.id).first()
    active_alerts = db.query(Alert).filter(Alert.patient_id == p.id, Alert.status == "ACTIVE").all()
    emergency_event = db.query(EmergencyEvent).filter(EmergencyEvent.patient_id == p.id, EmergencyEvent.resolved_at == None).first()

    # Apply backend consent permissions strictly
    vitals_data = None
    if perm.can_view_vitals and latest_vital:
        vitals_data = {
            "heart_rate": latest_vital.heart_rate,
            "spo2": latest_vital.spo2,
            "temperature": latest_vital.temperature,
            "respiration_rate": latest_vital.respiration_rate,
            "activity_state": latest_vital.activity_state,
            "last_sync": latest_vital.timestamp.strftime("%H:%M")
        }

    alerts_data = None
    if perm.can_view_alerts:
        alerts_data = [AlertResponse.from_orm(a) for a in active_alerts]

    location_data = None
    if perm.can_view_location_emergency:
        location_data = {
            "latitude": latest_vital.latitude if latest_vital else 12.9716,
            "longitude": latest_vital.longitude if latest_vital else 77.5946,
            "location_name": "St. Jude Hospital Campus",
            "is_emergency_active": emergency_event is not None or risk["risk_level"] in ["HIGH", "CRITICAL"]
        }

    meds_data = None
    if perm.can_view_medication_reminders:
        meds = db.query(Medication).filter(Medication.patient_id == p.id).all()
        meds_data = [{"name": m.name, "dosage": m.dosage, "schedule": m.schedule} for m in meds]

    reports_data = None
    if perm.can_view_medical_reports:
        reports = db.query(MedicalReport).filter(MedicalReport.patient_id == p.id).all()
        reports_data = [{"id": r.id, "report_name": r.report_name, "date": r.report_date} for r in reports]

    return {
        "patient_id": p.id,
        "patient_code": p.patient_code,
        "name": p.name,
        "age": p.age,
        "gender": p.gender,
        "status": p.status.upper(),
        "relationship": rel.relationship_label,
        "risk": risk,
        "device": {
            "connected": device.connected if device else True,
            "battery": device.battery if device else 87.0,
            "device_id": device.device_id if device else "SCANNER-STJUDE-01"
        } if perm.can_view_device_status else None,
        "permissions": VitalCirclePermissionResponse.from_orm(perm),
        "vitals": vitals_data,
        "alerts": alerts_data,
        "location": location_data,
        "medications": meds_data,
        "reports": reports_data,
        "emergency_alert": {
            "is_active": True,
            "event_type": emergency_event.event_type if emergency_event else "CRITICAL_RISK",
            "message": f"Critical condition detected for {p.name}. Risk Score: {risk['score']}.",
            "timestamp": emergency_event.created_at.strftime("%H:%M") if emergency_event else "Just now"
        } if (emergency_event or risk["risk_level"] == "CRITICAL") else None
    }
