import { useState } from 'react'

const ENZYME_COLORS = [
  '#00e5a0', '#00b4d8', '#a78bfa', '#fbbf24',
  '#f472b6', '#34d399', '#60a5fa', '#f97316',
  '#a3e635', '#2dd4bf', '#e879f9', '#38bdf8',
]

export default function RestrictionMap({ restrictionMap, sequenceLength }) {
  const [showAll, setShowAll] = useState(false)
  if (!restrictionMap || restrictionMap.length === 0) return null

  const display = showAll ? restrictionMap : restrictionMap.filter((e) => e.count > 0)
  const hasNoCut = restrictionMap.some((e) => e.count === 0)

  const barW = Math.min(sequenceLength, 800)
  const pxPerBp = barW / Math.max(sequenceLength, 1)

  return (
    <div className="bg-[#0d1f1a]/50 backdrop-blur-sm rounded-xl border border-[#1a3d2e] p-5 card-glow opacity-0 animate-[slideUpFade_0.6s_ease-out_forwards] hover:border-[#00e5a0] transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#e0fff5] uppercase tracking-wider">
          Restriction Enzyme Map
        </h3>
        <span className="text-xs text-[#7ab8a0] bg-[#0a0f0a]/50 px-2 py-0.5 rounded-full font-mono">
          {restrictionMap.filter((e) => e.count > 0).length} cutters
        </span>
      </div>

      <svg width="100%" height="80" viewBox={`0 0 ${barW + 40} 80`} className="overflow-visible mb-4">
        <rect x="20" y="34" width={barW} height="12" rx="6" fill="#0a0f0a" stroke="#1a3d2e" strokeWidth="0.5" />
        {display.map((enz, ei) =>
          enz.positions.map((pos, pi) => (
            <line
              key={`${ei}-${pi}`}
              x1={20 + pos * pxPerBp}
              y1="28"
              x2={20 + pos * pxPerBp}
              y2="52"
              stroke={ENZYME_COLORS[ei % ENZYME_COLORS.length]}
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))
        )}
        <line x1="20" y1="62" x2={20 + barW} y2="62" stroke="#7ab8a0" strokeWidth="0.5" opacity="0.3" />
        {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
          <text
            key={frac}
            x={20 + frac * barW}
            y="74"
            fill="#7ab8a0"
            fontSize="10"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.5"
          >
            {Math.round(frac * sequenceLength).toLocaleString()}
          </text>
        ))}
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-4">
        {restrictionMap.map((enz, i) => (
          <div key={enz.enzyme} className="flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: ENZYME_COLORS[i % ENZYME_COLORS.length], opacity: enz.count > 0 ? 1 : 0.3 }} />
            <span className="text-[#e0fff5]" style={{ opacity: enz.count > 0 ? 1 : 0.4 }}>
              {enz.enzyme}
            </span>
            <span className="text-[#7ab8a0]" style={{ opacity: enz.count > 0 ? 1 : 0.4 }}>
              ({enz.count > 0 ? `${enz.count} cut${enz.count > 1 ? 's' : ''}` : 'No cut'})
            </span>
          </div>
        ))}
      </div>

      {hasNoCut && (
        <button onClick={() => setShowAll((p) => !p)} className="text-xs text-[#7ab8a0] hover:text-[#00e5a0] transition-colors mb-3 underline underline-offset-2">
          {showAll ? 'Hide enzymes with no cut' : `Show all ${restrictionMap.length} enzymes`}
        </button>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1a3d2e]/50">
              <th className="text-left px-3 py-2 text-xs font-medium text-[#7ab8a0] uppercase tracking-wider">Enzyme</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-[#7ab8a0] uppercase tracking-wider">Site</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-[#7ab8a0] uppercase tracking-wider">Positions</th>
              <th className="text-right px-3 py-2 text-xs font-medium text-[#7ab8a0] uppercase tracking-wider">Count</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a3d2e]/30">
            {display.map((enz, i) => (
              <tr key={enz.enzyme} className="hover:bg-[#0a0f0a]/40 transition-colors duration-150">
                <td className="px-3 py-2 text-[#e0fff5] font-mono text-xs">{enz.enzyme}</td>
                <td className="px-3 py-2 font-mono text-xs text-[#00b4d8]">{enz.recognition_site}</td>
                <td className="px-3 py-2 font-mono text-xs text-[#7ab8a0]">
                  {enz.positions.length > 8
                    ? `${enz.positions.slice(0, 8).join(', ')}, ... (${enz.positions.length} total)`
                    : enz.positions.join(', ')}
                </td>
                <td className="px-3 py-2 text-right font-mono text-xs text-[#e0fff5]">{enz.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
