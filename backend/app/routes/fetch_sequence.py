import traceback
from fastapi import APIRouter, HTTPException, Query
from Bio import Entrez, SeqIO
from io import StringIO

router = APIRouter()

Entrez.email = "bioseqanalyzer@example.com"


@router.get("/fetch-sequence")
def fetch_sequence(accession: str = Query(..., description="NCBI accession number")):
    try:
        handle = Entrez.efetch(db="nucleotide", id=accession, rettype="fasta", retmode="text")
        raw = handle.read()
        handle.close()
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Failed to contact NCBI: {str(e)}",
        )

    if not raw.strip():
        raise HTTPException(status_code=404, detail=f"Accession '{accession}' not found")

    try:
        record = SeqIO.read(StringIO(raw), "fasta")
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Could not parse sequence for '{accession}': {str(e)}",
        )

    description = record.description or ""
    organism = "Unknown"
    if " " in description:
        parts = description.split(" ", 1)[1]
        organism = parts.split(",")[0] if "," in parts else parts.split(".")[0]

    return {
        "accession": record.id,
        "title": description[:200],
        "sequence": str(record.seq),
        "length": len(record.seq),
        "organism": organism,
    }
