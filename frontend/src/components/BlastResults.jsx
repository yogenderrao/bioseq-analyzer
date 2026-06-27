import { useState, useRef, useEffect } from 'react'
import { runBlast } from '../api/blastApi'

const PARTICLE_COLORS = ['#00e5a0', '#00b4d8', '#a78bfa', '#fbbf24']

function triggerExplosion(x, y) {
  const body = document.body

  const flash = document.createElement('div')
  flash.style.cssText = `position:fixed;inset:0;z-index:9998;pointer-events:none;background:radial-gradient(circle at ${x}px ${y}px,rgba(0,229,160,0.95) 0%,rgba(0,180,216,0.8) 30%,transparent 70%);animation:blastFlash 0.15s ease-out forwards;`
  body.appendChild(flash)

  for (let i = 0; i < 3; i++) {
    const ring = document.createElement('div')
    ring.style.cssText = `position:fixed;left:${x - 20}px;top:${y - 20}px;width:40px;height:40px;border:3px solid #00e5a0;border-radius:50%;pointer-events:none;z-index:9998;opacity:0.8;animation:shockwaveRing 0.6s ease-out ${i * 0.15}s forwards;`
    body.appendChild(ring)
    setTimeout(() => ring.remove(), 1500)
  }

  for (let i = 0; i < 24; i++) {
    const angle = (Math.PI * 2 * i) / 24 + (Math.random() - 0.5) * 0.5
    const dist = 100 + Math.random() * 200
    const size = 6 + Math.random() * 6
    const color = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)]
    const p = document.createElement('div')
    p.style.cssText = `position:fixed;left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px;border-radius:50%;background:${color};pointer-events:none;z-index:9998;--dx:${Math.cos(angle) * dist};--dy:${Math.sin(angle) * dist};animation:particleBurst 0.8s ease-out forwards;`
    body.appendChild(p)
    setTimeout(() => p.remove(), 1500)
  }

  const orig = body.style.transform
  body.style.transition = 'none'
  const steps = [
    { x: -3, y: 2 }, { x: 3, y: -3 }, { x: -2, y: 1 },
    { x: 2, y: -2 }, { x: -1, y: 1 }, { x: 1, y: -1 }, { x: 0, y: 0 },
  ]
  const interval = 400 / steps.length
  steps.forEach((s, i) => {
    setTimeout(() => { body.style.transform = `translate(${s.x}px,${s.y}px)` }, i * interval)
  })
  setTimeout(() => { body.style.transform = orig; body.style.transition = '' }, 400)

  setTimeout(() => flash.remove(), 300)
}

function DnaHelix() {
  return (
    <svg width="180" height="220" viewBox="0 0 200 280" className="overflow-visible shrink-0">
      <defs>
        <linearGradient id="ls" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00e5a0" />
          <stop offset="100%" stopColor="#00b4d8" />
        </linearGradient>
        <linearGradient id="rs" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00b4d8" />
          <stop offset="100%" stopColor="#00e5a0" />
        </linearGradient>
      </defs>
      <g style={{ animation: 'dnaStrandScroll 3s linear infinite' }}>
        {[0, 40, 80, 120, 160, 200, 240].map((off) => (
          <g key={off} transform={`translate(0, ${off})`}>
            <path d="M20,20 Q60,0 100,20 Q140,40 180,20" fill="none" stroke="url(#ls)" strokeWidth="2.5" opacity={0.8} />
            <path d="M20,20 Q60,40 100,20 Q140,0 180,20" fill="none" stroke="url(#rs)" strokeWidth="2.5" opacity={0.8} />
            <line x1="60" y1="10" x2="60" y2="30" stroke={off % 80 === 0 ? '#00e5a0' : '#00b4d8'} strokeWidth="1.5" opacity="0.5" />
            <line x1="140" y1="10" x2="140" y2="30" stroke={off % 80 === 0 ? '#00b4d8' : '#00e5a0'} strokeWidth="1.5" opacity="0.5" />
            <circle cx="20" cy="20" r="3" fill="#00e5a0" />
            <circle cx="180" cy="20" r="3" fill="#00b4d8" />
          </g>
        ))}
      </g>
    </svg>
  )
}

function Radar({ elapsed }) {
  const [pings, setPings] = useState([])
  const pingId = useRef(null)

  useEffect(() => {
    pingId.current = setInterval(() => {
      if (Math.random() > 0.4) {
        const angle = Math.random() * 360
        const dist = 40 + Math.random() * 100
        setPings((prev) => [...prev, { id: Date.now(), angle, dist }].slice(-8))
      }
    }, 1200)
    return () => clearInterval(pingId.current)
  }, [])

  return (
    <div className="relative w-[260px] h-[260px] flex items-center justify-center shrink-0">
      <svg width="260" height="260" viewBox="0 0 300 300" className="absolute inset-0">
        {[40, 80, 120, 140].map((r, i) => (
          <circle key={i} cx="150" cy="150" r={r} fill="none" stroke="#00e5a0" strokeWidth="0.5" opacity={0.15 + i * 0.05} />
        ))}
      </svg>
      <div
        className="absolute w-[240px] h-[240px] rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0deg, rgba(0,229,160,0.12) 1deg, transparent 5deg)',
          animation: 'radarSweep 3s linear infinite',
        }}
      />
      <div className="absolute w-[2px] h-[120px] bg-[#00e5a0]/20 top-[10px] left-1/2 -translate-x-1/2 origin-bottom" style={{ animation: 'radarSweep 3s linear infinite' }}>
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#00e5a0] rounded-full shadow-[0_0_8px_rgba(0,229,160,0.8)]" />
      </div>
      <div className="absolute w-[1px] h-[240px] bg-[#00e5a0]/10" />
      <div className="absolute h-[1px] w-[240px] bg-[#00e5a0]/10" />
      <div className="absolute w-[10px] h-[10px] border border-[#00e5a0]/30 rounded-full" />
      <div className="absolute w-1 h-1 bg-[#00e5a0] rounded-full shadow-[0_0_8px_rgba(0,229,160,0.8)]" />
      {pings.map((p) => {
        const rad = (p.angle * Math.PI) / 180
        const x = 150 + p.dist * Math.cos(rad)
        const y = 150 + p.dist * Math.sin(rad)
        return (
          <div
            key={p.id}
            className="absolute w-2 h-2 rounded-full bg-[#00e5a0]"
            style={{
              left: (x / 300) * 260 - 4, top: (y / 300) * 260 - 4,
              animation: 'radarPing 1.2s ease-out forwards',
              boxShadow: '0 0 6px rgba(0,229,160,0.6)',
            }}
          />
        )
      })}
    </div>
  )
}

function DataStream() {
  const pairs = [
    ['ATGGATTTATCTGCTTCTTCGCTGTTT', 'ATGGATTTATCTGCTTCTTCGCTGTTT'],
    ['GCGAGTCAGTCGATCGTAGCTAGCTG', 'GCGAGTCAGTCGATCGT---TAGCTG'],
    ['AACTGATCGATCGTAGCTAGCTGATC', 'AACTGATCGATCGTAGCTAGCTGATC'],
    ['GGCTAGCTAGCTAGCTAGCTAGCTA', 'GGCTAGCTAGCTAGCTAGCTAGCTA'],
    ['CGTAGCTGATCGTAGCTAGCTAGAT', 'CGTAGCTGATCGTAGCTAGC---AT'],
  ]
  const stats = [
    'Score: 426 bits | E-value: 1.57e-102',
    'Identity: 100% | Coverage: 98%',
    'Score: 312 bits | E-value: 3.42e-78',
    'Identity: 95% | Coverage: 87%',
    'Score: 245 bits | E-value: 1.08e-54',
  ]
  const lines = []
  for (let i = 0; i < 15; i++) {
    const p = pairs[i % pairs.length]
    const s = stats[i % stats.length]
    lines.push(`Query: ${p[0]}`, `Sbjct: ${p[1]}`, s, '')
  }
  const content = [...lines, ...lines].join('\n')

  return (
    <div className="relative w-full h-[240px] overflow-hidden rounded-xl border border-[#1a3d2e]/50 bg-[#020c07]/80 shrink-0">
      <pre
        className="text-[#00e5a0]/60 text-xs leading-[18px] font-mono p-4"
        style={{ animation: 'dataStreamUp 4s linear infinite' }}
      >
        {content}
      </pre>
      <div className="absolute inset-0 bg-gradient-to-b from-[#020c07] via-transparent to-[#020c07] pointer-events-none" />
    </div>
  )
}

export default function BlastResults({ sequence, onHits }) {
  const [loading, setLoading] = useState(false)
  const [hits, setHits] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [scanCount, setScanCount] = useState(0)
  const timerRef = useRef(null)
  const scanTimer = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (scanTimer.current) clearInterval(scanTimer.current)
    }
  }, [])

  const handleBlast = async (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    triggerExplosion(cx, cy)

    await new Promise((r) => setTimeout(r, 400))

    setLoading(true)
    setError(null)
    setHits(null)
    setMessage('')
    setElapsed(0)
    setScanCount(0)

    timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000)
    scanTimer.current = setInterval(() => setScanCount((p) => p + Math.floor(Math.random() * 10) + 5), 300)

    try {
      const data = await runBlast(sequence)
      setHits(data.hits)
      setMessage(data.message)
      setLoading(false)
      if (onHits) onHits(data.hits)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    } finally {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
      if (scanTimer.current) { clearInterval(scanTimer.current); scanTimer.current = null }
    }
  }

  const stage = elapsed < 10 ? 0 : elapsed < 40 ? 1 : 2
  const progress = Math.min((elapsed / 60) * 100, 100)
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="space-y-4">
      {/* LOADING CARD */}
      {loading && (
        <div className="bg-[#0d1f1a]/50 backdrop-blur-sm rounded-xl border border-[#1a3d2e] overflow-hidden card-glow opacity-0 animate-[slideUpFade_0.4s_ease-out_forwards] hover:border-[#00e5a0] transition-all duration-300">
          <div className="px-5 py-3 border-b border-[#1a3d2e]/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00b4d8]/20 to-[#00e5a0]/10 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-[#00b4d8]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-[#e0fff5]">BLAST Search</span>
            </div>
            <span className="text-xs text-[#7ab8a0] font-mono">{fmt(elapsed)}</span>
          </div>

          <div className="p-8 flex flex-col items-center justify-center min-h-[320px]">
            {stage === 0 && (
              <div className="flex flex-col items-center gap-5">
                <DnaHelix />
                <div className="text-center">
                  <p className="text-base font-semibold text-[#e0fff5]">Submitting to NCBI BLAST...</p>
                  <p className="text-sm text-[#7ab8a0] mt-1">
                    Connecting to NCBI servers
                    <span className="inline-flex ml-1">
                      <span className="animate-[pulseDots_1.4s_ease-in-out_infinite]">.</span>
                      <span className="animate-[pulseDots_1.4s_ease-in-out_infinite_0.2s]">.</span>
                      <span className="animate-[pulseDots_1.4s_ease-in-out_infinite_0.4s]">.</span>
                    </span>
                  </p>
                </div>
              </div>
            )}

            {stage === 1 && (
              <div className="flex flex-col items-center gap-5">
                <Radar elapsed={elapsed} />
                <div className="text-center">
                  <p className="text-base font-semibold text-[#e0fff5]">Scanning nucleotide database...</p>
                  <p className="text-sm text-[#7ab8a0] mt-1">
                    Sequences scanned: <span className="text-[#00e5a0] font-mono">{scanCount.toLocaleString()}</span>
                  </p>
                </div>
              </div>
            )}

            {stage === 2 && (
              <div className="flex flex-col items-center gap-5 w-full max-w-md">
                <DataStream />
                <div className="text-center">
                  <p className="text-base font-semibold text-[#e0fff5]">Parsing alignment data...</p>
                  <p className="text-sm text-[#7ab8a0] mt-1">
                    Progress: <span className="text-[#00e5a0] font-mono">{Math.min(elapsed - 40, 99)}%</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="h-1.5 bg-[#0a0f0a]/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00e5a0] to-[#00b4d8] transition-all duration-700 ease-out"
              style={{ width: `${progress > 95 ? 95 : progress}%` }}
            />
          </div>
        </div>
      )}

      {/* IDLE STATE */}
      {!hits && !loading && (
        <div className="bg-[#0d1f1a]/40 backdrop-blur-sm rounded-xl border border-[#1a3d2e] p-6 hover:border-[#00e5a0] transition-all duration-300">
          <div className="text-center space-y-3">
            <button onClick={handleBlast} className="btn-primary inline-flex items-center gap-2.5 px-8 py-3 text-base">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Run BLAST Search
            </button>
            <div className="flex items-center justify-center gap-2 text-xs text-[#7ab8a0]/60">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>This may take 30–60 seconds</span>
            </div>
          </div>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="bg-red-950/30 border border-red-800/30 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-red-300">BLAST Search Failed</p>
            <p className="text-sm text-red-400/80 mt-0.5">{error}</p>
            <button onClick={handleBlast} className="text-xs text-red-300 hover:text-red-200 underline mt-2">Try again</button>
          </div>
        </div>
      )}

      {/* RESULTS */}
      {hits && (
        <div className="bg-[#0d1f1a]/50 backdrop-blur-sm rounded-xl border border-[#1a3d2e] overflow-hidden card-glow hover:border-[#00e5a0] transition-all duration-300">
          <div className="px-5 py-4 border-b border-[#1a3d2e]/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00b4d8]/20 to-[#00e5a0]/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#00b4d8]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#e0fff5]">BLAST Results</h3>
                <p className="text-xs text-[#7ab8a0]">{message}</p>
              </div>
            </div>
            <button onClick={handleBlast} className="text-xs text-[#7ab8a0] hover:text-[#00b4d8] transition-colors inline-flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Search again
            </button>
          </div>

          {hits.length === 0 ? (
            <div className="p-8 text-center"><p className="text-[#7ab8a0] text-sm">No significant hits found in the nucleotide database</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#1a3d2e]/50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#7ab8a0] uppercase tracking-wider w-12">#</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#7ab8a0] uppercase tracking-wider">Description</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#7ab8a0] uppercase tracking-wider">Accession</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-[#7ab8a0] uppercase tracking-wider">E-value</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-[#7ab8a0] uppercase tracking-wider">Score</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-[#7ab8a0] uppercase tracking-wider">Identity</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-[#7ab8a0] uppercase tracking-wider">Coverage</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-[#7ab8a0] uppercase tracking-wider">Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a3d2e]/30">
                  {hits.map((hit, i) => (
                    <tr key={i} className="hover:bg-[#0a0f0a]/40 transition-colors duration-150">
                      <td className="px-4 py-3 text-[#7ab8a0] text-xs font-mono">{i + 1}</td>
                      <td className="px-4 py-3 text-[#e0fff5] font-mono text-xs max-w-[280px] truncate" title={hit.title}>{hit.title}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[#00b4d8]">{hit.accession}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-[#7ab8a0]">{hit.e_value.toExponential(2)}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-[#e0fff5]">{hit.score.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-[#e0fff5]">{hit.identity}%</td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-[#e0fff5]">{hit.query_coverage}%</td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-[#7ab8a0]">{hit.length.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
