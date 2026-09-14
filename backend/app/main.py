from fastapi import FastAPI, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
import uvicorn

from app.database import get_db, engine
from app import models  # Models tika import karaganna ona

# App eka run weddi models wala thiyena tables tika DB eke create karanawa
models.Base.metadata.create_all(bind=engine)

from fastapi.middleware.cors import CORSMiddleware
from app.api import auth

app = FastAPI(
    title="AI Marketing Agent API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"failed: {str(e)}"

    return {
        "status": "ok",
        "service": "AI Marketing Agent API is running",
        "database": db_status
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)