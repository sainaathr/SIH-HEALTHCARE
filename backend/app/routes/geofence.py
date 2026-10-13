from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import Hospital
from app.schemas.schemas import GeofenceCheckRequest, GeofenceCheckResponse
from app.services.geofence import is_within_geofence

router = APIRouter(prefix="/api/geofence", tags=["Geofence"])

@router.post("/check", response_model=GeofenceCheckResponse)
def check_geofence_status(request: GeofenceCheckRequest, db: Session = Depends(get_db)):
    hospital = db.query(Hospital).filter(Hospital.id == request.hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    inside, distance = is_within_geofence(
        request.latitude,
        request.longitude,
        hospital.latitude,
        hospital.longitude,
        hospital.geofence_radius
    )

    return {
        "inside_hospital": inside,
        "distance_meters": distance,
        "allowed_radius_meters": hospital.geofence_radius,
        "hospital_name": hospital.name
    }
