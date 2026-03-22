import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Globe from '../components/Globe'
import Ticker from '../components/Ticker'
import { NODES, ALERTS, QUERIES, NODE_COLORS } from '../data/mockdata'

const NAV_ITEMS = [
  { label: 'TERMINAL', path: '/terminal' },
  { label: 'ALERTS',   path: '/alerts'   },
  { label: 'QUERIES',  path: '/queries'  },
]

// palette shorthands
const LIME   = '#c8f025'
const L45    = 'rgba(200,240,37,0.45)'
const L12    = 'rgba(200,240,37,0.12)'
const L35    = 'rgba(200,240,37,0.35)'
const L06    = 'rgba(200,240,37,0.06)'
const L03    = 'rgba(200,240,37,0.03)'
const MUTED  = 'rgba(255,255,255,0.2)'
const WHITE  = 'rgba(255,255,255,0.85)'
const WHITE7 = 'rgba(255,255,255,0.7)'

export default function Terminal() {
  const nav = useNavigate()
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [queryInput, setQueryInput]         = useState('')
  const [queryResult, setQueryResult]       = useState<string | null>(null)
  const [isQuerying, setIsQuerying]         = useState(false)
  const [activePage]                        = useState('TERMINAL')

  const selectedNode = NODES.find(n => n.id === selectedNodeId)

  const handleQuery = useCallback(async () => {
    if (!queryInput.trim()) return
    setIsQuerying(true)
    await new Promise(r => setTimeout(r, 1200))
    const mock = QUERIES.find(q =>
      q.question.toLowerCase().includes(queryInput.toLowerCase().split(' ')[0])
    )
    setQueryResult(mock?.answer || 'No matching intelligence found. Try: "China leverage", "treaty overlap", or "media tone".')
    setIsQuerying(false)
  }, [queryInput])

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#030a0d' }}>

      {/* ── navbar ── */}
      <div
        className="flex shrink-0 items-center gap-6 px-4"
        style={{ height: 48, borderBottom: `1px solid ${L12}`, background: 'rgba(3,10,13,0.9)' }}
      >
        <span className="font-mono text-sm font-medium tracking-widest" style={{ color: LIME }}>
          BHARATINTEL
        </span>
        <div className="w-px h-4" style={{ background: L12 }} />
        {NAV_ITEMS.map(item => (
          <button
            key={item.label}
            onClick={() => nav(item.path)}
            className="font-mono text-xxs tracking-widest pb-0.5 bg-transparent border-0 cursor-pointer transition-colors duration-150"
            style={{
              color:        activePage === item.label ? LIME : MUTED,
              borderBottom: activePage === item.label ? `1px solid ${LIME}` : '1px solid transparent',
            }}
            onMouseEnter={e => { if (activePage !== item.label) (e.currentTarget as HTMLElement).style.color = L45 }}
            onMouseLeave={e => { if (activePage !== item.label) (e.currentTarget as HTMLElement).style.color = MUTED }}
          >
            {item.label}
          </button>
        ))}
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 font-mono text-xxs" style={{ color: L45 }}>
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: LIME, animation: 'pulse-green 2s infinite' }}
          />
          LIVE · {NODES.length} NODES · {new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
        </div>
      </div>

      <Ticker />

      {/* ── 3-panel ── */}
      <div className="flex-1 grid overflow-hidden" style={{ gridTemplateColumns: '300px 1fr 280px' }}>

        {/* LEFT — query terminal */}
        <div
          className="flex flex-col overflow-hidden"
          style={{ borderRight: `1px solid ${L12}`, background: '#071218' }}
        >
          <div
            className="px-3 py-2.5 font-mono text-xxs tracking-widest"
            style={{ borderBottom: `1px solid ${L12}`, color: L45 }}
          >
            INTELLIGENCE QUERY
          </div>

          <div className="p-3" style={{ borderBottom: `1px solid ${L12}` }}>
            <textarea
              value={queryInput}
              onChange={e => setQueryInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleQuery() } }}
              placeholder={'> Ask anything...\n  e.g. "What leverage does China have?"'}
              className="w-full font-mono text-xs p-2 resize-none outline-none"
              style={{
                height: 88,
                background: L03,
                border: `1px solid ${L12}`,
                color: LIME,
              }}
            />
            <button
              onClick={handleQuery}
              className="mt-2 w-full font-mono text-xxs tracking-widest py-2 cursor-pointer transition-all duration-150"
              style={{
                background: isQuerying ? L06 : 'transparent',
                border: `1px solid ${L35}`,
                color: LIME,
              }}
              onMouseEnter={e => { if (!isQuerying) (e.currentTarget as HTMLElement).style.background = L06 }}
              onMouseLeave={e => { if (!isQuerying) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              {isQuerying ? '[ QUERYING... ]' : '[ EXECUTE QUERY ]'}
            </button>
          </div>

          {/* result / suggestions */}
          <div className="flex-1 p-3 overflow-y-auto">
            {queryResult ? (
              <div>
                <div
                  className="font-mono text-xxs tracking-widest mb-2"
                  style={{ color: L45 }}
                >
                  RESPONSE
                </div>
                <div className="font-mono text-xs leading-relaxed" style={{ color: WHITE7 }}>
                  {queryResult}
                </div>
              </div>
            ) : (
              <div className="font-mono text-xs leading-loose" style={{ color: MUTED }}>
                {['china leverage rare earths', 'treaty overlap neighbors', 'media tone balakot 2019', 'string of pearls status'].map(s => (
                  <div
                    key={s}
                    className="py-1 cursor-pointer transition-colors"
                    onClick={() => setQueryInput(s)}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = L45}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = MUTED}
                  >
                    › {s}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* node detail panel */}
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-3 overflow-hidden"
                style={{ borderTop: `1px solid ${L12}` }}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: NODE_COLORS[selectedNode.type] || LIME }}
                    />
                    <span className="font-mono text-sm" style={{ color: WHITE }}>
                      {selectedNode.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedNodeId(null)}
                    className="font-mono text-xs bg-transparent border-0 cursor-pointer transition-colors"
                    style={{ color: MUTED }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = WHITE}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = MUTED}
                  >✕</button>
                </div>
                <div className="font-mono text-xs tracking-wide leading-loose" style={{ color: L45 }}>
                  {[
                    ['QID',    selectedNode.wikidataId],
                    ['TYPE',   selectedNode.type.replace(/_/g, ' ')],
                    ['IMPACT', selectedNode.impactScore + ' / 100'],
                    ['CONF',   (selectedNode.confidence * 100).toFixed(0) + '%'],
                    ['LAT',    selectedNode.lat.toFixed(2)],
                    ['LNG',    selectedNode.lng.toFixed(2)],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span style={{ color: MUTED }}>{k}</span>
                      <span style={{ color: LIME }}>{v}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CENTRE — globe */}
        <div className="relative" style={{ background: '#020e14' }}>
          <Globe
            onNodeClick={setSelectedNodeId}
            highlightNodeIds={selectedNodeId ? [selectedNodeId] : []}
          />
          <div
            className="absolute top-3 left-3 font-mono text-xxs tracking-widest pointer-events-none"
            style={{ color: 'rgba(200,240,37,0.35)' }}
          >
            INDIA STRATEGIC NEIGHBORHOOD
          </div>
          <div
            className="absolute top-3 right-3 font-mono text-xxs pointer-events-none"
            style={{ color: 'rgba(200,240,37,0.25)' }}
          >
            DRAG TO ROTATE
          </div>
          {/* ontology legend */}
          <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 pointer-events-none">
            {Object.entries(NODE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                <span
                  className="font-mono text-xxs tracking-wide"
                  style={{ color: 'rgba(255,255,255,0.22)' }}
                >
                  {type.replace(/_/g, ' ')}
                </span>
              </div>
            ))}
          </div>
          {/* teal vignette bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{ height: 80, background: 'linear-gradient(to top, rgba(8,69,86,0.15), transparent)' }}
          />
        </div>

        {/* RIGHT — alerts feed */}
        <div
          className="flex flex-col overflow-hidden"
          style={{ borderLeft: `1px solid ${L12}`, background: '#071218' }}
        >
          <div
            className="flex justify-between items-center px-3 py-2.5"
            style={{ borderBottom: `1px solid ${L12}` }}
          >
            <span className="font-mono text-xxs tracking-widest" style={{ color: L45 }}>
              PATTERN ALERTS
            </span>
            <button
              onClick={() => nav('/alerts')}
              className="font-mono text-xxs px-2 py-0.5 bg-transparent cursor-pointer transition-colors"
              style={{ color: MUTED, border: `1px solid ${L12}` }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = L45}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = MUTED}
            >
              ALL →
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {ALERTS.slice(0, 5).map(alert => {
              const sevColor =
                alert.severity === 'CRITICAL' ? '#FF3131' :
                alert.severity === 'HIGH' || alert.severity === 'WATCH' ? '#FFB800' :
                LIME
              return (
                <div
                  key={alert.id}
                  onClick={() => nav('/alerts')}
                  className="px-3 py-3 cursor-pointer transition-colors"
                  style={{
                    borderBottom: `1px solid ${L12}`,
                    borderLeft: `2px solid ${sevColor}`,
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = L03}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span
                      className="font-mono text-xxs px-1.5 py-0.5 tracking-wide"
                      style={{
                        color: sevColor,
                        background:
                          alert.severity === 'CRITICAL' ? 'rgba(255,49,49,0.12)' :
                          alert.severity === 'WATCH'    ? 'rgba(255,184,0,0.12)' :
                          L06,
                      }}
                    >
                      {alert.severity}
                    </span>
                    <span className="font-mono text-xxs" style={{ color: MUTED }}>
                      {alert.timestamp}
                    </span>
                  </div>
                  <div className="font-mono text-xs mb-1 leading-snug" style={{ color: WHITE7 }}>
                    {alert.title}
                  </div>
                  <div className="font-mono text-xxs" style={{ color: L45 }}>
                    {alert.subtitle}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
