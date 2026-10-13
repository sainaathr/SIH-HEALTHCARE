from typing import List, Dict, Any
from app.models.models import Patient, Vital, Alert, EmergencyEvent
from app.services.anomaly import detect_anomalies
from app.services.trend import analyze_vital_trends

def calculate_patient_risk(
    patient: Patient, 
    latest_vital: Vital, 
    recent_vitals: List[Vital],
    active_emergency_events: List[EmergencyEvent]
) -> Dict[str, Any]:
    """
    Transparent 0-100 Risk Score Engine based on weighted physiological deviation, 
    trend analysis, fall events, and SOS signals.
    """
    if not latest_vital:
        return {
            "patient_id": patient.id,
            "score": 0.0,
            "risk_level": "LOW",
            "contributors": [],
            "explanation": "No telemetry data recorded for patient.",
            "early_warning": {
                "label": "Prototype Early Warning",
                "current_risk": 0.0,
                "predicted_near_term_risk": 0.0,
                "trend": "UNKNOWN",
                "explanation": "Insufficient data for trend prediction."
            }
        }

    contributors = []
    
    # 1. Heart Rate (Weight 20%)
    hr_impact = 0.0
    hr_diff = abs(latest_vital.heart_rate - patient.baseline_hr)
    if latest_vital.heart_rate > 120 or latest_vital.heart_rate < 45:
        hr_impact = 20.0
    elif hr_diff > 15:
        hr_impact = min(20.0, (hr_diff / 30.0) * 20.0)
    
    contributors.append({
        "factor": "Heart Rate Abnormality",
        "weight": 20.0,
        "impact": round(hr_impact, 1),
        "detail": f"{latest_vital.heart_rate:.0f} bpm (Baseline: {patient.baseline_hr:.0f} bpm)"
    })

    # 2. SpO2 (Weight 30%)
    spo2_impact = 0.0
    if latest_vital.spo2 < 90:
        spo2_impact = 30.0
    elif latest_vital.spo2 < 95:
        spo2_impact = 15.0 + (95.0 - latest_vital.spo2) * 3.0
    
    contributors.append({
        "factor": "SpO2 Oxygen Saturation",
        "weight": 30.0,
        "impact": round(spo2_impact, 1),
        "detail": f"{latest_vital.spo2:.1f}% (Baseline: {patient.baseline_spo2:.1f}%)"
    })

    # 3. Temperature (Weight 10%)
    temp_impact = 0.0
    temp_diff = abs(latest_vital.temperature - patient.baseline_temperature)
    if latest_vital.temperature > 38.5 or latest_vital.temperature < 35.0:
        temp_impact = 10.0
    elif temp_diff > 0.8:
        temp_impact = min(10.0, (temp_diff / 2.0) * 10.0)

    contributors.append({
        "factor": "Body Temperature",
        "weight": 10.0,
        "impact": round(temp_impact, 1),
        "detail": f"{latest_vital.temperature:.1f}°C (Baseline: {patient.baseline_temperature:.1f}°C)"
    })

    # 4. Respiration Rate (Weight 10%)
    resp_impact = 0.0
    resp_diff = abs(latest_vital.respiration_rate - patient.baseline_respiration)
    if latest_vital.respiration_rate > 24 or latest_vital.respiration_rate < 10:
        resp_impact = 10.0
    elif resp_diff > 4:
        resp_impact = min(10.0, (resp_diff / 8.0) * 10.0)

    contributors.append({
        "factor": "Respiration Rate",
        "weight": 10.0,
        "impact": round(resp_impact, 1),
        "detail": f"{latest_vital.respiration_rate:.0f} rpm (Baseline: {patient.baseline_respiration:.0f} rpm)"
    })

    # 5. Trend Analysis (Weight 15%)
    trend_res = analyze_vital_trends(recent_vitals)
    trend_impact = 0.0
    if trend_res["trend"] == "DETERIORATING":
        trend_impact = 15.0
    elif trend_res["trend"] == "IMPROVING":
        trend_impact = 0.0
    
    contributors.append({
        "factor": "Physiological Trend",
        "weight": 15.0,
        "impact": round(trend_impact, 1),
        "detail": f"Status: {trend_res['trend']}. {trend_res['explanation']}"
    })

    # 6. Fall Events (Weight 10%)
    fall_impact = 0.0
    active_falls = [e for e in active_emergency_events if "FALL" in e.event_type and not e.resolved_at]
    if active_falls:
        fall_impact = 10.0

    contributors.append({
        "factor": "Fall Detection Signal",
        "weight": 10.0,
        "impact": round(fall_impact, 1),
        "detail": "Active confirmed/possible fall event" if active_falls else "No recent fall detected"
    })

    # 7. SOS Manual Trigger (Weight 5%)
    sos_impact = 0.0
    active_sos = [e for e in active_emergency_events if e.event_type == "SOS" and not e.resolved_at]
    if active_sos:
        sos_impact = 5.0

    contributors.append({
        "factor": "Emergency SOS Button",
        "weight": 5.0,
        "impact": round(sos_impact, 1),
        "detail": "Active manual SOS trigger" if active_sos else "Inactive"
    })

    # Total Score Calculation
    total_score = min(100.0, sum(c["impact"] for c in contributors))
    total_score = round(total_score, 1)

    # Determine Risk Level
    if total_score >= 81.0:
        risk_level = "CRITICAL"
    elif total_score >= 61.0:
        risk_level = "HIGH"
    elif total_score >= 31.0:
        risk_level = "MODERATE"
    else:
        risk_level = "LOW"

    # Explanations
    high_contributors = [c["factor"] for c in contributors if c["impact"] > 0]
    if high_contributors:
        explanation = f"Risk score ({total_score}) driven by: {', '.join(high_contributors)}."
    else:
        explanation = f"Patient is stable. All physiological parameters align with baselines."

    # Early Warning Calculation (Prototype Trend-based prediction)
    predicted_near_term_risk = total_score
    if trend_res["trend"] == "DETERIORATING":
        predicted_near_term_risk = min(100.0, total_score + 18.5)
    elif trend_res["trend"] == "IMPROVING":
        predicted_near_term_risk = max(0.0, total_score - 10.0)

    early_warning = {
        "label": "Prototype Early Warning",
        "current_risk": total_score,
        "predicted_near_term_risk": round(predicted_near_term_risk, 1),
        "trend": trend_res["trend"],
        "explanation": f"Based on physiological trend trajectories over the monitoring window, risk score is projected to change from {total_score} to {predicted_near_term_risk:.1f}."
    }

    return {
        "patient_id": patient.id,
        "score": total_score,
        "risk_level": risk_level,
        "contributors": contributors,
        "explanation": explanation,
        "early_warning": early_warning
    }


class RiskEngine:
    @staticmethod
    def assess_patient_risk(db, patient_id: int) -> Dict[str, Any]:
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            return {
                "patient_id": patient_id,
                "score": 0.0,
                "risk_level": "LOW",
                "contributors": [],
                "explanation": "Patient not found",
                "early_warning": {}
            }
        latest_vital = db.query(Vital).filter(Vital.patient_id == patient_id).order_by(Vital.timestamp.desc()).first()
        recent_vitals = db.query(Vital).filter(Vital.patient_id == patient_id).order_by(Vital.timestamp.desc()).limit(10).all()
        active_emergencies = db.query(EmergencyEvent).filter(EmergencyEvent.patient_id == patient_id, EmergencyEvent.resolved_at == None).all()
        
        return calculate_patient_risk(patient, latest_vital, recent_vitals, active_emergencies)

