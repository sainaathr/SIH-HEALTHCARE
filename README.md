# 🩺 VITALGUARD
### *Intelligent Continuous Non-Invasive Patient Monitoring & Emergency Response*

> **Smart India Hackathon 2024 — Full-Stack Prototype**

[![Python](https://img.shields.io/badge/Python-3.14-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🎯 Problem Statement

In Indian hospitals, patient monitoring is often manual, reactive, and nurse-to-nurse dependent. Physiological deterioration events — cardiac arrhythmias, oxygen desaturation, post-fall complications — are frequently detected dangerously late. Existing monitoring solutions are prohibitively expensive for Tier-2 and Tier-3 hospitals.

---

## 💡 VitalGuard Solution

VitalGuard is a **low-cost wireless wearable patient monitoring platform** that:

- 📡 **Continuously streams** physiological telemetry from low-cost ESP32 wearables
- 🧠 **Proactively calculates** real-time risk scores with transparent clinical reasoning
- 🚨 **Instantly detects** falls, hypoxia, fever spikes, arrhythmia, and patient SOS events
- 🔐 **Provides secure digital health passports (VitalPass™)** with geofence enforcement
- 🎖️ **Auto-prioritizes nurses** with a risk-ranked clinical triage queue

---

## 🏗️ System Architecture

```
ESP32 Wearables ──► FastAPI Backend ──► React Frontend Dashboard
    │                    │
    │                    ├── Risk Engine (Explainable Weighted Scoring)
    │                    ├── Anomaly Detection (trend trajectory)
    │                    ├── JWT Auth + RBAC
    │                    └── VitalPass™ (Geofence + RBAC Health Passport)
    │
  MAX30102 (PPG)     SQLite Database (dev)
  MPU6050 (IMU)
  DS18B20 (Temp)
  NEO-6M (GPS)
```

---

## 🧰 Hardware Sensors (ESP32 Wearable Package)

| Sensor | Measurement | Purpose |
|--------|------------|---------|
| MAX30102 | PPG Optical | Heart Rate + SpO2 |
| MPU6050 | 6-Axis IMU | Fall Detection (g-force spike) + Orientation |
| DS18B20 | Thermistor | Continuous Skin Temperature |
| NEO-6M | GPS | Patient Real-Time Location |
| ESP32 | Wi-Fi MCU | MQTT/HTTP Telemetry Transmission |

---

## ⚡ Feature Highlights

### 1. Real-Time Telemetry Stream
- Live 3-second polling of physiological vitals
- Recharts multi-line chart for HR, SpO2, Respiration

### 2. Explainable Risk Engine (0–100 Score)
- Weighted physiological deviation from patient-specific baselines
- Transparent score contributors rendered per factor
- Early warning trajectory analysis (STABLE / DETERIORATING / IMPROVING)

### 3. Nurse Triage Priority Queue
- Automatic priority ranking by calculated risk score
- Clinical action recommendation per patient
- Active alert count and vital status summary

### 4. Fall Detection & Emergency Events
- Simulated g-force IMU spike detection
- 10-second countdown modal for nurse dispatch
- Emergency event log with GPS coordinates

### 5. VitalPass™ Digital Health Passport
- QR/NFC-simulated tamper-proof health passport
- **Haversine geofence enforcement** — rejects scans outside 500m radius
- **RBAC-based rendering** — Nurses: emergency summary; Doctors: full clinical history
- Break-glass emergency access override with audit trail

### 6. Role-Based Access Control (RBAC)
| Role | Capabilities |
|------|-------------|
| `nurse` | View vitals, alerts, triage queue, basic VitalPass scan |
| `doctor` | Full medical history, VitalPass deep access, risk scores |
| `emergency_admin` | System-wide alerts, audit logs, all patient data |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.12+ (PyPy 3.14 compatible)
- Node.js 20+

### Backend Setup

```bash
cd vitalguard/backend
pip install -r requirements.txt
py -3.14 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd vitalguard/frontend
npm install
npm run dev
```

### Access Points

| Service | URL |
|---------|-----|
| Frontend Dashboard | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger API Docs | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |

---

## 🔑 Demo Credentials

| Username | Password | Role |
|----------|----------|------|
| `nurse_emily` | `vitalguard123` | Nurse (Triage) |
| `doc_jenkins` | `vitalguard123` | Attending Physician |
| `admin_marcus` | `vitalguard123` | Emergency Admin |

---

## 🎬 5-Minute Hackathon Demo Script

1. **Login** as `nurse_emily` → Show Dashboard
2. **Nurse Priority Queue** → Show auto-ranked patients by risk score
3. **Patient P001** → Open Eleanor Vance → Show Live Telemetry + Explainable Risk Meter
4. **Simulate FALL** → Watch 10s countdown modal appear
5. **VitalPass** → Scan P001 (inside geofence) → Show encrypted health passport
6. **Switch to Outside Geofence** (Lat: 13.5, Lng: 78.1) → Show DENIED
7. **Login as `doc_jenkins`** → Show expanded clinical history unlock
8. **Alert Center** → Resolve active alerts
9. **Demo Reset** → Settings → Return all patients to stable state

---

## 📁 Project Structure

```
vitalguard/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entrypoint
│   │   ├── database.py          # SQLAlchemy setup
│   │   ├── security.py          # JWT + RBAC
│   │   ├── seed.py              # Demo data seeder
│   │   ├── models/models.py     # ORM models
│   │   ├── schemas/schemas.py   # Pydantic schemas
│   │   ├── routes/              # API route modules
│   │   └── services/            # Risk engine, simulator, geofence
│   ├── tests/                   # pytest test suite
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page-level views
│   │   ├── context/             # Auth context
│   │   ├── services/api.ts      # Axios API layer
│   │   └── types/index.ts       # TypeScript type definitions
│   └── package.json
└── docs/
    ├── architecture.md
    ├── hardware.md
    └── security.md
```

---

## 🧪 Running Tests

```bash
cd vitalguard/backend
py -3.14 -m pytest tests/ -v
```

All 8 unit and integration tests pass:
- `test_auth.py` — JWT login, token validation
- `test_patients.py` — Patient CRUD, telemetry streaming  
- `test_emergency.py` — Fall detection, SOS workflow
- `test_priority.py` — Nurse triage queue sorting

---

## 🔮 Roadmap & Future Scope

- 🏥 **5G NB-IoT fallback** for patients outside hospital Wi-Fi
- ❤️ **AD8232 ECG integration** — arrhythmia & AFib detection
- 🔬 **TinyML on ESP32** — on-device seizure/fall model under 200ms
- 🏛️ **ABDM/FHIR integration** — Ayushman Bharat national EHR compatibility
- ☁️ **AWS IoT Core / MQTT** — Production cloud telemetry pipeline

---

## ⚠️ Disclaimer

VitalGuard is a proof-of-concept prototype built for SIH/hackathon demonstration. Sensor inputs are simulated for demo purposes. Not intended for clinical diagnostic use without medical device certification.

---

## 📄 License

MIT License — Built by the VitalGuard Team for Smart India Hackathon 2024
