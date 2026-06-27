import { useState } from 'react'
import StatCard from './StatCard'
import OrfTable from './OrfTable'
import RestrictionMap from './RestrictionMap'
import CodonUsage from './CodonUsage'
import PrimerDesign from './PrimerDesign'
import GCSkewPlot from './GCSkewPlot'
import OrfTranslator from './OrfTranslator'
import CompositionPlot from './CompositionPlot'
import RepeatFinder from './RepeatFinder'

const BASE_COLORS = {
  A: '#00e5a0',
  T: '#00b4d8',
  G: '#7c3aed',
  C: '#f59e0b',
  N: '#7ab8a0',
}

const BASE_TAILWIND = {
  A: 'text-[#00e5a0]',
  T: 'text-[#00b4d8]',
  G: 'text-[#a78bfa]',
  C: 'text-[#fbbf24]',
  N: 'text-[#7ab8a0]',
}

function BaseFreqBar({ base, count, percent }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-mono font-bold text-[#e0fff5] w-6">{base}</span>
        <span className="text-[#7ab8a0] tabular-nums">
          {count} <span className="text-[#7ab8a0]/50">({percent}%)</span>
        </span>
      </div>
      <div className="h-2.5 bg-[#0a0f0a]/50 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${percent}%`,
            background: BASE_COLORS[base] || '#7ab8a0',
          }}
        />
      </div>
    </div>
  )
}

function BaseFreqPieChart({ bases }) {
  const segments = [
    { label: 'A', percent: bases.A.percent, color: BASE_COLORS.A },
    { label: 'T', percent: bases.T.percent, color: BASE_COLORS.T },
    { label: 'G', percent: bases.G.percent, color: BASE_COLORS.G },
    { label: 'C', percent: bases.C.percent, color: BASE_COLORS.C },
    { label: 'N', percent: bases.N.percent, color: BASE_COLORS.N },
  ]

  const size = 180
  const sw = 28
  const r = (size - sw) / 2
  const circ = 2 * Math.PI * r
  const cx = size / 2
  const cy = size / 2

  let offset = 0

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        overflow="hidden"
        className="transform -rotate-90 opacity-0 animate-[pieIn_0.8s_ease-out_forwards]"
      >
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#0a0f0a" strokeWidth={sw} />
        {segments.map((s) => {
          const len = (s.percent / 100) * circ
          const path = (
            <circle
              key={s.label}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={sw}
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              className="transition-all duration-700"
            />
          )
          offset += len
          return path
        })}
      </svg>
      <div className="flex flex-wrap justify-center gap-3">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: s.color }}
            />
            <span className="text-[#e0fff5] font-mono font-bold">{s.label}</span>
            <span className="text-[#7ab8a0]">{s.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SequenceViewer({ sequence }) {
  const [showAll, setShowAll] = useState(false)
  const [copied, setCopied] = useState(false)
  const colorizedLimit = 2000
  const chunkSize = 60
  const isLong = sequence.length > colorizedLimit

  const displaySeq = isLong && !showAll ? sequence.slice(0, colorizedLimit) : sequence
  const chunks = []
  for (let i = 0; i < displaySeq.length; i += chunkSize) {
    chunks.push(displaySeq.slice(i, i + chunkSize))
  }

  const hasMore = isLong && !showAll
  const handleCopy = () => {
    navigator.clipboard.writeText(sequence).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="bg-[#0d1f1a]/50 backdrop-blur-sm rounded-xl border border-[#1a3d2e] p-5 card-glow opacity-0 animate-[slideUpFade_0.6s_ease-out_forwards] hover:border-[#00e5a0] transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-[#e0fff5] uppercase tracking-wider">
          Sequence Viewer
        </h3>
        <div className="flex items-center gap-2">
          {hasMore && (
            <button
              onClick={() => setShowAll(true)}
              className="text-xs text-[#7ab8a0] hover:text-[#00e5a0] transition-colors underline underline-offset-2"
            >
              Show full sequence ({sequence.length.toLocaleString()} bp)
            </button>
          )}
          <button
            onClick={handleCopy}
            className="text-xs text-[#7ab8a0] hover:text-[#00e5a0] transition-colors inline-flex items-center gap-1"
          >
            {copied ? (
              <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Copied</>
            ) : (
              <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copy Sequence</>
            )}
          </button>
          <span className="text-xs text-[#7ab8a0] bg-[#0a0f0a]/50 px-2 py-0.5 rounded-full font-mono">
            {sequence.length.toLocaleString()} bp
          </span>
        </div>
      </div>
      {hasMore && (
        <p className="text-xs text-[#7ab8a0]/60 mb-2">
          Showing first {colorizedLimit.toLocaleString()} bp colorized
        </p>
      )}
      <div
        className="max-h-[500px] min-h-[250px] overflow-y-auto bg-[#0a0f0a]/50 rounded-lg border border-[#1a3d2e]/30 p-4 font-mono text-[15px] leading-[2]"
        style={{ willChange: 'transform', contain: 'strict' }}
      >
        {chunks.map((chunk, idx) => (
          <div key={idx} className="flex">
            <span className="text-[#7ab8a0] min-w-[70px] shrink-0 select-none text-right mr-4">
              {idx * chunkSize + 1}
            </span>
            <span className="tracking-wide break-all">
              {chunk.split('').map((base, bi) => (
                <span key={bi} className={BASE_TAILWIND[base] || 'text-[#7ab8a0]'}>
                  {base}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ResultsDashboard({ data }) {
  if (!data) return null

  const bf = data.base_frequency

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stat-stagger">
        <StatCard
          label="GC Content"
          value={data.gc_content_percent}
          unit="%"
          description="Guanine + Cytosine percentage"
          delay={0}
        />
        <StatCard
          label="AT Content"
          value={data.at_content_percent}
          unit="%"
          description="Adenine + Thymine percentage"
          delay={0.1}
        />
        <StatCard
          label="Melting Temp"
          value={data.melting_temperature_celsius}
          unit="°C"
          description="Nearest-neighbor approximation"
          delay={0.2}
        />
        <StatCard
          label="Sequence Length"
          value={data.length.toLocaleString()}
          unit="bp"
          description="Total base pairs analyzed"
          delay={0.3}
        />
      </div>

      <SequenceViewer sequence={data.sequence} />
      <CompositionPlot compositionPlot={data.composition_plot} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0d1f1a]/50 backdrop-blur-sm rounded-xl border border-[#1a3d2e] p-5 card-glow opacity-0 animate-[slideUpFade_0.6s_ease-out_forwards] hover:border-[#00e5a0] transition-all duration-300" style={{ animationDelay: '0.4s' }}>
          <h3 className="text-sm font-semibold text-[#e0fff5] uppercase tracking-wider mb-4">
            Base Frequency
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-center">
              <div className="overflow-hidden rounded-full">
              <BaseFreqPieChart bases={bf} />
              </div>
            </div>
            <div className="space-y-3">
              <BaseFreqBar base="A" count={bf.A.count} percent={bf.A.percent} />
              <BaseFreqBar base="T" count={bf.T.count} percent={bf.T.percent} />
              <BaseFreqBar base="G" count={bf.G.count} percent={bf.G.percent} />
              <BaseFreqBar base="C" count={bf.C.count} percent={bf.C.percent} />
              <BaseFreqBar base="N" count={bf.N.count} percent={bf.N.percent} />
            </div>
          </div>
        </div>

        <div className="bg-[#0d1f1a]/50 backdrop-blur-sm rounded-xl border border-[#1a3d2e] p-5 card-glow opacity-0 animate-[slideUpFade_0.6s_ease-out_forwards] hover:border-[#00e5a0] transition-all duration-300" style={{ animationDelay: '0.5s' }}>
          <h3 className="text-sm font-semibold text-[#e0fff5] uppercase tracking-wider mb-4">
            Reverse Complement
          </h3>
          <div className="bg-[#0a0f0a]/50 rounded-lg p-4 border border-[#1a3d2e]/30 max-h-[200px] overflow-y-auto">
            <p className="font-mono text-sm text-[#e0fff5] break-all leading-relaxed select-all">
              {data.reverse_complement}
            </p>
          </div>
          <button
            onClick={() => navigator.clipboard.writeText(data.reverse_complement)}
            className="mt-3 text-xs text-[#7ab8a0] hover:text-[#00e5a0] transition-colors inline-flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy to clipboard
          </button>
        </div>
      </div>

      <div className="opacity-0 animate-[slideUpFade_0.6s_ease-out_forwards]" style={{ animationDelay: '0.6s' }}>
        <OrfTable orfs={data.orfs} />
      </div>

      <OrfTranslator orfTranslations={data.orf_translations} />

      <RestrictionMap restrictionMap={data.restriction_map} sequenceLength={data.length} />
      <CodonUsage codonUsage={data.codon_usage} />
      <PrimerDesign primers={data.primers} />
      <GCSkewPlot gcSkew={data.gc_skew} />
      <RepeatFinder repeats={data.repeats} sequenceLength={data.length} />
    </div>
  )
}
