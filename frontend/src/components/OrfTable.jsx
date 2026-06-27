export default function OrfTable({ orfs }) {
  if (!orfs || orfs.frames.length === 0) {
    return (
      <div className="bg-[#0d1f1a]/50 rounded-xl border border-[#1a3d2e] p-8 text-center card-glow hover:border-[#00e5a0] transition-all duration-300">
        <p className="text-[#7ab8a0] text-sm">No open reading frames found (&ge;{orfs?.min_length_requirement || 100} bp)</p>
      </div>
    )
  }

  return (
    <div className="bg-[#0d1f1a]/50 rounded-xl border border-[#1a3d2e] overflow-hidden card-glow hover:border-[#00e5a0] transition-all duration-300">
      <div className="px-5 py-4 border-b border-[#1a3d2e]/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#e0fff5] uppercase tracking-wider">
          Open Reading Frames
        </h3>
        <span className="text-xs bg-[#00e5a0]/10 text-[#00e5a0] px-2.5 py-1 rounded-full font-medium border border-[#00e5a0]/20">
          {orfs.count} found
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1a3d2e]/50">
              <th className="text-left px-5 py-3 text-xs font-medium text-[#7ab8a0] uppercase tracking-wider">Frame</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-[#7ab8a0] uppercase tracking-wider">Strand</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-[#7ab8a0] uppercase tracking-wider">Start</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-[#7ab8a0] uppercase tracking-wider">End</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-[#7ab8a0] uppercase tracking-wider">Length (bp)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a3d2e]/30">
            {orfs.frames.map((orf, i) => (
              <tr key={i} className="hover:bg-[#0a0f0a]/40 transition-colors duration-150">
                <td className="px-5 py-3 font-mono text-[#e0fff5]">
                  <span className={`inline-flex items-center gap-1.5 ${
                    orf.strand === 'reverse' ? 'text-[#00b4d8]' : 'text-[#00e5a0]'
                  }`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {orf.strand === 'reverse' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      )}
                    </svg>
                    {orf.reading_frame}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-medium ${
                    orf.strand === 'reverse' ? 'text-[#00b4d8]' : 'text-[#00e5a0]'
                  }`}>
                    {orf.strand}
                  </span>
                </td>
                <td className="px-5 py-3 text-right font-mono text-[#e0fff5]">{orf.start}</td>
                <td className="px-5 py-3 text-right font-mono text-[#e0fff5]">{orf.end}</td>
                <td className="px-5 py-3 text-right font-mono text-[#e0fff5]">{orf.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
