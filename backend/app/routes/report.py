import traceback
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable,
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

router = APIRouter()

GREEN = HexColor("#00e5a0")
DARK_BG = HexColor("#0a0f0a")
SURFACE = HexColor("#0d1f1a")
BORDER = HexColor("#1a3d2e")
TEXT_PRIMARY = HexColor("#e0fff5")
TEXT_MUTED = HexColor("#7ab8a0")


class ReportRequest(BaseModel):
    sequence: str
    filename: Optional[str] = None
    analysis: dict
    blast_hits: Optional[list] = None
    ai_explanation: Optional[str] = None


def safe_add_style(stylesheet, style):
    if style.name not in stylesheet:
        stylesheet.add(style)
    return stylesheet[style.name]


def build_styles():
    styles = getSampleStyleSheet()

    safe_add_style(styles, ParagraphStyle(
        "TitleGreen", parent=styles["Title"],
        textColor=GREEN, fontSize=24, spaceAfter=4,
    ))
    safe_add_style(styles, ParagraphStyle(
        "Subtitle", parent=styles["Normal"],
        textColor=TEXT_MUTED, fontSize=10, spaceAfter=20,
    ))
    safe_add_style(styles, ParagraphStyle(
        "SectionHead", parent=styles["Heading2"],
        textColor=GREEN, fontSize=14, spaceBefore=16, spaceAfter=8,
    ))
    # BodyText already exists in default stylesheet — modify in place
    styles["BodyText"].textColor = TEXT_PRIMARY
    styles["BodyText"].fontSize = 9
    styles["BodyText"].leading = 13
    safe_add_style(styles, ParagraphStyle(
        "MonoText", parent=styles["Normal"],
        textColor=TEXT_PRIMARY, fontSize=7.5, leading=10,
        fontName="Courier", spaceAfter=6,
    ))
    safe_add_style(styles, ParagraphStyle(
        "TableCell", parent=styles["Normal"],
        textColor=TEXT_PRIMARY, fontSize=8, leading=11,
    ))
    safe_add_style(styles, ParagraphStyle(
        "HeaderCell", parent=styles["Normal"],
        textColor=GREEN, fontSize=8, leading=11,
    ))
    safe_add_style(styles, ParagraphStyle(
        "FooterText", parent=styles["Normal"],
        textColor=TEXT_MUTED, fontSize=7, alignment=TA_CENTER,
    ))
    return styles


def make_table(data, col_widths, styles_obj):
    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), SURFACE),
        ("TEXTCOLOR", (0, 0), (-1, 0), GREEN),
        ("TEXTCOLOR", (0, 1), (-1, -1), TEXT_PRIMARY),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("ALIGN", (1, 0), (-1, -1), "CENTER"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#0d1f1a"), HexColor("#0a0f0a")]),
    ]))
    return t


@router.post("/report")
def generate_report(request: ReportRequest):
    try:
        buf = BytesIO()
        doc = SimpleDocTemplate(
            buf, pagesize=letter,
            leftMargin=40, rightMargin=40,
            topMargin=40, bottomMargin=50,
            title="BioSeq Analyzer Report",
        )
        styles = build_styles()
        story = []
        s = request.analysis

        # --- Header ---
        story.append(Paragraph("BioSeq Analyzer", styles["TitleGreen"]))
        date_str = datetime.now().strftime("%B %d, %Y at %H:%M")
        filename_info = f" — {request.filename}" if request.filename else ""
        story.append(Paragraph(
            f"Report generated {date_str}{filename_info}",
            styles["Subtitle"],
        ))
        story.append(HRFlowable(
            width="100%", thickness=1, color=GREEN,
            spaceAfter=12, spaceBefore=0,
        ))

        # --- 1. Sequence Summary ---
        story.append(Paragraph("Sequence Summary", styles["SectionHead"]))
        seq_len = len(request.sequence)
        display_seq = (request.sequence[:80] + "...") if seq_len > 80 else request.sequence
        summary_data = [
            ["Property", "Value"],
            ["Sequence Length", f"{seq_len} bp"],
            ["GC Content", f"{s.get('gc_content_percent', 'N/A')}%"],
            ["AT Content", f"{s.get('at_content_percent', 'N/A')}%"],
            ["Melting Temperature (Wallace)", f"{s.get('melting_temperature_celsius', 'N/A')} °C"],
        ]
        story.append(make_table(summary_data, [220, 220], styles))
        story.append(Spacer(1, 6))
        story.append(Paragraph(
            f"<font color='#7ab8a0' size='7'>Sequence: </font>"
            f"<font color='#e0fff5' size='7' face='Courier'>{display_seq}</font>",
            styles["BodyText"],
        ))

        # --- 2. Base Frequency ---
        story.append(Paragraph("Base Frequency", styles["SectionHead"]))
        bf = s.get("base_frequency", {})
        freq_data = [["Base", "Count", "Percentage"]]
        for base in ["A", "T", "G", "C", "N"]:
            info = bf.get(base, {})
            freq_data.append([
                base,
                str(info.get("count", 0)),
                f'{info.get("percent", 0)}%',
            ])
        story.append(make_table(freq_data, [80, 120, 120], styles))

        # --- 3. Reverse Complement ---
        rev_comp = s.get("reverse_complement", "")
        if rev_comp:
            story.append(Paragraph("Reverse Complement", styles["SectionHead"]))
            story.append(Paragraph(rev_comp, styles["MonoText"]))

        # --- 4. Open Reading Frames ---
        orfs_data = s.get("orfs", {})
        frames = orfs_data.get("frames", [])
        story.append(Paragraph("Open Reading Frames", styles["SectionHead"]))
        if frames:
            orf_table = [["Frame", "Strand", "Start", "End", "Length (bp)"]]
            for f in frames[:20]:
                orf_table.append([
                    str(f.get("reading_frame", "")),
                    f.get("strand", ""),
                    str(f.get("start", "")),
                    str(f.get("end", "")),
                    str(f.get("length", "")),
                ])
            story.append(make_table(orf_table, [60, 70, 70, 70, 80], styles))
            if len(frames) > 20:
                story.append(Paragraph(
                    f"... and {len(frames) - 20} more ORFs",
                    styles["BodyText"],
                ))
        else:
            story.append(Paragraph("No ORFs found", styles["BodyText"]))

        # --- 5. BLAST Results ---
        blast_hits = request.blast_hits or []
        story.append(Paragraph("BLAST Results", styles["SectionHead"]))
        if blast_hits:
            blast_table = [["#", "Description", "Accession", "E-value", "Score", "Identity"]]
            for i, h in enumerate(blast_hits[:10], 1):
                blast_table.append([
                    str(i),
                    Paragraph(h.get("title", "")[:50], styles["TableCell"]),
                    h.get("accession", ""),
                    f'{h.get("e_value", 0):.2e}',
                    f'{h.get("score", 0):.1f}',
                    f'{h.get("identity", 0)}%',
                ])
            story.append(make_table(blast_table, [20, 140, 70, 70, 60, 60], styles))
        else:
            story.append(Paragraph("BLAST not performed", styles["BodyText"]))

        # --- 6. AI Explanation ---
        story.append(Paragraph("AI Analysis", styles["SectionHead"]))
        ai_text = request.ai_explanation
        if ai_text:
            story.append(Paragraph(ai_text, styles["BodyText"]))
        else:
            story.append(Paragraph("AI analysis not performed", styles["BodyText"]))

        # --- Footer ---
        story.append(Spacer(1, 24))
        story.append(HRFlowable(
            width="100%", thickness=0.5, color=BORDER,
            spaceAfter=8, spaceBefore=0,
        ))
        story.append(Paragraph(
            f"Generated by BioSeq Analyzer — {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            styles["FooterText"],
        ))

        doc.build(story)
        pdf_data = buf.getvalue()
        buf.close()

        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        return Response(
            content=pdf_data,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="bioseq_report_{ts}.pdf"',
            },
        )

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
