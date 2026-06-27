import { useState, useMemo } from 'react'

const AA_COLORS = {
  A: '#a78bfa', V: '#a78bfa', L: '#a78bfa', I: '#a78bfa', P: '#a78bfa', F: '#a78bfa', W: '#a78bfa', M: '#a78bfa', G: '#a78bfa',
  S: '#00b4d8', T: '#00b4d8', C: '#00b4d8', Y: '#00b4d8', N: '#00b4d8', Q: '#00b4d8',
  D: '#f59e0b', E: '#f59e0b', K: '#f59e0b', R: '#f59e0b', H: '#f59e0b',
  '*': '#00e5a0',
}

const AA_GROUPS = {
  A: 'Hydrophobic', V: 'Hydrophobic', L: 'Hydrophobic', I: 'Hydrophobic', P: 'Hydrophobic', F: 'Hydrophobic', W: 'Hydrophobic', M: 'Hydrophobic', G: 'Hydrophobic',
  S: 'Polar', T: 'Polar', C: 'Polar', Y: 'Polar', N: 'Polar', Q: 'Polar',
  D: 'Charged', E: 'Charged', K: 'Charged', R: 'Charged', H: 'Charged',
  '*': 'Special',
}

export default function CodonUsage({ codonUsage }) {
  const [sort, setSort] = useState('frequency')
  if (!codonUsage || codonUsage.length === 0) return null

  const sorted = useMemo(() => {
    const s = [...codonUsage]
    if (sort === 'frequency') s.sort((a, b) => b.frequency - a.frequency)
    else if (sort === 'codon') s.sort((a, b) => a.codon.localeCompare(b.codon))
    else if (sort === 'amino_acid') s.sort((a, b) => a.amino_acid.localeCompare(b.amino_acid))
    return s
  }, [codonUsage, sort])

  const maxFreq = sorted.length > 0 ? sorted[0].frequency : 1

  const grouped = useMemo(() => {
    const g = {}
    for (const c of codonUsage) {
      const aa = c.amino_acid
      if (!g[aa]) g[aa] = []
      g[aa].push(c)
    }
    return g
  }, [codonUsage])

  return (
    <div className="bg-[#0d1f1a]/50 backdrop-blur-sm rounded-xl border border-[#1a3d2e] p-5 card-glow opacity-0 animate-[slideUpFade_0.6s_ease-out_forwards] hover:border-[#00e5a0] transition-all duration-300">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-[#e0fff5] uppercase tracking-wider">
          Codon Usage Table
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[#7ab8a0]">Sort:</span>
          {['frequency', 'codon', 'amino_acid'].map((s) => (
            <button key={s} onClick={() => setSort(s)} className={`text-xs px-2 py-0.5 rounded transition-colors ${sort === s ? 'bg-[#00e5a0]/15 text-[#00e5a0]' : 'text-[#7ab8a0]/60 hover:text-[#7ab8a0]'}`}>
              {s === 'frequency' ? 'Frequency' : s === 'codon' ? 'Codon' : 'Amino Acid'}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto space-y-2">
        {Object.entries(grouped).map(([aa, codons]) => (
          <div key={aa} className="bg-[#0a0f0a]/40 rounded-lg border border-[#1a3d2e]/30 p-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold font-mono" style={{ background: AA_COLORS[aa] || '#7ab8a0', color: '#020c07' }}>{aa}</span>
              <span className="text-xs text-[#7ab8a0]">{AA_GROUPS[aa] || 'Unknown'}</span>
              <span className="text-xs text-[#7ab8a0]/50 ml-auto font-mono">{codons.reduce((s, c) => s + c.count, 0)} total</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {codons.sort((a, b) => b.frequency - a.frequency).map((c) => (
                <div key={c.codon} className="bg-[#0d1f1a]/60 rounded-lg px-2.5 py-2 border border-[#1a3d2e]/20">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#e0fff5] tracking-wider">{c.codon}</span>
                    <span className="text-xs text-[#7ab8a0] font-mono ml-1">{c.count}</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-[#0a0f0a]/50 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(c.frequency / maxFreq) * 100}%`, background: AA_COLORS[aa] || '#7ab8a0' }} />
                  </div>
                  <span className="text-[10px] text-[#7ab8a0]/50 font-mono">{(c.frequency * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
