from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import DeviceStatus
from app.schemas.schemas import DeviceStatusResponse
from app.security import get_current_user, User

router = APIRouter(prefix="/api/devices", tags=["Devices"])

@router.get("", response_model=List[DeviceStatusResponse])
def get_devices(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    devices = db.query(DeviceStatus).all()
    return devices
