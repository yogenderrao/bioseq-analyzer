import { useState, useRef } from 'react'

function parseFasta(text) {
  const records = []
  let current = null
  for (const line of text.split('\n')) {
    if (line.startsWith('>')) {
      if (current) records.push(current)
      const header = line.slice(1).trim()
      const spaceIdx = header.indexOf(' ')
      current = {
        id: spaceIdx >= 0 ? header.slice(0, spaceIdx) : header,
        description: spaceIdx >= 0 ? header.slice(spaceIdx + 1).trim() : '',
        sequence: '',
      }
    } else if (current) {
      current.sequence += line.trim()
    }
  }
  if (current) records.push(current)
  return records.map((r) => ({ ...r, sequence: r.sequence.toUpperCase() }))
}

export default function BatchAnalysis({ mode, setMode, onBatchResults }) {
  const [batchText, setBatchText] = useState('')
  const [parsed, setParsed] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [results, setResults] = useState(null)
  const fileInputRef = useRef(null)

  const handleParse = () => {
    const records = parseFasta(batchText)
    if (records.length === 0) return
    if (records.length > 10) {
      alert('Maximum 10 sequences allowed per batch')
      return
    }
    setParsed(records)
    setResults(null)
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const content = ev.target.result
      setBatchText(content)
      const records = parseFasta(content)
      if (records.length > 10) {
        alert('Maximum 10 sequences allowed per batch')
        return
      }
      setParsed(records)
      setResults(null)
    }
    reader.readAsText(file)
  }

  const handleAnalyzeAll = async () => {
    if (parsed.length === 0) return
    setLoading(true)
    setCurrentIdx(0)

    const seqs = parsed.map((r, i) => ({
      id: r.id || `seq_${i + 1}`,
      sequence: r.sequence,
      filename: `${r.id}.fasta`,
    }))

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/analyze-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sequences: seqs }),
      })
      if (!res.ok) throw new Error('Batch analysis failed')
      const data = await res.json()
      setResults(data)
      if (onBatchResults) onBatchResults(data)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setBatchText('')
    setParsed([])
    setResults(null)
  }

  const handleDownloadCsv = () => {
    if (!results) return
    const rows = [['ID', 'Status', 'Length', 'GC%', 'AT%', 'Tm', 'ORFs']]
    for (const r of results) {
      if (r.status === 'success') {
        rows.push([
          r.id, r.status, r.result.length, r.result.gc_content_percent,
          r.result.at_content_percent, r.result.melting_temperature_celsius,
          r.result.orfs.count,
        ].join(','))
      } else {
        rows.push([r.id, r.status, '', '', '', '', ''].join(','))
      }
    }
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'batch_analysis.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-[#0d1f1a]/40 backdrop-blur-sm rounded-2xl border border-[#1a3d2e]/40 p-6 card-glow space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-[#0a0f0a]/60 rounded-lg p-0.5 border border-[#1a3d2e]/50">
          <button onClick={() => { setMode('single'); setParsed([]); setResults(null) }}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${mode === 'single' ? 'bg-[#00e5a0]/15 text-[#00e5a0]' : 'text-[#7ab8a0]/60 hover:text-[#7ab8a0]'}`}>
            Single Sequence
          </button>
          <button onClick={() => setMode('batch')}
            className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${mode === 'batch' ? 'bg-[#00e5a0]/15 text-[#00e5a0]' : 'text-[#7ab8a0]/60 hover:text-[#7ab8a0]'}`}>
            Batch Analysis
          </button>
        </div>
      </div>

      {mode === 'batch' && (
        <div className="space-y-4">
          <textarea
            value={batchText}
            onChange={(e) => setBatchText(e.target.value)}
            placeholder="Paste multiple FASTA sequences here...&#10;&#10;>&#62;seq1&#10;ATGGATTTATCTGCTTCTTCG&#10;>&#62;seq2&#10;GCGAGTCAGTCGATCGTAGCT&#10;..."
            className="input-field min-h-[150px] font-mono text-xs"
            spellCheck={false}
          />

          <div className="flex items-center gap-3 flex-wrap">
            <input ref={fileInputRef} type="file" accept=".fasta,.fa" onChange={handleFile} className="hidden" id="batch-file" />
            <label htmlFor="batch-file" className="btn-secondary text-xs cursor-pointer inline-flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              Upload FASTA
            </label>
            <button onClick={handleParse} className="btn-secondary text-xs" disabled={!batchText.trim()}>Parse Sequences</button>
            <button onClick={handleClear} className="btn-secondary text-xs">Clear</button>
            {parsed.length > 0 && (
              <span className="text-xs text-[#7ab8a0] font-mono">{parsed.length} / 10 sequences</span>
            )}
          </div>

          {parsed.length > 0 && (
            <div className="bg-[#0a0f0a]/40 rounded-xl border border-[#1a3d2e]/30 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1a3d2e]/50">
                      <th className="text-left px-3 py-2 text-xs font-medium text-[#7ab8a0] uppercase tracking-wider">ID</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-[#7ab8a0] uppercase tracking-wider">Description</th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-[#7ab8a0] uppercase tracking-wider">Length</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-[#7ab8a0] uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a3d2e]/30">
                    {parsed.map((r, i) => (
                      <tr key={i} className="hover:bg-[#0a0f0a]/40 transition-colors">
                        <td className="px-3 py-2 font-mono text-xs text-[#00b4d8]">{r.id}</td>
                        <td className="px-3 py-2 text-xs text-[#7ab8a0]/60 truncate max-w-[200px]">{r.description}</td>
                        <td className="px-3 py-2 text-right font-mono text-xs text-[#e0fff5]">{r.sequence.length.toLocaleString()}</td>
                        <td className="px-3 py-2 text-xs text-[#7ab8a0]">{loading && currentIdx === i ? 'Analyzing...' : 'Ready'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-3 py-2 border-t border-[#1a3d2e]/30 flex items-center justify-between">
                <button onClick={handleAnalyzeAll} disabled={loading} className="btn-primary text-xs inline-flex items-center gap-1.5 px-4 py-2">
                  {loading ? (
                    <><svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Analyzing {currentIdx + 1}/{parsed.length}...</>
                  ) : (
                    'Analyze All'
                  )}
                </button>
              </div>
            </div>
          )}

          {results && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#7ab8a0] font-mono">{results.filter((r) => r.status === 'success').length}/{results.length} succeeded</span>
                <button onClick={handleDownloadCsv} className="text-xs text-[#7ab8a0] hover:text-[#00e5a0] transition-colors inline-flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Download CSV Report
                </button>
              </div>
              {results.map((r, i) => (
                <BatchResultCard key={r.id} result={r} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BatchResultCard({ result }) {
  const [open, setOpen] = useState(false)
  if (result.status === 'error') {
    return (
      <div className="bg-red-950/20 border border-red-800/30 rounded-xl p-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-red-300">{result.id}</span>
          <span className="text-red-400/80">{result.error}</span>
        </div>
      </div>
    )
  }

  const d = result.result
  return (
    <div className="bg-[#0a0f0a]/40 rounded-xl border border-[#1a3d2e]/30 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#0d1f1a]/40 transition-colors text-left">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-[#00b4d8]">{result.id}</span>
          <span className="text-xs text-[#7ab8a0]">{d.length.toLocaleString()} bp</span>
          <span className="text-xs text-[#00e5a0]">{d.gc_content_percent}% GC</span>
          <span className="text-xs text-[#7ab8a0]">{d.melting_temperature_celsius}°C</span>
        </div>
        <svg className={`w-4 h-4 text-[#7ab8a0] transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <div className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-[#0d1f1a]/60 rounded-lg p-2.5 border border-[#1a3d2e]/20">
            <span className="text-[#7ab8a0]">GC Content</span>
            <p className="font-mono text-[#e0fff5] mt-0.5">{d.gc_content_percent}%</p>
          </div>
          <div className="bg-[#0d1f1a]/60 rounded-lg p-2.5 border border-[#1a3d2e]/20">
            <span className="text-[#7ab8a0]">AT Content</span>
            <p className="font-mono text-[#e0fff5] mt-0.5">{d.at_content_percent}%</p>
          </div>
          <div className="bg-[#0d1f1a]/60 rounded-lg p-2.5 border border-[#1a3d2e]/20">
            <span className="text-[#7ab8a0]">Melting Temp</span>
            <p className="font-mono text-[#e0fff5] mt-0.5">{d.melting_temperature_celsius}°C</p>
          </div>
          <div className="bg-[#0d1f1a]/60 rounded-lg p-2.5 border border-[#1a3d2e]/20">
            <span className="text-[#7ab8a0]">ORFs</span>
            <p className="font-mono text-[#e0fff5] mt-0.5">{d.orfs.count}</p>
          </div>
        </div>
      )}
    </div>
  )
}
