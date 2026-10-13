# VitalGuard System Architecture

## Overview

VitalGuard is a three-layer distributed system: Hardware (IoT Edge), Backend (Cloud/On-Prem), and Frontend (Clinical Dashboard).

```
┌──────────────────────────────────────────────────┐
│             CLINICAL DASHBOARD (React + Vite)    │
│  Dashboard │ Patients │ Alerts │ VitalPass       │
│  Recharts │ Leaflet Maps │ Voice Assistant       │
└─────────────────────────┬────────────────────────┘
                          │ HTTP/REST (Axios)
                          ▼
┌──────────────────────────────────────────────────┐
│          BACKEND (FastAPI + SQLAlchemy)           │
│                                                  │
│  ┌─────────────────────────────────────────┐    │
│  │   Authentication & RBAC                 │    │
│  │   JWT Bearer Tokens │ Role-Based Views  │    │
│  └─────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────┐    │
│  │   Risk Engine (Explainable AI)          │    │
│  │   Weighted Scoring │ Trend Analysis     │    │
│  └─────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────┐    │
│  │   VitalPass™ Security Module            │    │
│  │   Geofence (Haversine) │ RBAC │ Audit   │    │
│  └─────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────┐    │
│  │   Sensor Telemetry Simulator            │    │
│  │   ESP32 mock: Normal │ Fall │ SOS       │    │
│  └─────────────────────────────────────────┘    │
│                       │                         │
│            SQLite (dev) / PostgreSQL (prod)      │
└─────────────────────────┬────────────────────────┘
                          │ HTTP POST /api/ingest
                          ▼
┌──────────────────────────────────────────────────┐
│       IoT HARDWARE LAYER (ESP32 Wearables)       │
│                                                  │
│  MAX30102  │  MPU6050  │  DS18B20  │  NEO-6M     │
│  HR+SpO2   │  Fall IMU │  Temp     │  GPS        │
│                                                  │
│   Wi-Fi (IEEE 802.11) → HTTP telemetry post     │
│   LoRa/5G NB-IoT fallback (roadmap)             │
└──────────────────────────────────────────────────┘
```

## API Route Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | JWT authentication |
| `/api/patients` | GET | All patients list |
| `/api/patients/{id}` | GET | Single patient detail |
| `/api/patients/{id}/vitals/latest` | GET | Latest sensor reading |
| `/api/patients/{id}/telemetry` | GET | Historical telemetry |
| `/api/patients/{id}/risk` | GET | Explainable risk assessment |
| `/api/patients/{id}/alerts` | GET | Per-patient alerts |
| `/api/alerts` | GET | System-wide alert feed |
| `/api/alerts/{id}/resolve` | POST | Resolve alert |
| `/api/nurse-priority` | GET | Risk-ranked triage queue |
| `/api/emergency/{id}/fall` | POST | Trigger fall event |
| `/api/emergency/{id}/sos` | POST | Trigger SOS event |
| `/api/emergency/events` | GET | Emergency events log |
| `/api/vitalpass/scan` | POST | VitalPass scan + geofence |
| `/api/vitalpass/{id}/emergency-access` | POST | Break-glass override |
| `/api/access-logs` | GET | Security audit logs |
| `/api/devices` | GET | ESP32 device status |
| `/api/simulation/{id}/start/{scenario}` | POST | Override patient scenario |
| `/api/simulation/demo/reset` | POST | Reset all to baseline |
| `/api/geofence/validate` | POST | Manual geofence check |

## Database Models

- **User** — Hospital staff with roles (nurse, doctor, emergency_admin)
- **Hospital** — Hospital entity with GPS center + geofence_radius
- **Patient** — Patient profile with condition baselines
- **Vital** — Timestamped sensor readings (HR, SpO2, Temp, Resp, GPS, IMU)
- **Alert** — Triggered threshold breach events
- **EmergencyEvent** — Fall/SOS incidents with location
- **EmergencyContact** — Next-of-kin contacts per patient
- **MedicalHistory** — Doctors-only clinical history records
- **DeviceStatus** — ESP32 device registry + authorization
- **AccessLog** — Immutable VitalPass scan audit trail
