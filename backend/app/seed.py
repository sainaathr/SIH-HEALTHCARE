from datetime import datetime
from sqlalchemy.orm import Session
from app.models.models import (
    User, Hospital, Patient, Vital, Alert, EmergencyEvent, EmergencyContact,
    MedicalHistory, DeviceStatus, AccessLog, FamilyRelationship, VitalCirclePermission,
    MedicalReport, Medication
)
from app.security import get_password_hash

def seed_database(db: Session):
    print("Seeding VitalGuard demo database...")

    # 1. Hospitals
    h1 = db.query(Hospital).filter(Hospital.hospital_code == "HOSP-STJUDE").first()
    if not h1:
        h1 = Hospital(
            name="St. Jude General Hospital",
            hospital_code="HOSP-STJUDE",
            latitude=12.9716,
            longitude=77.5946,
            geofence_radius=500.0,
            is_active=True
        )
        db.add(h1)

    h2 = db.query(Hospital).filter(Hospital.hospital_code == "HOSP-CITYCARE").first()
    if not h2:
        h2 = Hospital(
            name="City Care Emergency Center",
            hospital_code="HOSP-CITYCARE",
            latitude=12.9352,
            longitude=77.6245,
            geofence_radius=400.0,
            is_active=True
        )
        db.add(h2)

    db.commit()
    if h1: db.refresh(h1)
    if h2: db.refresh(h2)

    # 2. Patients (P001 - P005)
    patient_configs = [
        ("P001", "Rahul Kumar", 68, "Male", "1958-03-14", "O+", "Penicillin, Sulfa drugs", "Hypertension, Stage 2 Chronic Kidney Disease", "Amlodipine 5mg daily, Lisinopril 10mg daily", "stable", 75.0, 98.0, 36.7, 16.0),
        ("P002", "Arthur Pendelton", 74, "Male", "1952-11-22", "A-", "Aspirin", "COPD (Chronic Obstructive Pulmonary Disease), Asthma", "Tiotropium Inhaler, Prednisone 5mg", "high-risk", 82.0, 94.0, 36.8, 20.0),
        ("P003", "Clara Oswald", 42, "Female", "1984-06-08", "B+", "None reported", "Post-operative knee replacement observation", "Paracetamol 500mg as needed", "stable", 72.0, 99.0, 36.6, 15.0),
        ("P004", "Marcus Sterling", 59, "Male", "1967-09-19", "AB+", "Latex", "Type 2 Diabetes Mellitus, Mild Arrhythmia", "Metformin 800mg, Atorvastatin 20mg", "moderate-risk", 78.0, 97.0, 36.7, 17.0),
        ("P005", "Sophia Lin", 81, "Female", "1945-01-30", "O-", "Codeine, Shellfish", "Congestive Heart Failure, Osteoporosis, Fall Risk", "Furosemide 40mg, Metoprolol 25mg, Calcium D3", "critical", 85.0, 93.0, 36.9, 22.0),
    ]

    patients = {}
    for code, name, age, gender, dob, blood, alg, cond, med, status, b_hr, b_spo2, b_temp, b_resp in patient_configs:
        p = db.query(Patient).filter(Patient.patient_code == code).first()
        if not p:
            p = Patient(
                patient_code=code, name=name, age=age, gender=gender, date_of_birth=dob,
                blood_group=blood, allergies=alg, critical_conditions=cond, current_medications=med,
                status=status, baseline_hr=b_hr, baseline_spo2=b_spo2, baseline_temperature=b_temp, baseline_respiration=b_resp
            )
            db.add(p)
            db.commit()
            db.refresh(p)
        patients[code] = p

    p1 = patients["P001"]

    # 3. Users (Nurses, Doctors, Admins, Patient, Family)
    password_hash = get_password_hash("vitalguard123")
    user_configs = [
        ("nurse_emily", "Nurse Emily Watson", "nurse", h1.id, None),
        ("nurse_james", "Nurse James Rivera", "nurse", h1.id, None),
        ("nurse_priya", "Nurse Priya Nair", "nurse", h2.id, None),
        ("doc_jenkins", "Dr. Sarah Jenkins", "doctor", h1.id, None),
        ("doc_sharma", "Dr. Rajesh Sharma", "doctor", h1.id, None),
        ("doc_adams", "Dr. Michael Adams", "doctor", h2.id, None),
        ("admin_steve", "Steve Vance (Admin)", "emergency_admin", h1.id, None),
        ("patient_rahul", "Rahul Kumar", "patient", h1.id, p1.id),
        ("family_priya", "Priya Kumar", "family_member", h1.id, None),
    ]

    users = {}
    for username, full_name, role, hosp_id, pat_id in user_configs:
        u = db.query(User).filter(User.username == username).first()
        if not u:
            u = User(username=username, password_hash=password_hash, full_name=full_name, role=role, hospital_id=hosp_id, patient_id=pat_id)
            db.add(u)
            db.commit()
            db.refresh(u)
        users[username] = u

    # 4. Family Relationship & Permissions
    u_family = users["family_priya"]
    if not db.query(FamilyRelationship).filter(FamilyRelationship.family_user_id == u_family.id, FamilyRelationship.patient_id == p1.id).first():
        rel = FamilyRelationship(family_user_id=u_family.id, patient_id=p1.id, relationship_label="Daughter")
        db.add(rel)

    if not db.query(VitalCirclePermission).filter(VitalCirclePermission.family_user_id == u_family.id, VitalCirclePermission.patient_id == p1.id).first():
        perm = VitalCirclePermission(
            family_user_id=u_family.id,
            patient_id=p1.id,
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

    # 5. Scanner Devices
    device_configs = [
        ("SCANNER-STJUDE-01", p1.id, h1.id),
        ("SCANNER-STJUDE-02", patients["P002"].id, h1.id),
        ("SCANNER-STJUDE-03", patients["P003"].id, h1.id),
        ("SCANNER-CITYCARE-01", patients["P004"].id, h2.id),
        ("SCANNER-CITYCARE-02", patients["P005"].id, h2.id),
        ("SCANNER-EMERGENCY-OVERRIDE", None, h1.id),
    ]

    for dev_id, pid, hid in device_configs:
        if not db.query(DeviceStatus).filter(DeviceStatus.device_id == dev_id).first():
            d = DeviceStatus(device_id=dev_id, patient_id=pid, battery=98.0, connected=True, firmware_version="v1.4.2", authorized=True, hospital_id=hid)
            db.add(d)
    db.commit()

    # 6. Initial Vitals
    vitals_data = [
        ("P001", 75.0, 98.0, 36.7, 16.0, "RESTING"),
        ("P002", 86.0, 93.0, 37.1, 22.0, "RESTING"),
        ("P003", 72.0, 99.0, 36.6, 15.0, "RESTING"),
        ("P004", 81.0, 96.5, 36.8, 18.0, "WALKING"),
        ("P005", 108.0, 91.0, 37.4, 25.0, "RESTING"),
    ]

    for code, hr, spo2, temp, resp, act in vitals_data:
        p = patients[code]
        if not db.query(Vital).filter(Vital.patient_id == p.id).first():
            v = Vital(
                patient_id=p.id, timestamp=datetime.utcnow(), heart_rate=hr, spo2=spo2,
                temperature=temp, respiration_rate=resp, activity_state=act, acceleration=1.0,
                orientation="UPRIGHT", latitude=12.9716, longitude=77.5946, speed=0.0, battery=98.0, device_connected=True
            )
            db.add(v)
    db.commit()

    # 7. Contacts & Medical History
    p2, p5 = patients["P002"], patients["P005"]
    if not db.query(EmergencyContact).first():
        db.add_all([
            EmergencyContact(patient_id=p1.id, name="Priya Kumar", relationship="Daughter", phone="+91 98765 43210", priority=1),
            EmergencyContact(patient_id=p2.id, name="Mary Pendelton", relationship="Spouse", phone="+91 98765 12345", priority=1),
            EmergencyContact(patient_id=p5.id, name="David Lin", relationship="Son", phone="+91 98765 99999", priority=1)
        ])

    if not db.query(MedicalHistory).first():
        db.add_all([
            MedicalHistory(patient_id=p1.id, date="2024-05-12", condition="Hypertensive Crisis", procedure="ICU Stabilization", notes="Responded well to IV antihypertensives."),
            MedicalHistory(patient_id=p2.id, date="2025-01-20", condition="COPD Exacerbation", procedure="Nebulizer Therapy", notes="Oxygen therapy required for 3 days."),
            MedicalHistory(patient_id=p5.id, date="2025-09-10", condition="Mechanical Fall", procedure="Hip X-Ray", notes="No fracture, severe bruising.")
        ])

    # 8. Medical Reports & Medications for P001
    if not db.query(MedicalReport).filter(MedicalReport.patient_id == p1.id).first():
        db.add_all([
            MedicalReport(
                patient_id=p1.id,
                report_name="Comprehensive Blood Profile",
                report_type="Pathology",
                report_date="2026-08-10",
                doctor_hospital="St. Jude Pathology Lab",
                notes="Renal function stable. eGFR 65 mL/min.",
                file_path="C:/tmp/vitalguard_uploads/blood_test_p001.pdf",
                file_type="PDF"
            ),
            MedicalReport(
                patient_id=p1.id,
                report_name="ECG Baseline Report",
                report_type="Cardiology",
                report_date="2026-07-22",
                doctor_hospital="Dr. Sarah Jenkins",
                notes="Normal sinus rhythm. HR 74 bpm.",
                file_path="C:/tmp/vitalguard_uploads/ecg_p001.pdf",
                file_type="PDF"
            )
        ])

    if not db.query(Medication).filter(Medication.patient_id == p1.id).first():
        db.add_all([
            Medication(
                patient_id=p1.id,
                name="Metformin",
                dosage="500 mg",
                frequency="Twice daily",
                schedule="8:00 AM & 8:00 PM",
                start_date="2024-01-15",
                prescribing_doctor="Dr. Sarah Jenkins",
                notes="Take with meals to avoid gastric upset."
            ),
            Medication(
                patient_id=p1.id,
                name="Lisinopril",
                dosage="10 mg",
                frequency="Once daily",
                schedule="8:00 AM",
                start_date="2023-11-01",
                prescribing_doctor="Dr. Sarah Jenkins",
                notes="Blood pressure management."
            )
        ])

    if not db.query(Alert).first():
        db.add(Alert(
            patient_id=p5.id, alert_type="HIGH_HR", severity="CRITICAL",
            message="Heart rate (108 bpm) and respiration (25 rpm) elevated above baseline.",
            status="ACTIVE", timestamp=datetime.utcnow()
        ))

    db.commit()
    print("Database seeding completed successfully.")
