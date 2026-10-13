from datetime import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, Field

# Auth Schemas
class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserResponse(BaseModel):
    id: int
    username: str
    full_name: str
    role: str
    hospital_id: Optional[int] = None
    patient_id: Optional[int] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Hospital Schema
class HospitalResponse(BaseModel):
    id: int
    name: str
    hospital_code: str
    latitude: float
    longitude: float
    geofence_radius: float
    is_active: bool

    class Config:
        from_attributes = True

# Telemetry Schema
class TelemetryCreate(BaseModel):
    patient_id: int
    timestamp: Optional[datetime] = None
    heart_rate: float
    spo2: float
    temperature: float
    respiration_rate: float
    activity_state: Optional[str] = "RESTING"
    acceleration: Optional[float] = 1.0
    orientation: Optional[str] = "UPRIGHT"
    latitude: Optional[float] = 12.9716
    longitude: Optional[float] = 77.5946
    speed: Optional[float] = 0.0
    battery: Optional[float] = 98.0
    device_connected: Optional[bool] = True

class VitalResponse(BaseModel):
    id: int
    patient_id: int
    timestamp: datetime
    heart_rate: float
    spo2: float
    temperature: float
    respiration_rate: float
    activity_state: str
    acceleration: float
    orientation: str
    latitude: Optional[float]
    longitude: Optional[float]
    speed: float
    battery: float
    device_connected: bool

    class Config:
        from_attributes = True

# Patient Schemas
class EmergencyContactSchema(BaseModel):
    id: int
    name: str
    relationship: str
    phone: str
    priority: int

    class Config:
        from_attributes = True

class MedicalHistorySchema(BaseModel):
    id: int
    date: str
    condition: str
    procedure: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class PatientResponse(BaseModel):
    id: int
    patient_code: str
    name: str
    age: int
    gender: str
    date_of_birth: Optional[str]
    blood_group: str
    allergies: Optional[str]
    critical_conditions: Optional[str]
    current_medications: Optional[str]
    status: str
    baseline_hr: float
    baseline_spo2: float
    baseline_temperature: float
    baseline_respiration: float
    created_at: datetime

    class Config:
        from_attributes = True

# Risk & Anomaly Schemas
class RiskContributor(BaseModel):
    factor: str
    weight: float
    impact: float
    detail: str

class RiskAssessmentResponse(BaseModel):
    patient_id: int
    score: float
    risk_level: str  # LOW, MODERATE, HIGH, CRITICAL
    contributors: List[RiskContributor]
    explanation: str
    early_warning: Dict[str, Any]

# Alert Schema
class AlertResponse(BaseModel):
    id: int
    patient_id: int
    patient_code: Optional[str] = None
    patient_name: Optional[str] = None
    alert_type: str
    severity: str
    message: str
    status: str
    timestamp: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# VitalPass & Emergency Schemas
class VitalPassScanRequest(BaseModel):
    patient_identifier: str  # e.g., P001
    scanner_device_id: str
    scanner_latitude: float
    scanner_longitude: float

class EmergencyAccessRequest(BaseModel):
    reason: str

class GeofenceCheckRequest(BaseModel):
    latitude: float
    longitude: float
    hospital_id: int

class GeofenceCheckResponse(BaseModel):
    inside_hospital: bool
    distance_meters: float
    allowed_radius_meters: float
    hospital_name: str

class DeviceStatusResponse(BaseModel):
    id: int
    device_id: str
    patient_id: Optional[int]
    battery: float
    connected: bool
    last_seen: datetime
    firmware_version: str
    authorized: bool
    hospital_id: Optional[int]

    class Config:
        from_attributes = True

class AccessLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    username: Optional[str] = None
    patient_id: Optional[int]
    patient_code: Optional[str] = None
    hospital_id: Optional[int]
    hospital_name: Optional[str] = None
    access_type: str
    reason: Optional[str]
    timestamp: datetime
    success: bool
    scanner_device_id: Optional[str]
    ip_address: Optional[str]

    class Config:
        from_attributes = True

# Patient & Family Portal Schemas
class PatientProfileUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None
    blood_group: Optional[str] = None
    allergies: Optional[str] = None
    critical_conditions: Optional[str] = None
    current_medications: Optional[str] = None

class DeviceRegisterRequest(BaseModel):
    device_id: str
    serial_number: Optional[str] = None
    pairing_code: Optional[str] = None
    device_name: Optional[str] = None

class MedicalReportCreate(BaseModel):
    report_name: str
    report_type: str
    report_date: str
    doctor_hospital: Optional[str] = None
    notes: Optional[str] = None
    file_type: Optional[str] = "PDF"

class MedicalReportResponse(BaseModel):
    id: int
    patient_id: int
    report_name: str
    report_type: str
    report_date: str
    doctor_hospital: Optional[str]
    notes: Optional[str]
    file_path: str
    file_type: str
    uploaded_at: datetime

    class Config:
        from_attributes = True

class MedicationCreate(BaseModel):
    name: str
    dosage: str
    frequency: str
    schedule: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    prescribing_doctor: Optional[str] = None
    notes: Optional[str] = None

class MedicationResponse(BaseModel):
    id: int
    patient_id: int
    name: str
    dosage: str
    frequency: str
    schedule: Optional[str]
    start_date: Optional[str]
    end_date: Optional[str]
    prescribing_doctor: Optional[str]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class MedicationAdherenceCreate(BaseModel):
    scheduled_time: str
    status: str  # TAKEN, SKIPPED

class VitalCirclePermissionUpdate(BaseModel):
    can_view_vitals: Optional[bool] = None
    can_view_summary: Optional[bool] = None
    can_view_alerts: Optional[bool] = None
    can_view_device_status: Optional[bool] = None
    can_view_location_emergency: Optional[bool] = None
    can_view_medication_reminders: Optional[bool] = None
    can_view_medical_reports: Optional[bool] = None
    can_view_medical_history: Optional[bool] = None

class VitalCirclePermissionResponse(BaseModel):
    id: int
    family_user_id: int
    patient_id: int
    can_view_vitals: bool
    can_view_summary: bool
    can_view_alerts: bool
    can_view_device_status: bool
    can_view_location_emergency: bool
    can_view_medication_reminders: bool
    can_view_medical_reports: bool
    can_view_medical_history: bool

    class Config:
        from_attributes = True

class VitalCircleMemberResponse(BaseModel):
    id: int
    family_user_id: int
    full_name: str
    username: str
    relationship_label: str
    permissions: VitalCirclePermissionResponse

class FamilyPatientSummaryResponse(BaseModel):
    patient_id: int
    patient_code: str
    name: str
    status: str
    relationship: str
    risk_score: float
    risk_level: str
    wearable_connected: bool
    battery: float
    permissions: VitalCirclePermissionResponse
    vitals: Optional[Dict[str, Any]] = None
    recent_alerts: Optional[List[Dict[str, Any]]] = None
    location: Optional[Dict[str, Any]] = None
    medications: Optional[List[Dict[str, Any]]] = None

