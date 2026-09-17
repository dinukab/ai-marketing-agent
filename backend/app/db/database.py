import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# .env file eke thiyena variables load karanawa
load_dotenv()

# .env eken DATABASE_URL eka gannawa
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# DB connection engine eka hadanawa
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Database sessions hadanna class ekak hadanawa
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Ape anith models (tables) hadanna base class eka
Base = declarative_base()

# Dependency ekak widiyata DB session eka dena function eka (API endpoints walata use karanna)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()