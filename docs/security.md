# VitalGuard Security Architecture

## Authentication

### JWT (JSON Web Tokens)
- All API endpoints require a valid `Authorization: Bearer <token>` header
- Tokens are signed with HS256 and expire in 8 hours (configurable)
- On login, username + bcrypt-verified password → returns JWT
- Token payload contains: `user_id`, `username`, `role`, `hospital_id`

### Password Hashing
- Library: `bcrypt` (direct, without passlib wrapper — Python 3.14 compatible)
- Cost factor: 12 rounds (~0.3s per hash, resistant to brute force)

---

## Role-Based Access Control (RBAC)

| Role | Access Level | Permissions |
|------|-------------|-------------|
| `nurse` | Ward-level | View vitals, create/resolve alerts, VitalPass basic view |
| `doctor` | Hospital-level | Full clinical history, VitalPass deep unlock, risk analysis |
| `emergency_admin` | System-wide | All data, audit logs, device management |

### Implementation
- `get_current_user` dependency injects authenticated user into every route
- `RoleChecker(roles: List[str])` — callable FastAPI dependency for endpoint-level RBAC
- Hospital-scoped queries ensure cross-hospital data isolation

---

## VitalPass™ Security Chain

```
SCAN REQUEST
    │
    ▼
1. JWT Authentication        ← Is this a valid healthcare professional?
    │
    ▼
2. Scanner Device Lookup     ← Is the scanner in the authorized device registry?
    │
    ▼
3. Haversine Geofence Check  ← Is the scanner physically within 500m of the hospital?
    │
    ▼
4. RBAC Data Filter          ← What data tier can this role access?
    │
    ▼
5. Access Log                ← Immutable audit trail written to database
    │
    ▼
6. Response Rendering        ← Role-appropriate health passport data
```

### Geofence Algorithm (Haversine Formula)

```python
def haversine_distance(lat1, lon1, lat2, lon2) -> float:
    R = 6371000  # Earth radius in meters
    φ1, φ2 = radians(lat1), radians(lat2)
    Δφ = radians(lat2 - lat1)
    Δλ = radians(lon2 - lon1)
    a = sin(Δφ/2)² + cos(φ1)·cos(φ2)·sin(Δλ/2)²
    return 2·R·arcsin(√a)
```

- Hospital geofence radius: **500 meters** (configurable per hospital)
- Rejection message includes exact distance for audit clarity

---

## Break-Glass Emergency Override

For clinical emergencies where a patient is unconscious or VitalPass cannot be scanned:

1. Nurse enters a mandatory **clinical justification reason**
2. System grants temporary elevated read access
3. Access is **logged immediately** to audit trail with reason, user ID, timestamp
4. Audit event is flagged as `EMERGENCY_ACCESS` — reviewable by admin

---

## Audit Log Fields

| Field | Description |
|-------|-------------|
| `user_id` | Staff ID who accessed the record |
| `username` | Staff username |
| `patient_id` | Patient whose data was accessed |
| `hospital_id` | Hospital context of the scan |
| `access_type` | VITALPASS_SCAN / EMERGENCY_ACCESS |
| `scanner_device_id` | Physical scanner used |
| `reason` | Clinical justification or error reason |
| `success` | Whether access was granted |
| `timestamp` | UTC timestamp |
| `ip_address` | Client IP (logged in production) |

---

## Production Hardening Checklist

- [ ] Move `SECRET_KEY` to environment variable (done in `.env.example`)
- [ ] Replace SQLite with PostgreSQL
- [ ] Add HTTPS/TLS (NGINX reverse proxy)
- [ ] Enable rate limiting on `/api/auth/login`
- [ ] Add token refresh mechanism
- [ ] Enable HIPAA-compliant audit log retention (7 years)
- [ ] Implement data-at-rest encryption for medical records
