import sys
import os
import traceback

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    from app.seed import seed_database
    seed_database(db)
    print("Seed OK")
except Exception as e:
    lines = traceback.format_exc().splitlines()
    for l in lines:
        print("TB:", l)
finally:
    db.close()
