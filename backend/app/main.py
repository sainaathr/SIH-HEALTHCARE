import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.seed import seed_database
from app.routes import auth, patients, telemetry, simulation, emergency, alerts, geofence, vitalpass, devices, patient_portal, family_portal

# Create database tables
Base.metadata.create_all(bind=engine)

# Seed initial database
db = SessionLocal()
try:
    seed_database(db)
finally:
    db.close()

app = FastAPI(
    title="VITALGUARD API",
    description="Intelligent Continuous Non-Invasive Patient Monitoring & Emergency Response API",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(telemetry.router)
app.include_router(simulation.router)
app.include_router(emergency.router)
app.include_router(alerts.router)
app.include_router(geofence.router)
app.include_router(vitalpass.router)
app.include_router(devices.router)
app.include_router(patient_portal.router)
app.include_router(family_portal.router)

@app.get("/")
def root():
    return {
        "system": "VITALGUARD",
        "tagline": "Intelligent Continuous Non-Invasive Patient Monitoring & Emergency Response",
        "status": "OPERATIONAL",
        "version": "1.0.0",
        "medical_disclaimer": "This is a hackathon prototype for demonstration and research. Not a certified medical device."
    }
