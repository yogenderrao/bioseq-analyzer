from dotenv import load_dotenv
import os

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from groq import Groq

router = APIRouter()

SYSTEM_PROMPT = (
    "You are an expert molecular biologist and bioinformatician. "
    "Explain DNA analysis results clearly for a researcher. "
    "Be concise, insightful, and suggest biological significance "
    "and recommended next steps."
)


class ExplainRequest(BaseModel):
    sequence: str
    length: int
    gc_content_percent: float
    at_content_percent: float
    melting_temperature_celsius: float
    base_frequency: dict
    reverse_complement: str
    orfs: dict


class ExplainResponse(BaseModel):
    explanation: str


@router.post("/explain", response_model=ExplainResponse)
def explain_analysis(request: ExplainRequest):
    if not GROQ_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY not configured on the server",
        )

    try:
        client = Groq(api_key=GROQ_API_KEY)

        analysis_text = (
            f"DNA Sequence Analysis Results:\n"
            f"- Sequence length: {request.length} bp\n"
            f"- GC content: {request.gc_content_percent}%\n"
            f"- AT content: {request.at_content_percent}%\n"
            f"- Melting temperature (Wallace): {request.melting_temperature_celsius}°C\n"
            f"- Base frequencies: A={request.base_frequency['A']['count']} ({request.base_frequency['A']['percent']}%), "
            f"T={request.base_frequency['T']['count']} ({request.base_frequency['T']['percent']}%), "
            f"G={request.base_frequency['G']['count']} ({request.base_frequency['G']['percent']}%), "
            f"C={request.base_frequency['C']['count']} ({request.base_frequency['C']['percent']}%), "
            f"N={request.base_frequency['N']['count']} ({request.base_frequency['N']['percent']}%)\n"
            f"- Reverse complement: {request.reverse_complement[:80]}...\n"
            f"- Open reading frames detected: {request.orfs.get('count', 0)}\n"
            f"- ORF minimum length requirement: {request.orfs.get('min_length_requirement', 100)} bp"
        )

        if request.orfs.get("frames"):
            analysis_text += "\n- ORF details:\n"
            for i, orf in enumerate(request.orfs["frames"][:5]):
                analysis_text += (
                    f"    {i+1}. Frame {orf['reading_frame']} ({orf['strand']}): "
                    f"start={orf['start']}, end={orf['end']}, length={orf['length']} bp\n"
                )
            if len(request.orfs["frames"]) > 5:
                analysis_text += f"    ... and {len(request.orfs['frames']) - 5} more\n"

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": analysis_text},
            ],
        )
        explanation = response.choices[0].message.content

        return ExplainResponse(explanation=explanation)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Groq API call failed: {str(e)}",
        )
