import ssl
import certifi
import os

ssl._create_default_https_context = ssl.create_default_context
os.environ["SSL_CERT_FILE"] = certifi.where()

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from Bio.Blast import NCBIWWW, NCBIXML

router = APIRouter()


class BlastRequest(BaseModel):
    sequence: str


class BlastHit(BaseModel):
    title: str
    accession: str
    e_value: float
    score: float
    identity: float
    query_coverage: float
    length: int


class BlastResponse(BaseModel):
    hits: list[BlastHit]
    message: str = ""


@router.post("/blast", response_model=BlastResponse)
def run_blast(request: BlastRequest):
    if not request.sequence or not request.sequence.strip():
        raise HTTPException(status_code=422, detail="Sequence cannot be empty")

    try:
        result_handle = NCBIWWW.qblast(
            program="blastn",
            database="nt",
            sequence=request.sequence,
            hitlist_size=10,
            expect=10.0,
            alignments=10,
        )

        blast_record = NCBIXML.read(result_handle)
        result_handle.close()

        hits = []
        for alignment in blast_record.alignments[:10]:
            hsp = alignment.hsps[0] if alignment.hsps else None
            if not hsp:
                continue

            query_len = blast_record.query_length
            align_len = hsp.align_length
            identity_pct = round((hsp.identities / align_len) * 100, 2) if align_len else 0.0
            query_cov = round((align_len / query_len) * 100, 2) if query_len else 0.0

            hits.append(BlastHit(
                title=alignment.title[:120],
                accession=alignment.accession,
                e_value=hsp.expect,
                score=hsp.score,
                identity=identity_pct,
                query_coverage=query_cov,
                length=align_len,
            ))

        if not hits:
            return BlastResponse(hits=[], message="No significant hits found in the nucleotide database")

        return BlastResponse(hits=hits, message=f"Found {len(hits)} significant alignments")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"BLAST search failed: {str(e)}")
