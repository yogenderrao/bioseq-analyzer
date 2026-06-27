import { useState, useEffect, useRef } from 'react'
import SequenceInput from './components/SequenceInput'
import ResultsDashboard from './components/ResultsDashboard'
import AiExplainer from './components/AiExplainer'
import BlastResults from './components/BlastResults'
import BatchAnalysis from './components/BatchAnalysis'
import { analyzeSequence } from './api/analyzeApi'
import { downloadReport } from './api/reportApi'

function MatrixCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const cols = Math.floor(canvas.width / 16)
    const drops = Array(cols).fill(0).map(() => Math.random() * canvas.height / 16)
    const speeds = Array(cols).fill(0).map(() => 1 + Math.random() * 3)
    const chars = 'ATGC'

    const draw = () => {
      ctx.fillStyle = 'rgba(2, 12, 7, 0.06)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.font = '16px monospace'

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)]
        const y = drops[i] * 16
        const heightRatio = y / canvas.height
        const alpha = (1 - heightRatio) * 0.12
        const flicker = Math.random() > 0.97 ? 0.3 : 0
        ctx.fillStyle = `rgba(0, 229, 160, ${Math.min(alpha + flicker, 0.25)})`
        ctx.fillText(char, i * 16, y)
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i] += speeds[i] * 0.4
      }
      animId = requestAnimationFrame(draw)
    }
    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
}

export default function App() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState(null)
  const [blastHits, setBlastHits] = useState(null)
  const [aiExplanation, setAiExplanation] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [batchMode, setBatchMode] = useState('single')

  const handleAnalyze = async (sequence, filename) => {
    setLoading(true)
    setError(null)
    setResults(null)
    setBlastHits(null)
    setAiExplanation(null)
    try {
      const data = await analyzeSequence(sequence, filename)
      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReport = async () => {
    if (!results) return
    setReportLoading(true)
    try {
      await downloadReport({
        sequence: results.sequence, filename: null, analysis: results,
        blast_hits: blastHits, ai_explanation: aiExplanation,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setReportLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#020c07] overflow-hidden">
      <MatrixCanvas />

      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(0,229,160,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <header className="text-center mb-10">
          <div className="relative inline-block mb-5">
            <div
              className="absolute -inset-2 rounded-2xl"
              style={{ animation: 'borderGlow 3s ease-in-out infinite', boxShadow: '0 0 15px rgba(0,229,160,0.15)' }}
            />
            <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00e5a0]/20 to-[#00b4d8]/10 border border-[#00e5a0]/20">
              <svg
                className="w-8 h-8 text-[#00e5a0]"
                style={{ animation: 'logoSpin 20s linear infinite' }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-[#e0fff5] tracking-tight inline-block">
            <span className="inline-block overflow-hidden whitespace-nowrap border-r-2 border-[#00e5a0] animate-[typing_1.8s_steps(16)_forwards] max-w-fit">
              BioSeq Analyzer
            </span>
            <span className="inline-block w-[2px] h-[1em] bg-[#00e5a0] ml-0.5 animate-[blink_0.75s_step-end_infinite]" />
          </h1>

          <p
            className="mt-2 text-[#7ab8a0] text-sm max-w-md mx-auto opacity-0 animate-[fadeInUp_0.5s_ease-out_forwards]"
            style={{ animationDelay: '1.8s' }}
          >
            Comprehensive DNA sequence analysis — GC content, melting temperature, base frequency, ORF detection & more
          </p>
        </header>

        <main className="space-y-6">
          <BatchAnalysis mode={batchMode} setMode={setBatchMode} />

          {batchMode === 'single' && (
            <section className="bg-[#0d1f1a]/40 backdrop-blur-sm rounded-2xl border border-[#1a3d2e]/40 p-6 card-glow">
              <SequenceInput onAnalyze={handleAnalyze} loading={loading} />
            </section>
          )}

          {error && (
            <div className="bg-red-950/30 border border-red-800/30 rounded-xl p-4 flex items-start gap-3 animate-[fadeInUp_0.6s_ease-out_forwards]">
              <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-300">Analysis Failed</p>
                <p className="text-sm text-red-400/80 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {results && (
            <div className="animate-[slideUpFade_0.5s_ease-out_forwards]">
              <ResultsDashboard data={results} />
            </div>
          )}

          {results && (
            <div className="animate-[slideUpFade_0.5s_ease-out_forwards]" style={{ animationDelay: '0.1s' }}>
              <AiExplainer analysisResult={results} onExplanation={setAiExplanation} />
            </div>
          )}

          {results && (
            <div className="animate-[slideUpFade_0.5s_ease-out_forwards]" style={{ animationDelay: '0.2s' }}>
              <BlastResults sequence={results.sequence} onHits={setBlastHits} />
            </div>
          )}

          {results && (
            <div className="text-center animate-[slideUpFade_0.5s_ease-out_forwards]" style={{ animationDelay: '0.3s' }}>
              <button
                onClick={handleDownloadReport}
                disabled={reportLoading}
                className="btn-primary inline-flex items-center gap-2.5 px-6 py-2.5"
              >
                {reportLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF Report
                  </>
                )}
              </button>
            </div>
          )}
        </main>

        <footer className="mt-12 text-center">
          <p className="text-xs text-[#7ab8a0]/40">
            BioSeq Analyzer v1.0.0 &middot; Powered by Biopython &middot; Built with React + FastAPI
          </p>
        </footer>
      </div>
    </div>
  )
}
