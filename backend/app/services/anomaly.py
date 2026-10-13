from typing import List, Dict, Any
from app.models.models import Patient, Vital

def detect_anomalies(patient: Patient, vital: Vital) -> List[Dict[str, Any]]:
    """
    Transparent, explainable anomaly detection comparing live telemetry
    to patient-specific baselines and physiological thresholds.
    """
    anomalies = []

    if not vital.device_connected:
        anomalies.append({
            "parameter": "COMMUNICATION",
            "anomaly": "SENSOR_FAILURE",
            "severity": "HIGH",
            "deviation": 0.0,
            "explanation": "Wearable sensor packet stream lost or device disconnected."
        })

    # Heart Rate Anomalies
    hr_diff = vital.heart_rate - patient.baseline_hr
    if vital.heart_rate > 100 or hr_diff > 25:
        anomalies.append({
            "parameter": "HEART_RATE",
            "anomaly": "HIGH_HR",
            "severity": "CRITICAL" if vital.heart_rate > 120 else "HIGH",
            "deviation": round(hr_diff, 1),
            "explanation": f"Heart rate ({vital.heart_rate:.0f} bpm) elevated above baseline ({patient.baseline_hr:.0f} bpm)."
        })
    elif vital.heart_rate < 50 or hr_diff < -20:
        anomalies.append({
            "parameter": "HEART_RATE",
            "anomaly": "LOW_HR",
            "severity": "HIGH",
            "deviation": round(hr_diff, 1),
            "explanation": f"Heart rate ({vital.heart_rate:.0f} bpm) significantly lower than baseline ({patient.baseline_hr:.0f} bpm)."
        })

    # SpO2 Anomalies
    spo2_diff = patient.baseline_spo2 - vital.spo2
    if vital.spo2 < 90:
        anomalies.append({
            "parameter": "SPO2",
            "anomaly": "CRITICAL_HYPOXIA",
            "severity": "CRITICAL",
            "deviation": round(-spo2_diff, 1),
            "explanation": f"SpO2 ({vital.spo2:.1f}%) is in critical hypoxemic range (<90%)."
        })
    elif vital.spo2 < 95 or spo2_diff > 3:
        anomalies.append({
            "parameter": "SPO2",
            "anomaly": "LOW_SPO2",
            "severity": "HIGH" if vital.spo2 < 93 else "MODERATE",
            "deviation": round(-spo2_diff, 1),
            "explanation": f"SpO2 ({vital.spo2:.1f}%) dropped from baseline ({patient.baseline_spo2:.1f}%)."
        })

    # Temperature Anomalies
    temp_diff = vital.temperature - patient.baseline_temperature
    if vital.temperature > 38.3:
        anomalies.append({
            "parameter": "TEMPERATURE",
            "anomaly": "HIGH_FEVER",
            "severity": "MODERATE",
            "deviation": round(temp_diff, 1),
            "explanation": f"Body temperature ({vital.temperature:.1f}°C) indicates fever."
        })
    elif vital.temperature < 35.5:
        anomalies.append({
            "parameter": "TEMPERATURE",
            "anomaly": "HYPOTHERMIA",
            "severity": "HIGH",
            "deviation": round(temp_diff, 1),
            "explanation": f"Body temperature ({vital.temperature:.1f}°C) abnormally low."
        })

    # Respiration Rate Anomalies
    rr_diff = vital.respiration_rate - patient.baseline_respiration
    if vital.respiration_rate > 24 or rr_diff > 8:
        anomalies.append({
            "parameter": "RESPIRATION",
            "anomaly": "TACHYPNEA",
            "severity": "HIGH",
            "deviation": round(rr_diff, 1),
            "explanation": f"Respiration rate ({vital.respiration_rate:.0f} rpm) indicates rapid breathing."
        })
    elif vital.respiration_rate < 10 or rr_diff < -6:
        anomalies.append({
            "parameter": "RESPIRATION",
            "anomaly": "BRADYPNEA",
            "severity": "HIGH",
            "deviation": round(rr_diff, 1),
            "explanation": f"Respiration rate ({vital.respiration_rate:.0f} rpm) abnormally slow."
        })

    # Sudden Motion / Fall Anomaly
    if vital.acceleration > 2.5 and vital.orientation in ["LYING_FLAT", "TILTED"]:
        anomalies.append({
            "parameter": "MOTION",
            "anomaly": "SUDDEN_FALL_IMPACT",
            "severity": "CRITICAL",
            "deviation": round(vital.acceleration, 2),
            "explanation": f"High g-force impact ({vital.acceleration:.2f}g) followed by horizontal orientation ({vital.orientation})."
        })

    return anomalies
