import os
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import (
    User, Patient, Vital, Alert, DeviceStatus, MedicalReport,
    Medication, MedicationAdherence, EmergencyContact,
    FamilyRelationship, VitalCirclePermission
)
from app.schemas.schemas import (
    PatientResponse, VitalResponse, AlertResponse, DeviceStatusResponse,
    MedicalReportResponse, MedicalReportCreate, MedicationResponse, MedicationCreate,
    VitalCircleMemberResponse, VitalCirclePermissionUpdate, VitalCirclePermissionResponse,
    EmergencyContactSchema, PatientProfileUpdate
)
from app.security import get_current_user, RoleChecker
from app.services.risk_engine import RiskEngine

router = APIRouter(prefix="/api/patient/me", tags=["Patient Portal"])
require_patient = RoleChecker(["patient", "doctor", "nurse", "emergency_admin"])

def get_current_patient(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> Patient:
    if current_user.role == "patient":
        if not current_user.patient_id:
            # Fallback to first patient or P001 for demo
            patient = db.query(Patient).filter(Patient.patient_code == "P001").first()
            if not patient:
                raise HTTPException(status_code=404, detail="Patient profile not linked.")
            return patient
        patient = db.query(Patient).filter(Patient.id == current_user.patient_id).first()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found.")
        return patient
    # For demo testing, non-patient roles can specify/default P001
    patient = db.query(Patient).filter(Patient.patient_code == "P001").first()
    if not patient:
        raise HTTPException(status_code=404, detail="Default demo patient P001 not found.")
    return patient

@router.get("/dashboard")
def get_patient_dashboard(patient: Patient = Depends(get_current_patient), db: Session = Depends(get_db)):
    latest_vital = db.query(Vital).filter(Vital.patient_id == patient.id).order_by(Vital.timestamp.desc()).first()
    recent_alerts = db.query(Alert).filter(Alert.patient_id == patient.id, Alert.status == "ACTIVE").order_by(Alert.timestamp.desc()).limit(5).all()
    device = db.query(DeviceStatus).filter(DeviceStatus.patient_id == patient.id).first()
    meds = db.query(Medication).filter(Medication.patient_id == patient.id).all()
    
    risk_assessment = RiskEngine.assess_patient_risk(db, patient.id)
    
    vitals_data = {
        "heart_rate": latest_vital.heart_rate if latest_vital else patient.baseline_hr,
        "spo2": latest_vital.spo2 if latest_vital else patient.baseline_spo2,
        "temperature": latest_vital.temperature if latest_vital else patient.baseline_temperature,
        "respiration_rate": latest_vital.respiration_rate if latest_vital else patient.baseline_respiration,
        "activity_state": latest_vital.activity_state if latest_vital else "RESTING",
        "last_sync": latest_vital.timestamp.strftime("%H:%M") if latest_vital else "Just now"
    }

    device_info = {
        "connected": device.connected if device else True,
        "battery": device.battery if device else 87.0,
        "device_id": device.device_id if device else "SCANNER-STJUDE-01",
        "last_sync": device.last_seen.strftime("%H:%M") if device else "21:48"
    }

    today_activity = {
        "steps": 4820,
        "target_steps": 8000,
        "distance_km": 3.2,
        "active_minutes": 45
    }

    med_reminders = []
    for m in meds:
        med_reminders.append({
            "id": m.id,
            "name": m.name,
            "dosage": m.dosage,
            "schedule": m.schedule or "8:00 PM",
            "due_text": f"Next dose: {m.schedule or '8:00 PM'}"
        })

    return {
        "greeting_name": patient.name.split()[0],
        "full_name": patient.name,
        "patient_code": patient.patient_code,
        "status": patient.status.upper(),
        "wearable": device_info,
        "vitals": vitals_data,
        "risk": risk_assessment,
        "today_activity": today_activity,
        "recent_alerts": [AlertResponse.from_orm(a) for a in recent_alerts],
        "medication_reminders": med_reminders
    }

@router.get("/health")
def get_patient_health_summary(patient: Patient = Depends(get_current_patient), db: Session = Depends(get_db)):
    latest_vital = db.query(Vital).filter(Vital.patient_id == patient.id).order_by(Vital.timestamp.desc()).first()
    vitals_history = db.query(Vital).filter(Vital.patient_id == patient.id).order_by(Vital.timestamp.desc()).limit(20).all()
    risk_assessment = RiskEngine.assess_patient_risk(db, patient.id)
    alerts_count = db.query(Alert).filter(Alert.patient_id == patient.id).count()

    history_chart = []
    for v in reversed(vitals_history):
        history_chart.append({
            "time": v.timestamp.strftime("%H:%M"),
            "heart_rate": v.heart_rate,
            "spo2": v.spo2,
            "temperature": v.temperature,
            "respiration": v.respiration_rate
        })

    baselines = {
        "baseline_hr": patient.baseline_hr,
        "baseline_spo2": patient.baseline_spo2,
        "baseline_temperature": patient.baseline_temperature,
        "baseline_respiration": patient.baseline_respiration
    }

    current = {
        "heart_rate": latest_vital.heart_rate if latest_vital else patient.baseline_hr,
        "spo2": latest_vital.spo2 if latest_vital else patient.baseline_spo2,
        "temperature": latest_vital.temperature if latest_vital else patient.baseline_temperature,
        "respiration_rate": latest_vital.respiration_rate if latest_vital else patient.baseline_respiration
    }

    deviations = {
        "hr_diff": round(current["heart_rate"] - patient.baseline_hr, 1),
        "spo2_diff": round(current["spo2"] - patient.baseline_spo2, 1),
        "temp_diff": round(current["temperature"] - patient.baseline_temperature, 1),
        "resp_diff": round(current["respiration_rate"] - patient.baseline_respiration, 1)
    }

    weekly_summary = {
        "avg_hr": round(sum(v.heart_rate for v in vitals_history) / max(len(vitals_history), 1), 1) if vitals_history else patient.baseline_hr,
        "avg_spo2": round(sum(v.spo2 for v in vitals_history) / max(len(vitals_history), 1), 1) if vitals_history else patient.baseline_spo2,
        "avg_temperature": round(sum(v.temperature for v in vitals_history) / max(len(vitals_history), 1), 1) if vitals_history else patient.baseline_temperature,
        "avg_risk": risk_assessment["risk_level"],
        "total_alerts": alerts_count,
        "falls_detected": 0,
        "sos_events": 0
    }

    return {
        "patient": PatientResponse.from_orm(patient),
        "baselines": baselines,
        "current_vitals": current,
        "deviations": deviations,
        "risk": risk_assessment,
        "history_chart": history_chart,
        "weekly_summary": weekly_summary
    }

@router.put("/profile")
def update_patient_profile(data: PatientProfileUpdate, patient: Patient = Depends(get_current_patient), db: Session = Depends(get_db)):
    if data.name: patient.name = data.name
    if data.age: patient.age = data.age
    if data.gender: patient.gender = data.gender
    if data.date_of_birth: patient.date_of_birth = data.date_of_birth
    if data.blood_group: patient.blood_group = data.blood_group
    if data.allergies: patient.allergies = data.allergies
    if data.critical_conditions: patient.critical_conditions = data.critical_conditions
    if data.current_medications: patient.current_medications = data.current_medications

    db.commit()
    db.refresh(patient)
    return PatientResponse.from_orm(patient)

@router.get("/devices")
def get_patient_devices(patient: Patient = Depends(get_current_patient), db: Session = Depends(get_db)):
    devices = db.query(DeviceStatus).filter(DeviceStatus.patient_id == patient.id).all()
    return [DeviceStatusResponse.from_orm(d) for d in devices]

@router.post("/devices")
def register_patient_device(device_id: str, device_name: Optional[str] = "Personal Wearable Band", patient: Patient = Depends(get_current_patient), db: Session = Depends(get_db)):
    dev = db.query(DeviceStatus).filter(DeviceStatus.device_id == device_id).first()
    if dev:
        dev.patient_id = patient.id
        dev.connected = True
    else:
        dev = DeviceStatus(
            device_id=device_id,
            patient_id=patient.id,
            battery=100.0,
            connected=True,
            firmware_version="v1.4.2-esp32",
            authorized=True,
            hospital_id=1
        )
        db.add(dev)
    db.commit()
    db.refresh(dev)
    return DeviceStatusResponse.from_orm(dev)

@router.delete("/devices/{device_id}")
def unlink_patient_device(device_id: str, patient: Patient = Depends(get_current_patient), db: Session = Depends(get_db)):
    dev = db.query(DeviceStatus).filter(DeviceStatus.device_id == device_id, DeviceStatus.patient_id == patient.id).first()
    if not dev:
        raise HTTPException(status_code=404, detail="Device not found.")
    dev.patient_id = None
    db.commit()
    return {"message": f"Device {device_id} unlinked successfully."}

@router.get("/reports")
def get_patient_reports(patient: Patient = Depends(get_current_patient), db: Session = Depends(get_db)):
    reports = db.query(MedicalReport).filter(MedicalReport.patient_id == patient.id).order_by(MedicalReport.uploaded_at.desc()).all()
    return [MedicalReportResponse.from_orm(r) for r in reports]

@router.post("/reports")
def upload_patient_report(
    report_name: str = Form(...),
    report_type: str = Form(...),
    report_date: str = Form(...),
    doctor_hospital: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    file: UploadFile = File(...),
    patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    upload_dir = "C:/tmp/vitalguard_uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_ext = file.filename.split(".")[-1].upper() if "." in file.filename else "PDF"
    file_path = os.path.join(upload_dir, f"{patient.patient_code}_{int(datetime.utcnow().timestamp())}_{file.filename}")
    
    with open(file_path, "wb") as f:
        f.write(file.file.read())

    report = MedicalReport(
        patient_id=patient.id,
        report_name=report_name,
        report_type=report_type,
        report_date=report_date,
        doctor_hospital=doctor_hospital or "St. Jude General Hospital",
        notes=notes,
        file_path=file_path,
        file_type=file_ext
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return MedicalReportResponse.from_orm(report)

@router.delete("/reports/{report_id}")
def delete_patient_report(report_id: int, patient: Patient = Depends(get_current_patient), db: Session = Depends(get_db)):
    report = db.query(MedicalReport).filter(MedicalReport.id == report_id, MedicalReport.patient_id == patient.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")
    db.delete(report)
    db.commit()
    return {"message": "Report deleted successfully."}

@router.get("/medications")
def get_patient_medications(patient: Patient = Depends(get_current_patient), db: Session = Depends(get_db)):
    meds = db.query(Medication).filter(Medication.patient_id == patient.id).all()
    return [MedicationResponse.from_orm(m) for m in meds]

@router.post("/medications")
def add_patient_medication(data: MedicationCreate, patient: Patient = Depends(get_current_patient), db: Session = Depends(get_db)):
    m = Medication(
        patient_id=patient.id,
        name=data.name,
        dosage=data.dosage,
        frequency=data.frequency,
        schedule=data.schedule,
        start_date=data.start_date,
        end_date=data.end_date,
        prescribing_doctor=data.prescribing_doctor,
        notes=data.notes
    )
    db.add(m)
    db.commit()
    db.refresh(m)
    return MedicationResponse.from_orm(m)

@router.delete("/medications/{med_id}")
def delete_patient_medication(med_id: int, patient: Patient = Depends(get_current_patient), db: Session = Depends(get_db)):
    m = db.query(Medication).filter(Medication.id == med_id, Medication.patient_id == patient.id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Medication not found.")
    db.delete(m)
    db.commit()
    return {"message": "Medication removed."}

@router.get("/vitalcircle")
def get_patient_vitalcircle(patient: Patient = Depends(get_current_patient), db: Session = Depends(get_db)):
    relationships = db.query(FamilyRelationship).filter(FamilyRelationship.patient_id == patient.id).all()
    members = []
    for rel in relationships:
        fam_user = db.query(User).filter(User.id == rel.family_user_id).first()
        perm = db.query(VitalCirclePermission).filter(VitalCirclePermission.family_user_id == rel.family_user_id, VitalCirclePermission.patient_id == patient.id).first()
        if not perm:
            perm = VitalCirclePermission(family_user_id=rel.family_user_id, patient_id=patient.id)
            db.add(perm)
            db.commit()
            db.refresh(perm)
        members.append({
            "id": rel.id,
            "family_user_id": rel.family_user_id,
            "full_name": fam_user.full_name if fam_user else "Family Member",
            "username": fam_user.username if fam_user else "family",
            "relationship_label": rel.relationship_label,
            "permissions": VitalCirclePermissionResponse.from_orm(perm)
        })
    return members

@router.put("/vitalcircle/{member_user_id}/permissions")
def update_vitalcircle_permissions(
    member_user_id: int,
    perms_update: VitalCirclePermissionUpdate,
    patient: Patient = Depends(get_current_patient),
    db: Session = Depends(get_db)
):
    perm = db.query(VitalCirclePermission).filter(
        VitalCirclePermission.family_user_id == member_user_id,
        VitalCirclePermission.patient_id == patient.id
    ).first()
    if not perm:
        perm = VitalCirclePermission(family_user_id=member_user_id, patient_id=patient.id)
        db.add(perm)

    if perms_update.can_view_vitals is not None: perm.can_view_vitals = perms_update.can_view_vitals
    if perms_update.can_view_summary is not None: perm.can_view_summary = perms_update.can_view_summary
    if perms_update.can_view_alerts is not None: perm.can_view_alerts = perms_update.can_view_alerts
    if perms_update.can_view_device_status is not None: perm.can_view_device_status = perms_update.can_view_device_status
    if perms_update.can_view_location_emergency is not None: perm.can_view_location_emergency = perms_update.can_view_location_emergency
    if perms_update.can_view_medication_reminders is not None: perm.can_view_medication_reminders = perms_update.can_view_medication_reminders
    if perms_update.can_view_medical_reports is not None: perm.can_view_medical_reports = perms_update.can_view_medical_reports
    if perms_update.can_view_medical_history is not None: perm.can_view_medical_history = perms_update.can_view_medical_history

    db.commit()
    db.refresh(perm)
    return VitalCirclePermissionResponse.from_orm(perm)

@router.get("/emergency-contacts")
def get_patient_emergency_contacts(patient: Patient = Depends(get_current_patient), db: Session = Depends(get_db)):
    contacts = db.query(EmergencyContact).filter(EmergencyContact.patient_id == patient.id).order_by(EmergencyContact.priority.asc()).all()
    return [EmergencyContactSchema.from_orm(c) for c in contacts]
