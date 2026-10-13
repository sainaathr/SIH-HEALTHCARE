import random
from datetime import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.models import Patient, Vital, Alert, EmergencyEvent, DeviceStatus
from app.services.anomaly import detect_anomalies

# Active simulation scenarios memory store
ACTIVE_SIMULATIONS: Dict[int, str] = {}  # patient_id -> scenario_name

def start_simulation(patient_id: int, scenario: str) -> dict:
    scenario_upper = scenario.upper()
    valid_scenarios = ["NORMAL", "DETERIORATION", "FALL", "LOW_SPO2", "HIGH_HEART_RATE", "SOS", "SENSOR_FAILURE", "RECOVERY"]
    if scenario_upper not in valid_scenarios:
        return {"success": False, "error": f"Invalid scenario. Allowed: {valid_scenarios}"}
    
    ACTIVE_SIMULATIONS[patient_id] = scenario_upper
    return {"success": True, "patient_id": patient_id, "active_scenario": scenario_upper}

def stop_simulation(patient_id: int) -> dict:
    if patient_id in ACTIVE_SIMULATIONS:
        del ACTIVE_SIMULATIONS[patient_id]
    return {"success": True, "patient_id": patient_id, "active_scenario": "NORMAL"}

def get_simulation_status(patient_id: int) -> dict:
    return {
        "patient_id": patient_id,
        "active_scenario": ACTIVE_SIMULATIONS.get(patient_id, "NORMAL")
    }

def generate_telemetry_frame(db: Session, patient: Patient) -> Vital:
    """
    Generates realistic next telemetry frame for a patient based on active scenario.
    """
    scenario = ACTIVE_SIMULATIONS.get(patient.id, "NORMAL")
    
    # Get last vital frame if exists
    last_vital = db.query(Vital).filter(Vital.patient_id == patient.id).order_by(Vital.timestamp.desc()).first()

    current_hr = last_vital.heart_rate if last_vital else patient.baseline_hr
    current_spo2 = last_vital.spo2 if last_vital else patient.baseline_spo2
    current_temp = last_vital.temperature if last_vital else patient.baseline_temperature
    current_resp = last_vital.respiration_rate if last_vital else patient.baseline_respiration

    # Default hospital lat/lon (Bengaluru hospital area or specified)
    lat = last_vital.latitude if (last_vital and last_vital.latitude) else 12.9716
    lon = last_vital.longitude if (last_vital and last_vital.longitude) else 77.5946

    activity = "RESTING"
    accel = 1.0 + round(random.uniform(-0.05, 0.05), 2)
    orientation = "UPRIGHT"
    connected = True
    battery = max(10.0, (last_vital.battery - 0.05) if last_vital else 98.0)

    if scenario == "NORMAL":
        # Smooth slight jitter around baseline
        current_hr = max(55.0, min(95.0, current_hr + random.uniform(-1.5, 1.5)))
        current_spo2 = max(96.0, min(100.0, current_spo2 + random.uniform(-0.2, 0.2)))
        current_temp = max(36.2, min(37.2, current_temp + random.uniform(-0.05, 0.05)))
        current_resp = max(12.0, min(18.0, current_resp + random.uniform(-0.3, 0.3)))
        activity = random.choice(["RESTING", "RESTING", "WALKING"])
        accel = 1.0 if activity == "RESTING" else 1.25

    elif scenario == "DETERIORATION":
        current_hr = min(135.0, current_hr + random.uniform(1.0, 3.0))
        current_spo2 = max(88.0, current_spo2 - random.uniform(0.3, 0.8))
        current_temp = min(38.8, current_temp + random.uniform(0.05, 0.15))
        current_resp = min(28.0, current_resp + random.uniform(0.5, 1.2))
        activity = "MOVING"

    elif scenario == "FALL":
        current_hr = min(130.0, current_hr + random.uniform(2.0, 5.0))
        accel = 3.2  # High impact spike
        orientation = "LYING_FLAT"
        activity = "INACTIVE"

    elif scenario == "LOW_SPO2":
        current_spo2 = max(84.0, current_spo2 - random.uniform(0.5, 1.2))
        current_hr = min(115.0, current_hr + random.uniform(0.5, 1.5))
        activity = "RESTING"

    elif scenario == "HIGH_HEART_RATE":
        current_hr = min(150.0, current_hr + random.uniform(3.0, 6.0))
        current_resp = min(26.0, current_resp + random.uniform(0.4, 0.8))
        activity = "MOVING"

    elif scenario == "SOS":
        current_hr = min(120.0, current_hr + random.uniform(1.0, 3.0))
        activity = "MOVING"

    elif scenario == "SENSOR_FAILURE":
        connected = False

    elif scenario == "RECOVERY":
        # Gradually return toward baseline
        current_hr += (patient.baseline_hr - current_hr) * 0.25
        current_spo2 += (patient.baseline_spo2 - current_spo2) * 0.25
        current_temp += (patient.baseline_temperature - current_temp) * 0.25
        current_resp += (patient.baseline_respiration - current_resp) * 0.25
        activity = "RESTING"
        orientation = "UPRIGHT"

    new_vital = Vital(
        patient_id=patient.id,
        timestamp=datetime.utcnow(),
        heart_rate=round(current_hr, 1),
        spo2=round(current_spo2, 1),
        temperature=round(current_temp, 1),
        respiration_rate=round(current_resp, 1),
        activity_state=activity,
        acceleration=round(accel, 2),
        orientation=orientation,
        latitude=lat,
        longitude=lon,
        speed=0.0,
        battery=round(battery, 1),
        device_connected=connected
    )
    
    db.add(new_vital)
    
    # Update device status last_seen
    device = db.query(DeviceStatus).filter(DeviceStatus.patient_id == patient.id).first()
    if device:
        device.last_seen = datetime.utcnow()
        device.connected = connected
        device.battery = round(battery, 1)

    db.commit()
    db.refresh(new_vital)

    # Check and generate alerts/emergency events automatically
    anomalies = detect_anomalies(patient, new_vital)
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

    return new_vital
