from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship as sqlalchemy_relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # nurse, doctor, emergency_admin, patient, family_member
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    hospital = sqlalchemy_relationship("Hospital", back_populates="users")
    patient = sqlalchemy_relationship("Patient", back_populates="associated_users")
    access_logs = sqlalchemy_relationship("AccessLog", back_populates="user")


class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    hospital_code = Column(String, unique=True, index=True, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    geofence_radius = Column(Float, default=500.0)  # meters
    is_active = Column(Boolean, default=True)

    users = sqlalchemy_relationship("User", back_populates="hospital")
    devices = sqlalchemy_relationship("DeviceStatus", back_populates="hospital")
    access_logs = sqlalchemy_relationship("AccessLog", back_populates="hospital")


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_code = Column(String, unique=True, index=True, nullable=False)  # P001, P002...
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    date_of_birth = Column(String, nullable=True)
    blood_group = Column(String, nullable=False)
    allergies = Column(Text, nullable=True)
    critical_conditions = Column(Text, nullable=True)
    current_medications = Column(Text, nullable=True)
    status = Column(String, default="stable")  # stable, high-risk, critical, etc.
    
    # Adaptive Baselines
    baseline_hr = Column(Float, default=75.0)
    baseline_spo2 = Column(Float, default=98.0)
    baseline_temperature = Column(Float, default=36.7)
    baseline_respiration = Column(Float, default=16.0)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    associated_users = sqlalchemy_relationship("User", back_populates="patient")
    vitals = sqlalchemy_relationship("Vital", back_populates="patient", cascade="all, delete-orphan")
    alerts = sqlalchemy_relationship("Alert", back_populates="patient", cascade="all, delete-orphan")
    emergency_events = sqlalchemy_relationship("EmergencyEvent", back_populates="patient", cascade="all, delete-orphan")
    contacts = sqlalchemy_relationship("EmergencyContact", back_populates="patient", cascade="all, delete-orphan")
    medical_histories = sqlalchemy_relationship("MedicalHistory", back_populates="patient", cascade="all, delete-orphan")
    devices = sqlalchemy_relationship("DeviceStatus", back_populates="patient", cascade="all, delete-orphan")
    access_logs = sqlalchemy_relationship("AccessLog", back_populates="patient", cascade="all, delete-orphan")
    reports = sqlalchemy_relationship("MedicalReport", back_populates="patient", cascade="all, delete-orphan")
    medications = sqlalchemy_relationship("Medication", back_populates="patient", cascade="all, delete-orphan")
    family_relationships = sqlalchemy_relationship("FamilyRelationship", back_populates="patient", cascade="all, delete-orphan")
    vital_circle_permissions = sqlalchemy_relationship("VitalCirclePermission", back_populates="patient", cascade="all, delete-orphan")


class Vital(Base):
    __tablename__ = "vitals"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    heart_rate = Column(Float, nullable=False)
    spo2 = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    respiration_rate = Column(Float, nullable=False)
    activity_state = Column(String, default="RESTING")  # RESTING, WALKING, MOVING, INACTIVE
    acceleration = Column(Float, default=1.0)  # g-force magnitude
    orientation = Column(String, default="UPRIGHT")  # UPRIGHT, LYING_FLAT, TILTED
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    speed = Column(Float, default=0.0)
    battery = Column(Float, default=100.0)
    device_connected = Column(Boolean, default=True)

    patient = sqlalchemy_relationship("Patient", back_populates="vitals")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    alert_type = Column(String, nullable=False)  # HIGH_HR, LOW_SPO2, FALL, SOS, SENSOR_FAILURE, DETERIORATION
    severity = Column(String, nullable=False)  # INFO, MODERATE, HIGH, CRITICAL
    message = Column(Text, nullable=False)
    status = Column(String, default="ACTIVE")  # ACTIVE, RESOLVED
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    resolved_at = Column(DateTime, nullable=True)

    patient = sqlalchemy_relationship("Patient", back_populates="alerts")


class EmergencyEvent(Base):
    __tablename__ = "emergency_events"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    event_type = Column(String, nullable=False)  # FALL_POSSIBLE, FALL_CONFIRMED, SOS, CRITICAL_DETERIORATION
    severity = Column(String, default="CRITICAL")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)

    patient = sqlalchemy_relationship("Patient", back_populates="emergency_events")


class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    name = Column(String, nullable=False)
    relationship = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    priority = Column(Integer, default=1)

    patient = sqlalchemy_relationship("Patient", back_populates="contacts")


class MedicalHistory(Base):
    __tablename__ = "medical_histories"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    date = Column(String, nullable=False)
    condition = Column(String, nullable=False)
    procedure = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

    patient = sqlalchemy_relationship("Patient", back_populates="medical_histories")


class DeviceStatus(Base):
    __tablename__ = "device_statuses"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    device_id = Column(String, unique=True, index=True, nullable=False)
    battery = Column(Float, default=100.0)
    connected = Column(Boolean, default=True)
    last_seen = Column(DateTime, default=datetime.utcnow)
    firmware_version = Column(String, default="v1.2.0-esp32")
    authorized = Column(Boolean, default=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)

    patient = sqlalchemy_relationship("Patient", back_populates="devices")
    hospital = sqlalchemy_relationship("Hospital", back_populates="devices")


class AccessLog(Base):
    __tablename__ = "access_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    access_type = Column(String, nullable=False)  # VITALPASS_SCAN, EMERGENCY_ACCESS, ROUTINE_CHECK
    reason = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    success = Column(Boolean, default=True)
    scanner_device_id = Column(String, nullable=True)
    ip_address = Column(String, default="127.0.0.1")

    user = sqlalchemy_relationship("User", back_populates="access_logs")
    patient = sqlalchemy_relationship("Patient", back_populates="access_logs")
    hospital = sqlalchemy_relationship("Hospital", back_populates="access_logs")


class FamilyRelationship(Base):
    __tablename__ = "family_relationships"

    id = Column(Integer, primary_key=True, index=True)
    family_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    relationship_label = Column(String, nullable=False)  # Daughter, Son, Spouse, Parent, Caregiver
    created_at = Column(DateTime, default=datetime.utcnow)

    family_user = sqlalchemy_relationship("User", foreign_keys=[family_user_id])
    patient = sqlalchemy_relationship("Patient", back_populates="family_relationships")


class VitalCirclePermission(Base):
    __tablename__ = "vital_circle_permissions"

    id = Column(Integer, primary_key=True, index=True)
    family_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    
    can_view_vitals = Column(Boolean, default=True)
    can_view_summary = Column(Boolean, default=True)
    can_view_alerts = Column(Boolean, default=True)
    can_view_device_status = Column(Boolean, default=True)
    can_view_location_emergency = Column(Boolean, default=True)
    can_view_medication_reminders = Column(Boolean, default=True)
    can_view_medical_reports = Column(Boolean, default=False)
    can_view_medical_history = Column(Boolean, default=False)
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    family_user = sqlalchemy_relationship("User", foreign_keys=[family_user_id])
    patient = sqlalchemy_relationship("Patient", back_populates="vital_circle_permissions")


class MedicalReport(Base):
    __tablename__ = "medical_reports"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    report_name = Column(String, nullable=False)
    report_type = Column(String, nullable=False)  # Pathology, Radiology, Prescription, Discharge Summary
    report_date = Column(String, nullable=False)
    doctor_hospital = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    file_path = Column(String, nullable=False)
    file_type = Column(String, default="PDF")  # PDF, PNG, JPG
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    patient = sqlalchemy_relationship("Patient", back_populates="reports")


class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    name = Column(String, nullable=False)
    dosage = Column(String, nullable=False)  # 500 mg, 10 ml
    frequency = Column(String, nullable=False)  # Twice daily, Once daily, As needed
    schedule = Column(String, nullable=True)  # 8:00 AM, 8:00 PM
    start_date = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    prescribing_doctor = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = sqlalchemy_relationship("Patient", back_populates="medications")
    adherences = sqlalchemy_relationship("MedicationAdherence", back_populates="medication", cascade="all, delete-orphan")


class MedicationAdherence(Base):
    __tablename__ = "medication_adherence"

    id = Column(Integer, primary_key=True, index=True)
    medication_id = Column(Integer, ForeignKey("medications.id"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    scheduled_time = Column(String, nullable=False)
    status = Column(String, default="TAKEN")  # TAKEN, SKIPPED, PENDING
    logged_at = Column(DateTime, default=datetime.utcnow)

    medication = sqlalchemy_relationship("Medication", back_populates="adherences")


