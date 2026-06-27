import { useState } from 'react'

const BASE_COLORS = {
  A: 'text-[#00e5a0]',
  T: 'text-[#00b4d8]',
  G: 'text-[#a78bfa]',
  C: 'text-[#fbbf24]',
}

function colorizeSeq(seq) {
  return seq.split('').map((b, i) => (
    <span key={i} className={BASE_COLORS[b] || 'text-[#7ab8a0]'}>{b}</span>
  ))
}

function PrimerCard({ label, primer }) {
  const [copied, setCopied] = useState(false)
  if (!primer || !primer.sequence) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(primer.sequence).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="bg-[#0a0f0a]/40 rounded-xl border border-[#1a3d2e]/40 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-[#e0fff5]">{label}</h4>
        <button onClick={handleCopy} className="text-xs text-[#7ab8a0] hover:text-[#00e5a0] transition-colors inline-flex items-center gap-1">
          {copied ? (
            <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copied</>
          ) : (
            <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy</>
          )}
        </button>
      </div>

      <div className="bg-[#0d1f1a]/60 rounded-lg px-3 py-2.5 border border-[#1a3d2e]/30">
        <p className="font-mono text-sm tracking-wider break-all select-all">{colorizeSeq(primer.sequence)}</p>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[#7ab8a0]">Length</span>
          <span className="bg-[#0d1f1a] border border-[#1a3d2e]/50 px-2 py-0.5 rounded-full font-mono text-[#e0fff5]">{primer.length} bp</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-[#f59e0b]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>
          <span className="text-[#7ab8a0]">Tm</span>
          <span className="font-mono text-[#e0fff5]">{primer.tm}°C</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#7ab8a0]">GC</span>
          <span className="font-mono text-[#e0fff5]">{primer.gc_content}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[#7ab8a0]">Position</span>
          <span className="font-mono text-[#00b4d8]">{primer.position}</span>
        </div>
      </div>

      <div className="h-1.5 bg-[#0a0f0a]/50 rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-[#00b4d8] to-[#00e5a0] transition-all duration-500" style={{ width: `${primer.gc_content}%` }} />
      </div>
    </div>
  )
}

export default function PrimerDesign({ primers }) {
  if (!primers || !primers.forward || !primers.reverse) return null

  return (
    <div className="bg-[#0d1f1a]/50 backdrop-blur-sm rounded-xl border border-[#1a3d2e] p-5 card-glow opacity-0 animate-[slideUpFade_0.6s_ease-out_forwards] hover:border-[#00e5a0] transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#e0fff5] uppercase tracking-wider">
          Primer Design
        </h3>
        <span className="text-xs text-[#7ab8a0]">Nearest-neighbor Tm</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PrimerCard label="Forward Primer" primer={primers.forward} />
        <PrimerCard label="Reverse Primer" primer={primers.reverse} />
      </div>
    </div>
  )
}
