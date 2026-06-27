# 🧬 BioSeq Analyzer

> A full-stack DNA sequence analysis platform powered by AI, 
> Biopython, and NCBI BLAST.

![BioSeq Analyzer](https://img.shields.io/badge/version-1.0.0-00e5a0?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)

## ✨ Features

### Core Analysis
- 🔬 GC/AT content calculation
- 🌡️ Melting temperature (nearest-neighbor method)
- 📊 Base frequency with interactive pie chart
- 🔍 ORF detection across all 6 reading frames
- 🧪 Protein translation of detected ORFs
- ↩️ Reverse complement generation

### Advanced Analysis
- ✂️ Restriction enzyme mapping (12 common enzymes)
- 📈 Nucleotide composition plot (sliding window)
- 🔁 Repeat & microsatellite finder (SSR detection)
- 📉 GC Skew analysis with visualization
- 🧲 Primer design (forward + reverse, Tm validated)
- 📋 Codon usage table grouped by amino acid type

### Integrations
- 💥 NCBI BLAST search (blastn vs nt database)
- 🤖 AI-powered explanation (Groq LLaMA 3)
- 📄 Professional PDF report export
- 🔗 NCBI Accession number lookup
- 📁 FASTA file upload with metadata parsing
- 🧬 Batch sequence analysis (up to 10 sequences)

### UI/UX
- 🌌 Matrix-style animated DNA background
- 💫 Explosive BLAST launch animation
- 📡 3-stage BLAST loading (helix → radar → datastream)
- 🎨 Green & teal bioinformatics theme
- 📱 Responsive design

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | FastAPI, Python 3.11 |
| Biology | Biopython |
| AI | Groq API (LLaMA 3.3 70B) |
| BLAST | NCBI E-utilities |
| PDF | ReportLab |
| Deployment | Vercel + Render |

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API key (free at console.groq.com)

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

Create `.env` file in backend/:
```
GROQ_API_KEY=your_groq_api_key_here
```

Run backend:
```bash
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## 📖 Usage

1. **Paste or upload** a DNA sequence (FASTA or raw)
2. **Or enter** an NCBI accession number to fetch automatically
3. Click **Analyze** for instant results
4. Run **BLAST Search** to identify the sequence
5. Click **Explain with AI** for biological interpretation
6. **Download PDF** report for documentation

## 🧬 Supported Input Formats
- Raw DNA sequence (A, T, G, C, N)
- FASTA format (.fasta, .fa)
- NCBI Accession numbers (e.g. OR780020.1)
- Multi-FASTA files (batch mode)

## 📊 Analysis Output
- Sequence statistics (GC%, Tm, length)
- Base frequency charts
- ORF detection table
- Protein translations
- Restriction enzyme map
- Primer pair suggestions
- BLAST alignment results
- AI biological explanation
- Downloadable PDF report

## 🤝 Contributing
Pull requests welcome. For major changes, open an issue first.

## 📄 License
MIT License

## 👨‍💻 Author
Built by Yogender | M.Sc. Bioinformatics

---
*Powered by Biopython · NCBI BLAST · Groq AI · React · FastAPI*
