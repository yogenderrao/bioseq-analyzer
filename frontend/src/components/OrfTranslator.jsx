import { useState } from 'react'

const BASE_COLORS = {
  A: 'text-[#00e5a0]', T: 'text-[#00b4d8]', G: 'text-[#a78bfa]', C: 'text-[#fbbf24]',
}

const AA_STYLE = {
  A: '#a78bfa', I: '#a78bfa', L: '#a78bfa', M: '#a78bfa', F: '#a78bfa', W: '#a78bfa', V: '#a78bfa',
  S: '#00b4d8', T: '#00b4d8', N: '#00b4d8', Q: '#00b4d8',
  D: '#f59e0b', E: '#f59e0b', K: '#f59e0b', R: '#f59e0b',
  C: '#00e5a0', G: '#00e5a0', P: '#00e5a0',
  '*': '#ef4444',
}

const AA_GROUP = {
  A: 'Hydrophobic', I: 'Hydrophobic', L: 'Hydrophobic', M: 'Hydrophobic', F: 'Hydrophobic', W: 'Hydrophobic', V: 'Hydrophobic',
  S: 'Polar', T: 'Polar', N: 'Polar', Q: 'Polar',
  D: 'Charged', E: 'Charged', K: 'Charged', R: 'Charged',
  C: 'Special', G: 'Special', P: 'Special',
  '*': 'Stop',
}

function colorizeDna(seq, maxLen = 60) {
  const display = seq.length > maxLen ? seq.slice(0, maxLen) : seq
  return (
    <span className="break-all">
      {display.split('').map((b, i) => (
        <span key={i} className={BASE_COLORS[b] || 'text-[#7ab8a0]'}>{b}</span>
      ))}
    </span>
  )
}

function colorizeProtein(seq) {
  return seq.split('').map((aa, i) => (
    <span key={i} style={{ color: AA_STYLE[aa] || '#7ab8a0' }} className="font-bold tracking-wider">{aa}</span>
  ))
}

export default function OrfTranslator({ orfTranslations }) {
  const [expanded, setExpanded] = useState(null)
  const [use3letter, setUse3letter] = useState(false)
  const [copied, setCopied] = useState(null)

  if (!orfTranslations || orfTranslations.length === 0) {
    return (
      <div className="bg-[#0d1f1a]/50 backdrop-blur-sm rounded-xl border border-[#1a3d2e] p-5 card-glow opacity-0 animate-[slideUpFade_0.6s_ease-out_forwards] hover:border-[#00e5a0] transition-all duration-300">
        <h3 className="text-sm font-semibold text-[#e0fff5] uppercase tracking-wider">ORF Protein Translations</h3>
        <p className="text-sm text-[#7ab8a0] mt-3">No ORFs detected</p>
      </div>
    )
  }

  const handleCopy = (seq, idx) => {
    navigator.clipboard.writeText(seq).then(() => {
      setCopied(idx)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  return (
    <div className="bg-[#0d1f1a]/50 backdrop-blur-sm rounded-xl border border-[#1a3d2e] p-5 card-glow opacity-0 animate-[slideUpFade_0.6s_ease-out_forwards] hover:border-[#00e5a0] transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#e0fff5] uppercase tracking-wider">ORF Protein Translations</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#7ab8a0]">Show:</span>
          <button onClick={() => setUse3letter(false)} className={`text-xs px-2 py-0.5 rounded transition-colors ${!use3letter ? 'bg-[#00e5a0]/15 text-[#00e5a0]' : 'text-[#7ab8a0]/60 hover:text-[#7ab8a0]'}`}>1-letter</button>
          <button onClick={() => setUse3letter(true)} className={`text-xs px-2 py-0.5 rounded transition-colors ${use3letter ? 'bg-[#00e5a0]/15 text-[#00e5a0]' : 'text-[#7ab8a0]/60 hover:text-[#7ab8a0]'}`}>3-letter</button>
        </div>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {orfTranslations.map((orf, idx) => {
          const isOpen = expanded === idx
          const key = `${orf.frame}-${orf.strand}-${orf.start}`
          return (
            <div key={key} className="bg-[#0a0f0a]/40 rounded-xl border border-[#1a3d2e]/30 overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : idx)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#0d1f1a]/40 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#00b4d8] bg-[#0d1f1a]/60 px-2 py-0.5 rounded">Frame {orf.frame}</span>
                  <span className="text-xs text-[#7ab8a0]">{orf.strand}</span>
                  <span className="text-xs text-[#7ab8a0]">{orf.start}–{orf.end}</span>
                  <span className="text-xs font-mono text-[#e0fff5] bg-[#0d1f1a]/60 px-2 py-0.5 rounded-full">{orf.protein_length} aa</span>
                </div>
                <svg className={`w-4 h-4 text-[#7ab8a0] transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-3">
                  <div className="bg-[#0d1f1a]/60 rounded-lg p-3 border border-[#1a3d2e]/20">
                    <p className="text-xs text-[#7ab8a0] mb-1.5">DNA Sequence</p>
                    <p className="font-mono text-xs">{colorizeDna(orf.dna_sequence)}</p>
                    {orf.dna_sequence.length > 60 && (
                      <p className="text-xs text-[#7ab8a0]/50 mt-1">{orf.dna_sequence.length.toLocaleString()} bp total</p>
                    )}
                  </div>

                  <div className="bg-[#0d1f1a]/60 rounded-lg p-3 border border-[#1a3d2e]/20">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs text-[#7ab8a0]">Protein Sequence</p>
                      <button
                        onClick={() => handleCopy(use3letter ? orf.protein_3letter : orf.protein_1letter, idx)}
                        className="text-xs text-[#7ab8a0] hover:text-[#00e5a0] transition-colors inline-flex items-center gap-1"
                      >
                        {copied === idx ? (
                          <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copied</>
                        ) : (
                          <><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy</>
                        )}
                      </button>
                    </div>
                    <p className="font-mono text-xs leading-relaxed break-all select-all">
                      {use3letter ? (
                        <span className="text-[#e0fff5]">{orf.protein_3letter}</span>
                      ) : (
                        colorizeProtein(orf.protein_1letter)
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
