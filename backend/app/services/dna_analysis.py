from Bio import SeqIO
from Bio.Seq import Seq
from Bio.SeqUtils import gc_fraction
from io import StringIO
import re


VALID_BASES = set("ATGCN")


def validate_sequence(sequence: str) -> str | None:
    if not sequence or not sequence.strip():
        return "Sequence cannot be empty"

    cleaned = sequence.strip().upper()
    invalid = set(cleaned) - VALID_BASES
    if invalid:
        return f"Invalid DNA character(s): {', '.join(sorted(invalid))}. Only A, T, G, C, N allowed."

    return None


def calculate_gc_content(seq_obj: Seq) -> float:
    return round(gc_fraction(seq_obj) * 100, 2)


def calculate_at_content(gc_percent: float) -> float:
    return round(100.0 - gc_percent, 2)


def calculate_melting_temp(seq_obj: Seq) -> float:
    from math import log10

    seq_str = str(seq_obj).upper().replace("N", "")
    if len(seq_str) == 0:
        return 0.0
    length = len(seq_str)
    if length <= 13:
        a_count = seq_str.count("A")
        t_count = seq_str.count("T")
        tm = 2 * (a_count + t_count) + 4 * (length - a_count - t_count)
    else:
        gc_count = seq_str.count("G") + seq_str.count("C")
        gc_decimal = gc_count / length
        tm = 81.5 + 16.6 * log10(0.05) + 0.41 * gc_decimal - 675 / length
    return round(tm, 2)


def calculate_base_frequency(seq_obj: Seq) -> dict:
    seq_str = str(seq_obj).upper()
    length = len(seq_str)
    bases = {"A": 0, "T": 0, "G": 0, "C": 0, "N": 0}
    for base in seq_str:
        if base in bases:
            bases[base] += 1

    result = {}
    for base in ["A", "T", "G", "C", "N"]:
        result[base] = {
            "count": bases[base],
            "percent": round((bases[base] / length) * 100, 2) if length > 0 else 0.0,
        }
    return result


def reverse_complement(seq_obj: Seq) -> str:
    return str(seq_obj.reverse_complement())


def find_orfs(seq_str: str, min_length: int = 100) -> list:
    codon_table = {
        "TTT": "F", "TTC": "F", "TTA": "L", "TTG": "L",
        "TCT": "S", "TCC": "S", "TCA": "S", "TCG": "S",
        "TAT": "Y", "TAC": "Y", "TAA": "*", "TAG": "*",
        "TGT": "C", "TGC": "C", "TGA": "*", "TGG": "W",
        "CTT": "L", "CTC": "L", "CTA": "L", "CTG": "L",
        "CCT": "P", "CCC": "P", "CCA": "P", "CCG": "P",
        "CAT": "H", "CAC": "H", "CAA": "Q", "CAG": "Q",
        "CGT": "R", "CGC": "R", "CGA": "R", "CGG": "R",
        "ATT": "I", "ATC": "I", "ATA": "I", "ATG": "M",
        "ACT": "T", "ACC": "T", "ACA": "T", "ACG": "T",
        "AAT": "N", "AAC": "N", "AAA": "K", "AAG": "K",
        "AGT": "S", "AGC": "S", "AGA": "R", "AGG": "R",
        "GTT": "V", "GTC": "V", "GTA": "V", "GTG": "V",
        "GCT": "A", "GCC": "A", "GCA": "A", "GCG": "A",
        "GAT": "D", "GAC": "D", "GAA": "E", "GAG": "E",
        "GGT": "G", "GGC": "G", "GGA": "G", "GGG": "G",
    }
    stop_codons = {"TAA", "TAG", "TGA"}

    seq = seq_str.upper().replace("N", "X")
    seq_rc = str(Seq(seq_str).reverse_complement()).upper().replace("N", "X")

    frames = []

    for frame_offset, sequence in [(0, seq), (1, seq), (2, seq),
                                    (3, seq_rc), (4, seq_rc), (5, seq_rc)]:
        reading_frame = frame_offset + 1
        is_reverse = reading_frame > 3
        strand = "reverse" if is_reverse else "forward"

        seq_trimmed = sequence[frame_offset % 3:]
        prot = []
        for i in range(0, len(seq_trimmed) - 2, 3):
            codon = seq_trimmed[i:i + 3]
            if len(codon) < 3:
                break
            if "X" in codon:
                prot.append("X")
            else:
                prot.append(codon_table.get(codon, "X"))

        protein = "".join(prot)
        orfs = []
        i = 0
        while i < len(protein):
            if protein[i] == "M":
                j = i
                while j < len(protein) and protein[j] != "*":
                    j += 1
                if j < len(protein):
                    orf_length = (j - i) * 3
                    if orf_length >= min_length:
                        start = i * 3 + (frame_offset % 3)
                        end = j * 3 + 3 + (frame_offset % 3)
                        orfs.append({
                            "start": start,
                            "end": end,
                            "length": orf_length,
                            "strand": strand,
                            "reading_frame": reading_frame,
                        })
                    i = j + 1
                else:
                    orf_length = (len(protein) - i) * 3
                    if orf_length >= min_length:
                        start = i * 3 + (frame_offset % 3)
                        end = len(sequence)
                        orfs.append({
                            "start": start,
                            "end": end,
                            "length": orf_length,
                            "strand": strand,
                            "reading_frame": reading_frame,
                        })
                    break
            else:
                i += 1
        frames.extend(orfs)

    return sorted(frames, key=lambda x: x["length"], reverse=True)


RESTRICTION_ENZYMES = {
    "EcoRI": "GAATTC",
    "BamHI": "GGATCC",
    "HindIII": "AAGCTT",
    "NotI": "GCGGCCGC",
    "XhoI": "CTCGAG",
    "NcoI": "CCATGG",
    "SalI": "GTCGAC",
    "XbaI": "TCTAGA",
    "SphI": "GCATGC",
    "KpnI": "GGTACC",
    "PstI": "CTGCAG",
    "SmaI": "CCCGGG",
}

STANDARD_GENETIC_CODE = {
    "TTT": "F", "TTC": "F", "TTA": "L", "TTG": "L",
    "TCT": "S", "TCC": "S", "TCA": "S", "TCG": "S",
    "TAT": "Y", "TAC": "Y", "TAA": "*", "TAG": "*",
    "TGT": "C", "TGC": "C", "TGA": "*", "TGG": "W",
    "CTT": "L", "CTC": "L", "CTA": "L", "CTG": "L",
    "CCT": "P", "CCC": "P", "CCA": "P", "CCG": "P",
    "CAT": "H", "CAC": "H", "CAA": "Q", "CAG": "Q",
    "CGT": "R", "CGC": "R", "CGA": "R", "CGG": "R",
    "ATT": "I", "ATC": "I", "ATA": "I", "ATG": "M",
    "ACT": "T", "ACC": "T", "ACA": "T", "ACG": "T",
    "AAT": "N", "AAC": "N", "AAA": "K", "AAG": "K",
    "AGT": "S", "AGC": "S", "AGA": "R", "AGG": "R",
    "GTT": "V", "GTC": "V", "GTA": "V", "GTG": "V",
    "GCT": "A", "GCC": "A", "GCA": "A", "GCG": "A",
    "GAT": "D", "GAC": "D", "GAA": "E", "GAG": "E",
    "GGT": "G", "GGC": "G", "GGA": "G", "GGG": "G",
}


def find_restriction_sites(seq_str: str) -> list:
    results = []
    for enzyme, site in RESTRICTION_ENZYMES.items():
        positions = []
        start = 0
        while True:
            pos = seq_str.find(site, start)
            if pos == -1:
                break
            positions.append(pos)
            start = pos + 1
        if positions:
            results.append({
                "enzyme": enzyme,
                "recognition_site": site,
                "positions": positions,
                "count": len(positions),
            })
    return results


def codon_usage(seq_str: str, orfs: dict) -> list:
    if orfs.get("frames"):
        orf = orfs["frames"][0]
        start, end = orf["start"], orf["end"]
        coding = seq_str[start:end]
    else:
        coding = seq_str

    if len(coding) < 3:
        return []

    codons = []
    for i in range(0, len(coding) - 2, 3):
        codons.append(coding[i:i + 3])

    if not codons:
        return []

    total = len(codons)
    counts = {}
    for c in codons:
        counts[c] = counts.get(c, 0) + 1

    result = []
    for codon, count in counts.items():
        result.append({
            "codon": codon,
            "amino_acid": STANDARD_GENETIC_CODE.get(codon, "X"),
            "count": count,
            "frequency": round(count / total, 4),
        })

    result.sort(key=lambda x: x["frequency"], reverse=True)
    return result


def _primer_tm(seq: str) -> float:
    if len(seq) < 2:
        return 0.0
    at = seq.count("A") + seq.count("T")
    gc = seq.count("G") + seq.count("C")
    return float(2 * at + 4 * gc)


def design_primers(seq_str: str) -> dict:
    min_len, max_len = 18, 22

    def _no_homopolymer(p):
        for i in range(len(p) - 3):
            if len(set(p[i:i + 4])) == 1:
                return False
        return True

    def _gc_ok(p, low=40, high=60):
        gc = p.count("G") + p.count("C")
        return low <= gc / len(p) * 100 <= high

    def _score_primer(p):
        if not _no_homopolymer(p):
            return -1
        gc = p.count("G") + p.count("C")
        gc_pct = gc / len(p) * 100
        if gc_pct < 40 or gc_pct > 60:
            return -1
        tm = _primer_tm(p)
        if 52 <= tm <= 68:
            return 3
        if 48 <= tm <= 72:
            return 2
        return 1

    def _best_primer(candidates):
        best, best_score = "", -1
        for c in candidates:
            s = _score_primer(c)
            if s > best_score:
                best, best_score = c, s
        return best

    fwd_candidates = []
    for start in range(min(100, len(seq_str))):
        for l in range(min_len, min(max_len + 1, len(seq_str) - start + 1)):
            p = seq_str[start:start + l]
            if _no_homopolymer(p) and _gc_ok(p):
                fwd_candidates.append(p)
    if not fwd_candidates:
        fwd_candidates = [seq_str[:max_len]]
    fwd = _best_primer(fwd_candidates)
    fwd_gc = (fwd.count("G") + fwd.count("C")) / len(fwd) * 100 if fwd else 0

    rev_candidates = []
    seq_end = len(seq_str)
    for start in range(max(0, seq_end - 100), seq_end):
        for l in range(min_len, min(max_len + 1, seq_end - start + 1)):
            p = str(Seq(seq_str[start:start + l]).reverse_complement())
            if _no_homopolymer(p) and _gc_ok(p):
                rev_candidates.append(p)
    seq_last = seq_str[-max_len:]
    rev_last = str(Seq(seq_last).reverse_complement())
    if not rev_candidates:
        rev_candidates = [rev_last]
    rev = _best_primer(rev_candidates)
    rev_gc = (rev.count("G") + rev.count("C")) / len(rev) * 100 if rev else 0

    return {
        "forward": {
            "sequence": fwd,
            "length": len(fwd),
            "tm": _primer_tm(fwd),
            "gc_content": round(fwd_gc, 2),
            "position": "5' end",
        },
        "reverse": {
            "sequence": rev,
            "length": len(rev),
            "tm": _primer_tm(rev),
            "gc_content": round(rev_gc, 2),
            "position": "3' end",
        },
    }


def gc_skew(seq_str: str) -> dict:
    window = 100
    step = 50
    results = []

    for i in range(0, len(seq_str) - window + 1, step):
        seg = seq_str[i:i + window]
        g = seg.count("G")
        c = seg.count("C")
        skew = (g - c) / (g + c) if (g + c) > 0 else 0
        results.append({
            "position": i,
            "gc_skew": round(skew, 4),
        })

    g_total = seq_str.count("G")
    c_total = seq_str.count("C")
    overall = (g_total - c_total) / (g_total + c_total) if (g_total + c_total) > 0 else 0

    return {
        "windows": results,
        "overall_gc_skew": round(overall, 4),
    }


THREE_LETTER_CODE = {
    "A": "Ala", "R": "Arg", "N": "Asn", "D": "Asp", "C": "Cys",
    "Q": "Gln", "E": "Glu", "G": "Gly", "H": "His", "I": "Ile",
    "L": "Leu", "K": "Lys", "M": "Met", "F": "Phe", "P": "Pro",
    "S": "Ser", "T": "Thr", "W": "Trp", "Y": "Tyr", "V": "Val",
    "*": "Stp", "X": "Xaa",
}

CODON_TABLE_1LETTER = {
    "TTT": "F", "TTC": "F", "TTA": "L", "TTG": "L",
    "TCT": "S", "TCC": "S", "TCA": "S", "TCG": "S",
    "TAT": "Y", "TAC": "Y", "TAA": "*", "TAG": "*",
    "TGT": "C", "TGC": "C", "TGA": "*", "TGG": "W",
    "CTT": "L", "CTC": "L", "CTA": "L", "CTG": "L",
    "CCT": "P", "CCC": "P", "CCA": "P", "CCG": "P",
    "CAT": "H", "CAC": "H", "CAA": "Q", "CAG": "Q",
    "CGT": "R", "CGC": "R", "CGA": "R", "CGG": "R",
    "ATT": "I", "ATC": "I", "ATA": "I", "ATG": "M",
    "ACT": "T", "ACC": "T", "ACA": "T", "ACG": "T",
    "AAT": "N", "AAC": "N", "AAA": "K", "AAG": "K",
    "AGT": "S", "AGC": "S", "AGA": "R", "AGG": "R",
    "GTT": "V", "GTC": "V", "GTA": "V", "GTG": "V",
    "GCT": "A", "GCC": "A", "GCA": "A", "GCG": "A",
    "GAT": "D", "GAC": "D", "GAA": "E", "GAG": "E",
    "GGT": "G", "GGC": "G", "GGA": "G", "GGG": "G",
}


def _translate_to_protein(dna: str) -> tuple[str, str]:
    prot_1 = []
    prot_3 = []
    for i in range(0, len(dna) - 2, 3):
        codon = dna[i:i+3]
        aa = CODON_TABLE_1LETTER.get(codon, "X")
        prot_1.append(aa)
        prot_3.append(THREE_LETTER_CODE.get(aa, "Xaa"))
    return "".join(prot_1), "-".join(prot_3)


def translate_orfs(seq_str: str, orf_list: list) -> list:
    results = []
    for orf in orf_list:
        dna = seq_str[orf["start"]:orf["end"]]
        p1, p3 = _translate_to_protein(dna)
        results.append({
            "frame": orf["reading_frame"],
            "strand": orf["strand"],
            "start": orf["start"],
            "end": orf["end"],
            "dna_sequence": dna,
            "protein_1letter": p1,
            "protein_3letter": p3,
            "protein_length": len(p1),
        })
    return results


def composition_plot(seq_str: str) -> list:
    window = 50
    step = 10
    results = []
    for i in range(0, len(seq_str) - window + 1, step):
        seg = seq_str[i:i+window]
        gc = seg.count("G") + seg.count("C")
        at = seg.count("A") + seg.count("T")
        total = gc + at
        if total == 0:
            continue
        results.append({
            "position": i,
            "gc_percent": round(gc / total * 100, 2),
            "at_percent": round(at / total * 100, 2),
        })
    return results


def find_repeats(seq_str: str) -> dict:
    tandem = []
    micro = []

    for unit_len in range(2, 7):
        i = 0
        while i < len(seq_str) - unit_len * 2:
            unit = seq_str[i:i+unit_len]
            count = 1
            j = i + unit_len
            while j + unit_len <= len(seq_str) and seq_str[j:j+unit_len] == unit:
                count += 1
                j += unit_len
            if count >= 3:
                rep_type = "microsatellite" if 2 <= unit_len <= 4 or (unit_len == 2 and count >= 4) else "tandem"
                entry = {
                    "repeat_unit": unit,
                    "repeat_count": count,
                    "start": i,
                    "end": j,
                    "length": j - i,
                    "type": rep_type,
                }
                if rep_type == "microsatellite":
                    micro.append(entry)
                else:
                    tandem.append(entry)
                i = j
                continue
            i += 1

    return {
        "tandem_repeats": tandem,
        "microsatellites": micro,
    }


def analyze(sequence: str) -> dict:
    validation_error = validate_sequence(sequence)
    if validation_error:
        raise ValueError(validation_error)

    cleaned = sequence.strip().upper()
    seq_obj = Seq(cleaned)
    length = len(cleaned)
    gc_content = calculate_gc_content(seq_obj)
    at_content = calculate_at_content(gc_content)
    melting_temp = calculate_melting_temp(seq_obj)
    base_freq = calculate_base_frequency(seq_obj)
    rev_comp = reverse_complement(seq_obj)
    orfs = find_orfs(cleaned)
    restriction_map = find_restriction_sites(cleaned)
    codon_table = codon_usage(cleaned, {"frames": orfs})
    primers = design_primers(cleaned)
    skew = gc_skew(cleaned)
    orf_translations = translate_orfs(cleaned, orfs)
    comp_plot = composition_plot(cleaned)
    repeats = find_repeats(cleaned)

    return {
        "sequence": cleaned,
        "length": length,
        "is_valid": True,
        "gc_content_percent": gc_content,
        "at_content_percent": at_content,
        "melting_temperature_celsius": melting_temp,
        "base_frequency": base_freq,
        "reverse_complement": rev_comp,
        "orfs": {
            "count": len(orfs),
            "min_length_requirement": 100,
            "frames": orfs,
        },
        "restriction_map": restriction_map,
        "codon_usage": codon_table,
        "primers": primers,
        "gc_skew": skew,
        "orf_translations": orf_translations,
        "composition_plot": comp_plot,
        "repeats": repeats,
    }
