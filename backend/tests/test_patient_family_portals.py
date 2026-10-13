import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal, engine, Base
from app.seed import seed_database

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    db.close()

def get_token(username="patient_rahul"):
    response = client.post("/api/auth/login", json={"username": username, "password": "vitalguard123"})
    assert response.status_code == 200
    return response.json()["access_token"]

def test_patient_dashboard():
    token = get_token("patient_rahul")
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/api/patient/me/dashboard", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["patient_code"] == "P001"
    assert "vitals" in data
    assert "risk" in data

def test_patient_reports_and_medications():
    token = get_token("patient_rahul")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Reports
    r_resp = client.get("/api/patient/me/reports", headers=headers)
    assert r_resp.status_code == 200
    assert len(r_resp.json()) >= 2

    # Medications
    m_resp = client.get("/api/patient/me/medications", headers=headers)
    assert m_resp.status_code == 200
    assert len(m_resp.json()) >= 2

def test_family_portal_consent_enforcement():
    token = get_token("family_priya")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Linked patients list
    p_resp = client.get("/api/family/patients", headers=headers)
    assert p_resp.status_code == 200
    patients = p_resp.json()
    assert len(patients) >= 1
    
    patient_id = patients[0]["patient_id"]
    
    # Detail view
    detail_resp = client.get(f"/api/family/patients/{patient_id}", headers=headers)
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert detail["vitals"] is not None
    # Medical reports should be None by default permission (False)
    assert detail["reports"] is None
