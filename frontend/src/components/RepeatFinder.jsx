import { useState } from 'react'

const REPEAT_COLORS = {
  tandem: '#00e5a0',
  microsatellite: '#00b4d8',
}

export default function RepeatFinder({ repeats, sequenceLength }) {
  const [tab, setTab] = useState('tandem')

  if (!repeats) return null

  const { tandem_repeats, microsatellites } = repeats
  const current = tab === 'tandem' ? tandem_repeats : microsatellites
  const barW = Math.min(sequenceLength, 800)
  const pxPerBp = barW / Math.max(sequenceLength, 1)

  if (tandem_repeats.length === 0 && microsatellites.length === 0) {
    return (
      <div className="bg-[#0d1f1a]/50 backdrop-blur-sm rounded-xl border border-[#1a3d2e] p-5 card-glow opacity-0 animate-[slideUpFade_0.6s_ease-out_forwards] hover:border-[#00e5a0] transition-all duration-300">
        <h3 className="text-sm font-semibold text-[#e0fff5] uppercase tracking-wider">Repeat &amp; Microsatellite Finder</h3>
        <p className="text-sm text-[#7ab8a0] mt-3">No repeats found</p>
      </div>
    )
  }

  return (
    <div className="bg-[#0d1f1a]/50 backdrop-blur-sm rounded-xl border border-[#1a3d2e] p-5 card-glow opacity-0 animate-[slideUpFade_0.6s_ease-out_forwards] hover:border-[#00e5a0] transition-all duration-300">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-sm font-semibold text-[#e0fff5] uppercase tracking-wider">Repeat &amp; Microsatellite Finder</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-[#0a0f0a]/50 text-[#00e5a0] px-2 py-0.5 rounded-full font-mono">{tandem_repeats.length} tandem</span>
          <span className="text-xs bg-[#0a0f0a]/50 text-[#00b4d8] px-2 py-0.5 rounded-full font-mono">{microsatellites.length} microsatellite</span>
        </div>
      </div>

      <div className="flex gap-1 bg-[#0a0f0a]/60 rounded-lg p-0.5 w-fit mb-4 border border-[#1a3d2e]/50">
        {['tandem', 'microsatellite'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${tab === t ? 'bg-[#00e5a0]/15 text-[#00e5a0]' : 'text-[#7ab8a0]/60 hover:text-[#7ab8a0]'}`}>
            {t === 'tandem' ? 'Tandem Repeats' : 'Microsatellites (SSR)'}
          </button>
        ))}
      </div>

      {current.length > 0 && (
        <svg width="100%" height="50" viewBox={`0 0 ${barW + 40} 50`} className="overflow-visible mb-4">
          <rect x="20" y="19" width={barW} height="12" rx="6" fill="#0a0f0a" stroke="#1a3d2e" strokeWidth="0.5" />
          {current.map((r, i) => (
            <rect
              key={i}
              x={20 + r.start * pxPerBp}
              y="19"
              width={Math.max((r.end - r.start) * pxPerBp, 2)}
              height="12"
              rx="2"
              fill={REPEAT_COLORS[tab] || '#00e5a0'}
              opacity="0.6"
            />
          ))}
          <line x1="20" y1="40" x2={20 + barW} y2="40" stroke="#7ab8a0" strokeWidth="0.5" opacity="0.3" />
          {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
            <text key={frac} x={20 + frac * barW} y="48" fill="#7ab8a0" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.5">
              {Math.round(frac * sequenceLength).toLocaleString()}
            </text>
          ))}
        </svg>
      )}

      {current.length === 0 ? (
        <p className="text-sm text-[#7ab8a0]">No {tab === 'tandem' ? 'tandem repeats' : 'microsatellites'} found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a3d2e]/50">
                <th className="text-left px-3 py-2 text-xs font-medium text-[#7ab8a0] uppercase tracking-wider">Repeat Unit</th>
                <th className="text-right px-3 py-2 text-xs font-medium text-[#7ab8a0] uppercase tracking-wider">Count</th>
                <th className="text-right px-3 py-2 text-xs font-medium text-[#7ab8a0] uppercase tracking-wider">Start</th>
                <th className="text-right px-3 py-2 text-xs font-medium text-[#7ab8a0] uppercase tracking-wider">End</th>
                <th className="text-right px-3 py-2 text-xs font-medium text-[#7ab8a0] uppercase tracking-wider">Length</th>
                <th className="text-left px-3 py-2 text-xs font-medium text-[#7ab8a0] uppercase tracking-wider">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a3d2e]/30">
              {current.map((r, i) => (
                <tr key={i} className="hover:bg-[#0a0f0a]/40 transition-colors duration-150">
                  <td className="px-3 py-2 font-mono text-xs text-[#e0fff5]">{r.repeat_unit}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs text-[#e0fff5]">{r.repeat_count}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs text-[#7ab8a0]">{r.start.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs text-[#7ab8a0]">{r.end.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-mono text-xs text-[#e0fff5]">{r.length.toLocaleString()}</td>
                  <td className="px-3 py-2 font-mono text-xs" style={{ color: REPEAT_COLORS[r.type] || '#7ab8a0' }}>{r.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
