export default function GCSkewPlot({ gcSkew }) {
  if (!gcSkew || !gcSkew.windows || gcSkew.windows.length === 0) return null

  const data = gcSkew.windows
  const w = 800
  const h = 250
  const pad = { top: 30, left: 50, bottom: 30, right: 20 }
  const pw = w - pad.left - pad.right
  const ph = h - pad.top - pad.bottom

  const maxPos = Math.max(...data.map((d) => d.position), 1)
  const yMax = 0.3

  const xScale = (pos) => pad.left + (pos / maxPos) * pw
  const yScale = (val) => pad.top + ph / 2 - (val / yMax) * (ph / 2)

  const smoothPath = (pts) => {
    if (pts.length === 0) return ''
    if (pts.length === 1) return `M ${xScale(pts[0].position)} ${yScale(pts[0].gc_skew)}`
    let d = `M ${xScale(pts[0].position)} ${yScale(pts[0].gc_skew)}`
    for (let i = 0; i < pts.length; i++) {
      const p0 = pts[Math.max(i - 1, 0)]
      const p1 = pts[i]
      const p2 = pts[Math.min(i + 1, pts.length - 1)]
      const p3 = pts[Math.min(i + 2, pts.length - 1)]
      const cp1x = xScale(p1.position) + (xScale(p2.position) - xScale(p0.position)) / 6
      const cp1y = yScale(p1.gc_skew) + (yScale(p2.gc_skew) - yScale(p0.gc_skew)) / 6
      const cp2x = xScale(p2.position) - (xScale(p3.position) - xScale(p1.position)) / 6
      const cp2y = yScale(p2.gc_skew) - (yScale(p3.gc_skew) - yScale(p1.gc_skew)) / 6
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${xScale(p2.position)} ${yScale(p2.gc_skew)}`
    }
    return d
  }

  const linePath = smoothPath(data)
  const zeroY = yScale(0)
  const yTicks = [-0.2, -0.1, 0.0, 0.1, 0.2]

  return (
    <div className="bg-[#0d1f1a]/50 backdrop-blur-sm rounded-xl border border-[#1a3d2e] p-5 card-glow opacity-0 animate-[slideUpFade_0.6s_ease-out_forwards] hover:border-[#00e5a0] transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#e0fff5] uppercase tracking-wider">
          GC Skew Analysis
        </h3>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#7ab8a0]">Overall GC Skew:</span>
          <span className={`font-mono font-bold ${gcSkew.overall_gc_skew >= 0 ? 'text-[#00e5a0]' : 'text-[#00b4d8]'}`}>
            {gcSkew.overall_gc_skew >= 0 ? '+' : ''}{gcSkew.overall_gc_skew}
          </span>
        </div>
      </div>

      <div style={{ overflow: 'hidden', width: '100%', position: 'relative' }}>
      <svg viewBox="-60 -20 860 290" preserveAspectRatio="xMidYMid meet" width="100%" height="250" style={{ display: 'block' }}>
        <defs>
          <clipPath id="chartClip">
            <rect x={pad.left} y={pad.top} width={pw} height={ph} />
          </clipPath>
        </defs>

        {yTicks.map((t) => (
          <g key={t}>
            <line x1={pad.left} y1={yScale(t)} x2={w - pad.right} y2={yScale(t)} stroke="#1a3d2e" strokeWidth="0.5" />
            <text x={pad.left - 8} y={yScale(t) + 3} fill="#7ab8a0" fontSize="10" fontFamily="monospace" textAnchor="end" opacity="0.5">
              {t.toFixed(1)}
            </text>
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

        <line x1={pad.left} y1={zeroY} x2={w - pad.right} y2={zeroY} stroke="#7ab8a0" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />

        <g clipPath="url(#chartClip)">
          <path d={`M ${xScale(data[0].position)} ${zeroY} ${linePath} L ${xScale(data[data.length - 1].position)} ${zeroY} Z`} fill="rgba(0,229,160,0.15)" />
        </g>

        <path d={linePath} fill="none" stroke="#00e5a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      </div>
    </div>
  )
}
