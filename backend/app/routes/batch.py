from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from app.services.dna_analysis import analyze

router = APIRouter()


class BatchSequence(BaseModel):
    id: str = Field(..., description="Unique identifier for the sequence")
    sequence: str = Field(..., min_length=1, description="DNA sequence")
    filename: Optional[str] = Field(None, description="Optional filename")


class BatchRequest(BaseModel):
    sequences: list[BatchSequence] = Field(..., max_length=10, description="Max 10 sequences")


class BatchResult(BaseModel):
    id: str
    status: str
    result: Optional[dict] = None
    error: Optional[str] = None


@router.post("/analyze-batch", response_model=list[BatchResult])
def analyze_batch(request: BatchRequest):
    if len(request.sequences) > 10:
        raise HTTPException(status_code=422, detail="Maximum 10 sequences allowed per batch")

    results = []
    for seq in request.sequences:
        try:
            result = analyze(seq.sequence)
            results.append({"id": seq.id, "status": "success", "result": result, "error": None})
        except ValueError as e:
            results.append({"id": seq.id, "status": "error", "result": None, "error": str(e)})
        except Exception as e:
            results.append({"id": seq.id, "status": "error", "result": None, "error": f"Analysis failed: {str(e)}"})

    return results
