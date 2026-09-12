# pyrefly: ignore [missing-import]
from fastapi import FastAPI, Depends, HTTPException
# pyrefly: ignore [missing-import]
from sqlalchemy import text
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
# pyrefly: ignore [missing-import]
from app.core.security import hash_password
# pyrefly: ignore [missing-import]
import uvicorn

# pyrefly: ignore [missing-import]
from app.db.database import get_db, engine
from app.db import models

# Tables auto create karanawa
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Marketing Agent API",
    version="1.0.0"
)

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

from app.api import auth

app.include_router(auth.router)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)