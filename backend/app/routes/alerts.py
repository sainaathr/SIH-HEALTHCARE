from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Alert, Patient, Vital, EmergencyEvent
from app.schemas.schemas import AlertResponse
from app.security import get_current_user, User
from app.services.risk_engine import calculate_patient_risk
from app.services.simulator import generate_telemetry_frame

router = APIRouter(tags=["Alerts & Priority"])

@router.get("/api/alerts", response_model=List[AlertResponse])
def get_alerts(
    status: Optional[str] = None, 
    severity: Optional[str] = None, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    query = db.query(Alert)
    if status:
        query = query.filter(Alert.status == status.upper())
    if severity:
        query = query.filter(Alert.severity == severity.upper())
    
    alerts = query.order_by(Alert.timestamp.desc()).all()

    # Enrich with patient code and name
    results = []
    for a in alerts:
        p = db.query(Patient).filter(Patient.id == a.patient_id).first()
        res = AlertResponse.model_validate(a)
        if p:
            res.patient_code = p.patient_code
            res.patient_name = p.name
        results.append(res)
    return results

@router.post("/api/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.status = "RESOLVED"
    alert.resolved_at = datetime.utcnow()
    db.commit()
    return {"message": "Alert resolved successfully", "alert_id": alert_id}

@router.get("/api/nurse-priority")
def get_nurse_priority_queue(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Returns all patients automatically prioritized by calculated risk score (descending).
    Includes primary issue, risk level, current vitals, trend, and suggested clinical action.
    """
    patients = db.query(Patient).all()
    priority_list = []

    for p in patients:
        latest_vital = db.query(Vital).filter(Vital.patient_id == p.id).order_by(Vital.timestamp.desc()).first()
        if not latest_vital:
            latest_vital = generate_telemetry_frame(db, p)
            
        recent_vitals = db.query(Vital).filter(Vital.patient_id == p.id).order_by(Vital.timestamp.desc()).limit(10).all()
        active_emergencies = db.query(EmergencyEvent).filter(EmergencyEvent.patient_id == p.id, EmergencyEvent.resolved_at == None).all()
        
        risk = calculate_patient_risk(p, latest_vital, recent_vitals, active_emergencies)
        
        active_alerts = db.query(Alert).filter(Alert.patient_id == p.id, Alert.status == "ACTIVE").all()
        main_issue = active_alerts[0].message if active_alerts else "Routine continuous monitoring"

        # Action recommendation based on risk
        if risk["risk_level"] == "CRITICAL":
            action = "IMMEDIATE BEDSIDE INTERVENTION REQUIRED"
        elif risk["risk_level"] == "HIGH":
            action = "PRIORITY NURSING EVALUATION & VITAL RE-CHECK"
        elif risk["risk_level"] == "MODERATE":
            action = "INCREASED MONITORING FREQUENCY"
        else:
            action = "ROUTINE MONITORING"

        priority_list.append({
            "patient_id": p.id,
            "patient_code": p.patient_code,
            "name": p.name,
            "age": p.age,
            "gender": p.gender,
            "blood_group": p.blood_group,
            "risk_score": risk["score"],
            "risk_level": risk["risk_level"],
            "main_issue": main_issue,
            "trend": risk["early_warning"]["trend"],
            "action_required": action,
            "current_vitals": {
                "heart_rate": latest_vital.heart_rate,
                "spo2": latest_vital.spo2,
                "temperature": latest_vital.temperature,
                "respiration_rate": latest_vital.respiration_rate,
                "battery": latest_vital.battery,
                "connected": latest_vital.device_connected
            },
            "active_alert_count": len(active_alerts),
            "last_update": latest_vital.timestamp
        })

    # Sort descending by risk score
    priority_list.sort(key=lambda x: x["risk_score"], reverse=True)

    # Assign priority ranks (1, 2, 3...)
    for rank, item in enumerate(priority_list, start=1):
        item["priority_rank"] = rank

    return priority_list
