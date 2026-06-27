import { useState, useEffect, useRef } from 'react'

export default function StatCard({ label, value, unit, description, delay = 0 }) {
  const [display, setDisplay] = useState(0)
  const [visible, setVisible] = useState(false)
  const started = useRef(false)
  const cardRef = useRef(null)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el) } },
      { threshold: 0.2, rootMargin: '50px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || started.current) return
    started.current = true

    const raw = parseFloat(String(value).replace(/,/g, ''))
    if (isNaN(raw)) {
      setDisplay(value)
      return
    }

    const decimals = unit === '%' ? 2 : unit === '°C' ? 1 : 0
    const duration = 1500
    const startTime = performance.now()

    const tick = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = eased * raw

      if (decimals > 0) {
        setDisplay(current.toFixed(decimals))
      } else {
        setDisplay(Math.round(current).toLocaleString())
      }

      if (progress < 1) {
        requestAnimationFrame(tick)
      } else {
        setDisplay(decimals > 0 ? raw.toFixed(decimals) : raw.toLocaleString())
      }
    }

    requestAnimationFrame(tick)
  }, [value, visible, unit])

  return (
    <div
      ref={cardRef}
      className="relative bg-[#0d1f1a]/80 backdrop-blur-sm rounded-xl border border-[#1a3d2e] p-6 overflow-hidden group card-glow opacity-0 animate-[slideUpFade_0.6s_ease-out_forwards] hover:border-[#00e5a0] transition-all duration-300"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#00e5a0] to-[#00b4d8] transform origin-left transition-transform duration-300" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-medium text-[#7ab8a0] uppercase tracking-wider">
            {label}
          </p>
          <svg className="w-4 h-4 text-[#00e5a0]/40 group-hover:text-[#00e5a0]/70 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold text-[#e0fff5] tabular-nums">
            {display}
          </span>
          {unit && (
            <span className="text-sm font-medium text-[#7ab8a0]">
              {unit}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-[#7ab8a0]/50 mt-2 leading-tight">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
