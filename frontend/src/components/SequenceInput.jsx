import { useState, useRef, useMemo, useCallback } from 'react'
import { fetchByAccession } from '../api/fetchSequenceApi'

function parseFasta(text) {
  const records = []
  let current = null
  for (const line of text.split('\n')) {
    if (line.startsWith('>')) {
      if (current) records.push(current)
      const header = line.slice(1).trim()
      const spaceIdx = header.indexOf(' ')
      current = {
        header: spaceIdx >= 0 ? header.slice(0, spaceIdx) : header,
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

export default function SequenceInput({ onAnalyze, loading }) {
  const [sequence, setSequence] = useState('')
  const [filename, setFilename] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [inputMode, setInputMode] = useState('paste')
  const [accession, setAccession] = useState('')
  const [fetchLoading, setFetchLoading] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  const [fetchedMeta, setFetchedMeta] = useState(null)
  const [fastaRecords, setFastaRecords] = useState([])
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [ripples, setRipples] = useState([])
  const [flashing, setFlashing] = useState(false)
  const fileInputRef = useRef(null)
  const btnRef = useRef(null)

  const handleFileUpload = (file) => {
    if (!file) return
    setFilename(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target.result
      if (file.name.match(/\.(fasta|fa)$/i)) {
        const records = parseFasta(content)
        setFastaRecords(records)
        if (records.length === 1) {
          setSequence(records[0].sequence)
        } else if (records.length > 1) {
          setSelectedIdx(0)
          setSequence(records[0].sequence)
        }
      } else {
        setFastaRecords([])
        setSequence(content.replace(/\s/g, '').toUpperCase())
      }
    }
    reader.readAsText(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  const handleClear = () => {
    setSequence('')
    setFilename(null)
    setAccession('')
    setFetchError(null)
    setFetchedMeta(null)
    setFastaRecords([])
    setSelectedIdx(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const addRipple = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const ts = Date.now()
    const rings = [0, 150, 300].map((delay, i) => ({ id: ts + i, x, y, delay }))
    setRipples((prev) => [...prev, ...rings])
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id >= ts && r.id <= ts + 2 ? false : true)), 900)
    setFlashing(true)
    setTimeout(() => setFlashing(false), 400)
  }, [])

  const handleSubmit = (e) => {
    if (!sequence.trim()) return
    addRipple(e)
    onAnalyze(sequence.trim().toUpperCase(), filename)
  }

  const handleFetchSequence = async () => {
    const acc = accession.trim()
    if (!acc) return
    setFetchLoading(true)
    setFetchError(null)
    setFetchedMeta(null)
    try {
      const data = await fetchByAccession(acc)
      setFetchedMeta(data)
      setSequence(data.sequence)
      setInputMode('paste')
    } catch (err) {
      setFetchError(err.message)
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSelectRecord = (idx) => {
    setSelectedIdx(idx)
    setSequence(fastaRecords[idx].sequence)
  }

  const charCount = sequence.replace(/\s/g, '').length

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-[#0a0f0a]/60 rounded-lg p-0.5 w-fit border border-[#1a3d2e]/50">
        <button
          onClick={() => { setInputMode('paste'); setFetchError(null); setFetchedMeta(null) }}
          className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
            inputMode === 'paste'
              ? 'bg-[#00e5a0]/15 text-[#00e5a0]'
              : 'text-[#7ab8a0]/60 hover:text-[#7ab8a0]'
          }`}
        >
          Paste Sequence
        </button>
        <button
          onClick={() => { setInputMode('accession'); setFetchError(null) }}
          className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
            inputMode === 'accession'
              ? 'bg-[#00e5a0]/15 text-[#00e5a0]'
              : 'text-[#7ab8a0]/60 hover:text-[#7ab8a0]'
          }`}
        >
          Accession Number
        </button>
      </div>

      {inputMode === 'paste' ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative transition-all duration-200 ${
            dragOver ? 'scale-[1.01]' : ''
          }`}
        >
          <textarea
            value={sequence}
            onChange={(e) => {
              setSequence(e.target.value)
              if (!e.target.value) setFilename(null)
            }}
            placeholder="Paste DNA sequence here... (A, T, G, C, N only)"
            className={`input-field min-h-[180px] ${
              dragOver ? 'ring-2 ring-[#00e5a0] border-[#00e5a0]' : ''
            }`}
            spellCheck={false}
          />

          {!sequence && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <svg className="w-10 h-10 mx-auto mb-2 text-[#7ab8a0]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-[#7ab8a0]/30 text-sm">Drag & drop a .fasta / .fa / .txt file here</p>
              </div>
            </div>
          )}
          {loading && (
            <div
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00e5a0] to-transparent pointer-events-none"
              style={{ animation: 'scanDown 1s ease-in-out forwards' }}
            />
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              value={accession}
              onChange={(e) => setAccession(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleFetchSequence() }}
              placeholder="e.g. OR780020.1, NM_007294"
              className="input-field flex-1"
              spellCheck={false}
            />
            <button
              onClick={handleFetchSequence}
              disabled={!accession.trim() || fetchLoading}
              className="btn-primary inline-flex items-center gap-2 shrink-0"
            >
              {fetchLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Fetching...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Fetch Sequence
                </>
              )}
            </button>
          </div>

          {fetchLoading && (
            <div className="flex items-center gap-2 text-xs text-[#7ab8a0]">
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Fetching from NCBI...
            </div>
          )}

          {fetchError && (
            <div className="bg-red-950/30 border border-red-800/30 rounded-xl p-3 flex items-start gap-2">
              <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-red-300">{fetchError}</p>
            </div>
          )}

          {fetchedMeta && (
            <div className="bg-[#0d1f1a]/40 border border-[#1a3d2e]/50 rounded-xl p-3 space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#7ab8a0] font-medium">Accession:</span>
                <span className="text-[#00b4d8] font-mono">{fetchedMeta.accession}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#7ab8a0] font-medium">Title:</span>
                <span className="text-[#e0fff5] truncate">{fetchedMeta.title}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#7ab8a0] font-medium">Organism:</span>
                <span className="text-[#e0fff5]">{fetchedMeta.organism}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#7ab8a0] font-medium">Length:</span>
                <span className="text-[#e0fff5] font-mono">{fetchedMeta.length.toLocaleString()} bp</span>
              </div>
            </div>
          )}
        </div>
      )}

      {fastaRecords.length > 0 && (
        <div className="bg-[#0d1f1a]/40 border border-[#1a3d2e]/50 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-[#e0fff5] uppercase tracking-wider">
              FASTA File: {filename}
            </h4>
            <span className="text-xs text-[#7ab8a0] bg-[#0a0f0a]/50 px-2 py-0.5 rounded-full">
              {fastaRecords.length} sequence{fastaRecords.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className={`space-y-2 ${fastaRecords.length > 3 ? 'max-h-48 overflow-y-auto pr-1' : ''}`}>
            {fastaRecords.map((rec, idx) => (
              <div
                key={idx}
                className="bg-[#0a0f0a]/40 rounded-lg border border-[#1a3d2e]/30 p-3 space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#00b4d8] font-mono text-xs truncate">
                    {rec.header}
                  </span>
                  <span className="text-[#7ab8a0] text-xs font-mono shrink-0">
                    {rec.sequence.length.toLocaleString()} bp
                  </span>
                </div>
                {rec.description && (
                  <p className="text-[#7ab8a0]/60 text-xs truncate">
                    {rec.description}
                  </p>
                )}
              </div>
            ))}
          </div>
          {fastaRecords.length > 1 && (
            <div className="flex items-center gap-2 pt-1">
              <label className="text-xs text-[#7ab8a0] shrink-0">Select sequence:</label>
              <select
                value={selectedIdx}
                onChange={(e) => handleSelectRecord(Number(e.target.value))}
                className="bg-[#0a0f0a]/70 border border-[#1a3d2e]/50 rounded-lg px-3 py-1.5 text-xs text-[#e0fff5] font-mono focus:outline-none focus:ring-1 focus:ring-[#00e5a0]/50 w-full"
              >
                {fastaRecords.map((rec, idx) => (
                  <option key={idx} value={idx}>
                    {rec.header} — {rec.sequence.length.toLocaleString()} bp
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {inputMode === 'paste' && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".fasta,.fa,.txt"
                onChange={(e) => handleFileUpload(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="btn-secondary text-sm cursor-pointer inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload File
              </label>
            </>
          )}

          <button onClick={handleClear} className="btn-secondary text-sm">
            Clear
          </button>
        </div>

        <div className="flex items-center gap-3">
          {charCount > 0 && (
            <span className="text-xs text-[#7ab8a0]/60 font-mono">
              {charCount.toLocaleString()} bp
            </span>
          )}

          <button
            ref={btnRef}
            onClick={handleSubmit}
            disabled={!sequence.trim() || loading}
            className="btn-primary inline-flex items-center gap-2 relative overflow-hidden"
          >
            {flashing && <div className="absolute inset-0 pointer-events-none animate-[analyzeFlash_0.4s_ease-out_forwards]" />}
            {ripples.map((r) => (
              <span
                key={r.id}
                className="absolute pointer-events-none rounded-full border border-white/40"
                style={{
                  left: r.x - 10,
                  top: r.y - 10,
                  width: 20,
                  height: 20,
                  animation: `rippleRing ${r.delay ? (0.8 + r.delay / 1000) : 0.8}s ease-out ${r.delay}ms forwards`,
                  opacity: 0,
                }}
              />
            ))}
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing
                <span className="inline-flex">
                  <span className="animate-[pulseDots_1.4s_ease-in-out_infinite]">.</span>
                  <span className="animate-[pulseDots_1.4s_ease-in-out_infinite_0.2s]">.</span>
                  <span className="animate-[pulseDots_1.4s_ease-in-out_infinite_0.4s]">.</span>
                </span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                Analyze
              </>
            )}
          </button>
        </div>
      </div>

      {filename && fastaRecords.length === 0 && (
        <p className="text-xs text-[#7ab8a0]/60 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {filename}
        </p>
      )}
    </div>
  )
}
