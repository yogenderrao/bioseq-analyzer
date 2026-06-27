import { useState, useRef, useEffect } from 'react'
import { explainAnalysis } from '../api/explainApi'

export default function AiExplainer({ analysisResult, onExplanation }) {
  const [loading, setLoading] = useState(false)
  const [explanation, setExplanation] = useState(null)
  const [error, setError] = useState(null)
  const [typedLen, setTypedLen] = useState(0)
  const [typing, setTyping] = useState(false)
  const typingRef = useRef(null)

  useEffect(() => {
    return () => {
      if (typingRef.current) clearInterval(typingRef.current)
    }
  }, [])

  const handleExplain = async () => {
    setLoading(true)
    setError(null)
    setExplanation(null)

    try {
      const data = await explainAnalysis(analysisResult)
      setExplanation(data.explanation)
      if (onExplanation) onExplanation(data.explanation)
      setTypedLen(0)
      setTyping(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!typing || !explanation) return
    typingRef.current = setInterval(() => {
      setTypedLen((prev) => {
        if (prev >= explanation.length) {
          clearInterval(typingRef.current)
          typingRef.current = null
          setTyping(false)
          return prev
        }
        return prev + 1
      })
    }, 20)
    return () => {
      if (typingRef.current) clearInterval(typingRef.current)
    }
  }, [typing, explanation])

  return (
    <div className="space-y-4">
      {!explanation && !loading && (
        <div className="text-center">
          <button
            onClick={handleExplain}
            disabled={loading}
            className="btn-primary inline-flex items-center gap-2.5 px-8 py-3 text-base"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Explain with AI
          </button>
          <p className="text-xs text-[#7ab8a0]/50 mt-2">
            Get an expert-level analysis of your DNA sequence
          </p>
        </div>
      )}

      {loading && (
        <div className="bg-[#0d1f1a]/60 backdrop-blur-sm rounded-xl border border-[#1a3d2e]/70 p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-[#00e5a0]/30 border-t-[#00e5a0] animate-spin">
            <svg className="w-5 h-5 text-[#00e5a0]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <p className="text-[#e0fff5] font-medium">Analyzing with Gemini...</p>
            <p className="text-[#7ab8a0] text-sm mt-1">Interpreting your DNA sequence results</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-950/30 border border-red-800/30 rounded-xl p-4 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-red-300">AI Explanation Failed</p>
            <p className="text-sm text-red-400/80 mt-0.5">{error}</p>
            <button
              onClick={handleExplain}
              className="text-xs text-red-300 hover:text-red-200 underline mt-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {explanation && (
        <div
          className="bg-[#0d1f1a]/60 backdrop-blur-sm rounded-xl p-6 border border-[#1a3d2e]/70 transition-all duration-300"
          style={{
            boxShadow: '0 0 20px rgba(0, 229, 160, 0.15)',
            borderColor: 'rgba(0, 229, 160, 0.25)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00e5a0]/20 to-[#00b4d8]/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-[#00e5a0]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h3
                  className="text-sm font-semibold text-[#e0fff5]"
                  style={typing ? { animation: 'headerGlow 1.5s ease-in-out infinite' } : {}}
                >
                  AI Analysis
                </h3>
                <p className="text-xs text-[#7ab8a0]">Powered by Gemini</p>
              </div>
            </div>
            <button
              onClick={() => { setExplanation(null); setTyping(false) }}
              className="text-[#7ab8a0]/50 hover:text-[#7ab8a0] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="prose prose-sm max-w-none">
            {explanation.slice(0, typedLen || explanation.length).split('\n').map((line, i) => (
              line.trim() ? (
                <p key={i} className="text-[#e0fff5]/90 text-sm leading-relaxed mb-2 last:mb-0">
                  {line}
                </p>
              ) : null
            ))}
            {typing && (
              <span
                className="inline-block w-[2px] h-[1em] bg-[#00e5a0] ml-0.5 align-middle"
                style={{ animation: 'cursorBlink 0.75s step-end infinite' }}
              />
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#1a3d2e]/50 flex items-center justify-between">
            <button
              onClick={() => navigator.clipboard.writeText(explanation)}
              className="text-xs text-[#7ab8a0] hover:text-[#00e5a0] transition-colors inline-flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>
            <button
              onClick={handleExplain}
              disabled={loading}
              className="text-xs text-[#7ab8a0] hover:text-[#00e5a0] transition-colors inline-flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
