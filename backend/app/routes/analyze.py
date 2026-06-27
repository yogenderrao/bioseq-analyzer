from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from app.services.dna_analysis import analyze

router = APIRouter()


class AnalyzeRequest(BaseModel):
    sequence: str = Field(..., min_length=1, description="Raw DNA sequence")
    filename: Optional[str] = Field(None, description="Optional filename for reference")


class AnalyzeResponse(BaseModel):
    sequence: str
    length: int
    is_valid: bool
    gc_content_percent: float
    at_content_percent: float
    melting_temperature_celsius: float
    base_frequency: dict
    reverse_complement: str
    orfs: dict
    restriction_map: list
    codon_usage: list
    primers: dict
    gc_skew: dict
    orf_translations: list
    composition_plot: list
    repeats: dict


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_sequence(request: AnalyzeRequest):
    try:
        result = analyze(request.sequence)
        return result
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
