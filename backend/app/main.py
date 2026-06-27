from dotenv import load_dotenv
import os

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.analyze import router as analyze_router
from app.routes.explain import router as explain_router
from app.routes.blast import router as blast_router
from app.routes.report import router as report_router
from app.routes.fetch_sequence import router as fetch_sequence_router
from app.routes.batch import router as batch_router

app = FastAPI(
    title="BioSeq Analyzer",
    description="DNA sequence analysis API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("CORS_ORIGINS", "http://localhost:5173"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router, prefix="/api/v1", tags=["analyze"])
app.include_router(explain_router, prefix="/api/v1", tags=["explain"])
app.include_router(blast_router, prefix="/api/v1", tags=["blast"])
app.include_router(report_router, prefix="/api/v1", tags=["report"])
app.include_router(fetch_sequence_router, prefix="/api/v1", tags=["fetch-sequence"])
app.include_router(batch_router, prefix="/api/v1", tags=["batch"])


@app.get("/")
def root():
    return {"message": "BioSeq Analyzer API", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "ok"}
