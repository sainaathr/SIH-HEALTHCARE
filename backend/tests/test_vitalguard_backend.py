import pytest

def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["system"] == "VITALGUARD"

def test_auth_login(client):
    # Test valid login
    response = client.post("/api/auth/login", json={"username": "doc_jenkins", "password": "vitalguard123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "doctor"

    # Test invalid password
    response_invalid = client.post("/api/auth/login", json={"username": "doc_jenkins", "password": "wrongpassword"})
    assert response_invalid.status_code == 401

def test_patient_endpoints(client):
    # Login to get token
    login_res = client.post("/api/auth/login", json={"username": "nurse_emily", "password": "vitalguard123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get patients list
    res = client.get("/api/patients", headers=headers)
    assert res.status_code == 200
    patients = res.json()
    assert len(patients) >= 5

    # Get patient risk
    risk_res = client.get("/api/patients/1/risk", headers=headers)
    assert risk_res.status_code == 200
    risk_data = risk_res.json()
    assert "score" in risk_data
    assert "early_warning" in risk_data

def test_geofence(client):
    # Test valid inside hospital check (latitude 12.9716, longitude 77.5946 - St Jude)
    res = client.post("/api/geofence/check", json={
        "latitude": 12.9716,
        "longitude": 77.5946,
        "hospital_id": 1
    })
    assert res.status_code == 200
    data = res.json()
    assert data["inside_hospital"] == True

    # Test outside hospital geofence check (20km away)
    res_outside = client.post("/api/geofence/check", json={
        "latitude": 13.1000,
        "longitude": 77.8000,
        "hospital_id": 1
    })
    assert res_outside.status_code == 200
    assert res_outside.json()["inside_hospital"] == False

def test_vitalpass_scan_and_rbac(client):
    login_res = client.post("/api/auth/login", json={"username": "doc_jenkins", "password": "vitalguard123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Scan with authorized scanner inside hospital
    scan_res = client.post("/api/vitalpass/scan", json={
        "patient_identifier": "P001",
        "scanner_device_id": "SCANNER-STJUDE-01",
        "scanner_latitude": 12.9716,
        "scanner_longitude": 77.5946
    }, headers=headers)

    assert scan_res.status_code == 200
    scan_data = scan_res.json()
    assert scan_data["access_granted"] == True
    assert "emergency_summary" in scan_data
    assert "doctor_access" in scan_data  # Doctor sees full medical history

    # Scan with scanner OUTSIDE geofence
    scan_outside = client.post("/api/vitalpass/scan", json={
        "patient_identifier": "P001",
        "scanner_device_id": "SCANNER-STJUDE-01",
        "scanner_latitude": 13.5000,
        "scanner_longitude": 78.1000
    }, headers=headers)
    assert scan_outside.status_code == 403

def test_emergency_fall_and_sos(client):
    login_res = client.post("/api/auth/login", json={"username": "nurse_emily", "password": "vitalguard123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Trigger fall
    fall_res = client.post("/api/emergency/1/fall", headers=headers)
    assert fall_res.status_code == 200
    assert fall_res.json()["status"] == "FALL_POSSIBLE"

    # Confirm fall
    confirm_res = client.post("/api/emergency/1/fall/confirm", headers=headers)
    assert confirm_res.status_code == 200
    assert confirm_res.json()["status"] == "FALL_CONFIRMED"

    # Trigger SOS
    sos_res = client.post("/api/emergency/1/sos", headers=headers)
    assert sos_res.status_code == 200
    assert sos_res.json()["status"] == "SOS_ACTIVE"

def test_nurse_priority_queue(client):
    login_res = client.post("/api/auth/login", json={"username": "nurse_emily", "password": "vitalguard123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/nurse-priority", headers=headers)
    assert res.status_code == 200
    priority_queue = res.json()
    assert len(priority_queue) >= 5
    # Verify sorted descending by risk score
    scores = [p["risk_score"] for p in priority_queue]
    assert scores == sorted(scores, reverse=True)

def test_emergency_access_and_audit_logs(client):
    # Doctor requests emergency override access
    login_doc = client.post("/api/auth/login", json={"username": "doc_jenkins", "password": "vitalguard123"})
    doc_token = login_doc.json()["access_token"]
    doc_headers = {"Authorization": f"Bearer {doc_token}"}

    override_res = client.post("/api/vitalpass/1/emergency-access", json={
        "reason": "Patient unresponsive following suspected seizure"
    }, headers=doc_headers)

    assert override_res.status_code == 200
    assert override_res.json()["message"] == "EMERGENCY ACCESS GRANTED"

    # Retrieve access audit logs
    logs_res = client.get("/api/access-logs", headers=doc_headers)
    assert logs_res.status_code == 200
    logs = logs_res.json()
    assert len(logs) > 0
