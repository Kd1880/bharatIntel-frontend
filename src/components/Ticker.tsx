import { useState } from 'react'
import { TICKER_ITEMS } from '../data/mockdata'

const SEV_COLOR: Record<string, string> = {
  CRITICAL: '#FF3131',
  WATCH:    '#FFB800',
  INFO:     '#c8f025',
}

export default function Ticker() {
  const [paused, setPaused] = useState(false)
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <div
      className="flex items-center shrink-0 overflow-hidden"
      style={{
        height: 32,
        borderBottom: '1px solid rgba(200,240,37,0.12)',
        background: 'rgba(200,240,37,0.03)',
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* LIVE badge */}
      <div
        className="flex shrink-0 items-center gap-1.5 h-full px-3"
        style={{ borderRight: '1px solid rgba(200,240,37,0.12)' }}
      >
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: '#c8f025', animation: 'pulse-green 2s infinite' }}
        />
        <span
          className="font-mono text-xxs tracking-widest"
          style={{ color: 'rgba(200,240,37,0.45)' }}
        >
          LIVE
        </span>
      </div>

      {/* scrolling track */}
      <div className="flex-1 overflow-hidden">
        <div
          className="flex whitespace-nowrap"
          style={{
            animation: paused ? 'none' : `ticker-scroll ${TICKER_ITEMS.length * 5}s linear infinite`,
          }}
        >
          {items.map((t, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 font-mono text-xs"
              style={{
                padding: '0 20px',
                borderRight: '1px solid rgba(200,240,37,0.08)',
              }}
            >
              <span
                className="w-1 h-1 rounded-full shrink-0"
                style={{ background: SEV_COLOR[t.severity] || '#888' }}
              />
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>{t.text}</span>
              <span style={{ color: 'rgba(255,255,255,0.25)' }}>{(t.conf * 100).toFixed(0)}%</span>
              <span style={{ color: 'rgba(255,255,255,0.15)' }}>· {t.source} · {t.age}</span>
            </span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
