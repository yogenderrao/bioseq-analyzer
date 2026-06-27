import { useState } from 'react'

export default function CompositionPlot({ compositionPlot }) {
  const [tooltip, setTooltip] = useState(null)

  if (!compositionPlot || compositionPlot.length === 0) return null

  const data = compositionPlot
  const w = 800
  const h = 250
  const pad = { top: 20, right: 20, bottom: 30, left: 40 }
  const pw = w - pad.left - pad.right
  const ph = h - pad.top - pad.bottom

  const maxPos = Math.max(...data.map((d) => d.position), 1)

  const xScale = (pos) => pad.left + (pos / maxPos) * pw
  const yScale = (val) => pad.top + ph - (val / 100) * ph

  const makePath = (key) => {
    if (data.length === 0) return ''
    let d = `M ${xScale(data[0].position)} ${yScale(data[0][key])}`
    for (let i = 1; i < data.length; i++) {
      const xc = (xScale(data[i - 1].position) + xScale(data[i].position)) / 2
      d += ` Q ${xc} ${yScale(data[i - 1][key])}, ${xScale(data[i].position)} ${yScale(data[i][key])}`
    }
    return d
  }

  const gcPath = makePath('gc_percent')
  const atPath = makePath('at_percent')

  const makeFillPath = (key) => {
    if (data.length === 0) return ''
    const last = data[data.length - 1]
    return `${makePath(key)} L ${xScale(last.position)} ${yScale(0)} L ${xScale(data[0].position)} ${yScale(0)} Z`
  }

  return (
    <div className="bg-[#0d1f1a]/50 backdrop-blur-sm rounded-xl border border-[#1a3d2e] p-5 card-glow opacity-0 animate-[slideUpFade_0.6s_ease-out_forwards] hover:border-[#00e5a0] transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#e0fff5] uppercase tracking-wider">Nucleotide Composition Plot</h3>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00e5a0]" />
            <span className="text-[#7ab8a0]">GC%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00b4d8]" />
            <span className="text-[#7ab8a0]">AT%</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible"
          onMouseLeave={() => setTooltip(null)}
        >
          <defs>
            <linearGradient id="gcFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00e5a0" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#00e5a0" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="atFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00b4d8" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#00b4d8" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {[0, 25, 50, 75, 100].map((v) => (
            <g key={v}>
              <line x1={pad.left} y1={yScale(v)} x2={w - pad.right} y2={yScale(v)} stroke="#1a3d2e" strokeWidth="0.5" />
              <text x={pad.left - 6} y={yScale(v) + 3} fill="#7ab8a0" fontSize="10" fontFamily="monospace" textAnchor="end" opacity="0.5">{v}%</text>
            </g>
          ))}
          {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
            const pos = Math.round(frac * maxPos)
            return (
              <text key={frac} x={xScale(pos)} y={h - 6} fill="#7ab8a0" fontSize="10" fontFamily="monospace" textAnchor="middle" opacity="0.5">
                {pos.toLocaleString()}
              </text>
            )
          })}

          <line x1={pad.left} y1={yScale(50)} x2={w - pad.right} y2={yScale(50)} stroke="#7ab8a0" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" />

          <path d={makeFillPath('gc_percent')} fill="url(#gcFill)" />
          <path d={makeFillPath('at_percent')} fill="url(#atFill)" />
          <path d={gcPath} fill="none" stroke="#00e5a0" strokeWidth="1.5" strokeLinecap="round" />
          <path d={atPath} fill="none" stroke="#00b4d8" strokeWidth="1.5" strokeLinecap="round" />

          {data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 40)) === 0).map((d) => (
            <g key={d.position}>
              <circle cx={xScale(d.position)} cy={yScale(d.gc_percent)} r="2" fill="#00e5a0" opacity="0.4"
                onMouseEnter={(e) => setTooltip({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, data: d })}
              />
              <circle cx={xScale(d.position)} cy={yScale(d.at_percent)} r="2" fill="#00b4d8" opacity="0.4" />
            </g>
          ))}
        </svg>

        {tooltip && (
          <div
            className="absolute bg-[#0a0f0a]/95 border border-[#1a3d2e] rounded-lg px-3 py-2 text-xs pointer-events-none z-10 shadow-xl"
            style={{ left: Math.min(tooltip.x + 10, 400), top: Math.max(tooltip.y - 60, 0) }}
          >
            <p className="text-[#7ab8a0] font-mono">Position: {tooltip.data.position.toLocaleString()}</p>
            <p className="text-[#00e5a0] font-mono">GC: {tooltip.data.gc_percent}%</p>
            <p className="text-[#00b4d8] font-mono">AT: {tooltip.data.at_percent}%</p>
          </div>
        )}
      </div>
    </div>
  )
}
