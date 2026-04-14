import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Globe from '../components/Globe'
import Ticker from '../components/Ticker'
import { NODES, NODE_COLORS } from '../data/mockdata'
import { api } from '../api/bharatgraph'
import type { GeoNode } from '../data/mockdata'

// ─── ontology descriptions ───────────────────────────────────────────────────
const ONTOLOGY_DESC: Record<string, string> = {
  country:          'Sovereign state — direct diplomatic/military actor',
  chokepoint:       'Maritime or land corridor — trade & energy bottleneck',
  buffer_state:     'Border nation — strategic depth for India',
  string_of_pearls: 'Chinese port/base investment encircling India',
  dependency:       'Economic vulnerability — leverage point for adversaries',
}

// ─── short blurbs per node ────────────────────────────────────────────────────
const NODE_BLURB: Record<string, string> = {
  Q668:    "India — pivot of all analysis. 100 impact.",
  Q148:    "Primary adversary. BRI architect, LAC pressure.",
  Q843:    "Nuclear-armed neighbor. ISI-backed proxy risk.",
  Q837:    "Northern buffer. BRI MoU signed 2017.",
  Q854:    "Hambantota — 99yr lease to China Merchants.",
  Q902:    "Eastern buffer. Dual allegiance risk.",
  Q836:    "Kyaukpyu port — China's Bay of Bengal anchor.",
  Gwadar:  "CPEC anchor. PLA-N docking confirmed.",
  Malacca: "80% of India's energy imports pass here.",
  BRI:     "Belt & Road — China's strategic debt network.",
  RE:      "India imports 72% rare earths from China.",
  IL:      "Weapons supplier. Shared tech cooperation.",
  RU:      "S-400, oil discount. Neutral-positive.",
  US:      "Quad partner. Tech + defense deepening.",
}

// ─── filter tabs ──────────────────────────────────────────────────────────────
const FILTERS = ['ALL', 'country', 'buffer_state', 'chokepoint', 'string_of_pearls', 'dependency'] as const
type Filter = typeof FILTERS[number]

// ─── NodeRegistryPanel ────────────────────────────────────────────────────────
function NodeRegistryPanel({
  nodes,
  selectedNodeId,
  onSelect,
}: {
  nodes: GeoNode[]
  selectedNodeId: string | null
  onSelect: (id: string | null) => void
}) {
  const [activeFilter, setActiveFilter] = useState<Filter>('ALL')
  const [expandedId, setExpandedId]     = useState<string | null>(null)

  const LIME  = '#c8f025'
  const L45   = 'rgba(200,240,37,0.45)'
  const L12   = 'rgba(200,240,37,0.12)'
  const L06   = 'rgba(200,240,37,0.06)'
  const L03   = 'rgba(200,240,37,0.03)'
  const MUTED = 'rgba(255,255,255,0.2)'
  const WHITE = 'rgba(255,255,255,0.85)'
  const W55   = 'rgba(255,255,255,0.55)'

  const filtered = activeFilter === 'ALL'
    ? nodes
    : nodes.filter(n => n.type === activeFilter)

  // Sort by impact score descending
  const sorted = [...filtered].sort((a, b) => b.impactScore - a.impactScore)

  const handleCardClick = (id: string) => {
    // Toggle expansion; also select the node in globe
    if (expandedId === id) {
      setExpandedId(null)
      onSelect(null)
    } else {
      setExpandedId(id)
      onSelect(id)
    }
  }

  // Impact bar color
  const impactColor = (score: number) =>
    score >= 75 ? '#FF3131' : score >= 50 ? '#FFB800' : LIME

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* filter strip */}
      <div
        className="flex shrink-0 overflow-x-auto gap-0"
        style={{ borderBottom: `1px solid ${L12}` }}
      >
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className="font-mono text-xxs tracking-widest px-2.5 py-2 whitespace-nowrap bg-transparent border-0 cursor-pointer transition-all"
            style={{
              color:           activeFilter === f ? LIME : MUTED,
              borderBottom:    activeFilter === f ? `1px solid ${LIME}` : '1px solid transparent',
              background:      activeFilter === f ? L03 : 'transparent',
            }}
          >
            {f === 'ALL' ? 'ALL' : f.replace(/_/g, ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* node list */}
      <div className="flex-1 overflow-y-auto">

        {/* 2-col grid header */}
        <div
          className="grid px-2 py-1.5"
          style={{
            gridTemplateColumns: '1fr 1fr',
            gap: '1px',
            borderBottom: `1px solid ${L12}`,
          }}
        >
          <span className="font-mono text-xxs" style={{ color: MUTED }}>ENTITY</span>
          <span className="font-mono text-xxs text-right" style={{ color: MUTED }}>IMPACT</span>
        </div>

        {sorted.map(node => {
          const isSelected = selectedNodeId === node.id
          const isExpanded = expandedId === node.id
          const color      = NODE_COLORS[node.type] || LIME
          const score      = node.impactScore

          return (
            <div
              key={node.id}
              style={{
                borderBottom:  `1px solid ${L12}`,
                borderLeft:    isSelected ? `2px solid ${color}` : '2px solid transparent',
                background:    isSelected ? `${color}08` : 'transparent',
                transition:    'all 0.15s ease',
              }}
            >
              {/* main row */}
              <div
                className="grid items-center px-2 py-2.5 cursor-pointer"
                style={{ gridTemplateColumns: '16px 1fr auto' }}
                onClick={() => handleCardClick(node.id)}
                onMouseEnter={e => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.background = L03
                }}
                onMouseLeave={e => {
                  if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                {/* color dot */}
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: color,
                    boxShadow:  isSelected ? `0 0 6px ${color}` : 'none',
                  }}
                />

                {/* name + type */}
                <div className="min-w-0 px-1.5">
                  <div
                    className="font-mono text-xs truncate"
                    style={{ color: isSelected ? WHITE : W55 }}
                  >
                    {node.name}
                  </div>
                  <div
                    className="font-mono text-xxs truncate"
                    style={{ color: MUTED }}
                  >
                    {node.type.replace(/_/g, ' ')}
                  </div>
                </div>

                {/* impact score + mini bar */}
                <div className="flex flex-col items-end gap-1 pl-1">
                  <span
                    className="font-mono text-xxs"
                    style={{ color: impactColor(score) }}
                  >
                    {score}
                  </span>
                  <div
                    className="rounded-sm"
                    style={{
                      width:      36,
                      height:     3,
                      background: L06,
                    }}
                  >
                    <div
                      className="h-full rounded-sm"
                      style={{
                        width:      `${score}%`,
                        background: impactColor(score),
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* expanded detail */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="px-3 pb-3 pt-1"
                      style={{ borderTop: `1px solid ${L12}` }}
                    >
                      {/* blurb */}
                      <p
                        className="font-mono text-xs leading-relaxed mb-2"
                        style={{ color: W55 }}
                      >
                        {NODE_BLURB[node.id] || ONTOLOGY_DESC[node.type]}
                      </p>

                      {/* key-value grid */}
                      <div
                        className="grid font-mono text-xxs"
                        style={{ gridTemplateColumns: '1fr 1fr', rowGap: 4 }}
                      >
                        {[
                          ['QID',    node.wikidataId],
                          ['CONF',   (node.confidence * 100).toFixed(0) + '%'],
                          ['LAT',    node.lat.toFixed(2)],
                          ['LNG',    node.lng.toFixed(2)],
                        ].map(([k, v]) => (
                          <div key={k}>
                            <span style={{ color: MUTED }}>{k} </span>
                            <span style={{ color: LIME }}>{v}</span>
                          </div>
                        ))}
                      </div>

                      {/* ontology badge */}
                      <div className="mt-2">
                        <span
                          className="font-mono text-xxs px-1.5 py-0.5 tracking-wide"
                          style={{
                            color,
                            background: `${color}14`,
                            border: `1px solid ${color}30`,
                          }}
                        >
                          {node.type.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* footer — ontology legend */}
      <div
        className="shrink-0 px-3 py-2 flex flex-wrap gap-x-3 gap-y-1"
        style={{ borderTop: `1px solid ${L12}` }}
      >
        {Object.entries(NODE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
            <span className="font-mono text-xxs" style={{ color: MUTED }}>
              {type.replace(/_/g, ' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const NAV_ITEMS = [
  { label: 'TERMINAL',  path: '/terminal'  },
  { label: 'DASHBOARD', path: '/dashboard' },
  { label: 'ALERTS',    path: '/alerts'    },
  { label: 'QUERIES',   path: '/queries'   },
  { label: 'WHAT-IF',   path: '/whatif'    },
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
  type QueryResult = {
    headline?: string
    assessment?: string
    key_facts?: { claim: string; source: string; confidence: number; impact: string }[]
    graph_gaps?: string | null
    watch_signals?: string[]
    data_sources?: { kb_edges: number; live_edges: number; coverage: string }
    // error fallback
    error?: string
  }
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null)
  const [isQuerying, setIsQuerying]         = useState(false)
  const [activePage]                        = useState('TERMINAL')

  const selectedNode = NODES.find(n => n.id === selectedNodeId)

  const handleQuery = useCallback(async () => {
    if (!queryInput.trim()) return
    setIsQuerying(true)
    try {
      const res = await api.query(queryInput)
      setQueryResult({
        headline:      res.headline,
        assessment:    res.assessment || res.answer,
        key_facts:     res.key_facts,
        graph_gaps:    res.graph_gaps,
        watch_signals: res.watch_signals,
        data_sources:  res.data_sources,
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setQueryResult({ error: `Query failed: ${msg}` })
    }
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
      <div className="flex-1 grid overflow-hidden" style={{ gridTemplateColumns: '280px 1fr 300px' }}>

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
          <div className="flex-1 overflow-y-auto">
            {queryResult ? (
              queryResult.error ? (
                <div className="p-3 font-mono text-xs" style={{ color: '#FF3131' }}>
                  {queryResult.error}
                </div>
              ) : (
                <div className="flex flex-col gap-0">

                  {/* coverage badge */}
                  {queryResult.data_sources && (
                    <div
                      className="px-3 py-1.5 flex items-center gap-2 font-mono text-xxs"
                      style={{ borderBottom: `1px solid ${L12}`, background: L03 }}
                    >
                      <span style={{ color: MUTED }}>GRAPH</span>
                      <span style={{
                        color: queryResult.data_sources.coverage === 'RICH' ? LIME
                             : queryResult.data_sources.coverage === 'PARTIAL' ? '#FFB800'
                             : '#FF3131'
                      }}>
                        ● {queryResult.data_sources.coverage}
                      </span>
                      <span style={{ color: MUTED }}>
                        {queryResult.data_sources.kb_edges}KB + {queryResult.data_sources.live_edges}LIVE
                      </span>
                    </div>
                  )}

                  {/* headline */}
                  {queryResult.headline && (
                    <div
                      className="px-3 py-2.5 font-mono text-xs leading-snug"
                      style={{ borderBottom: `1px solid ${L12}`, color: LIME }}
                    >
                      {queryResult.headline}
                    </div>
                  )}

                  {/* assessment */}
                  {queryResult.assessment && (
                    <div
                      className="px-3 py-3 font-mono text-xs leading-relaxed"
                      style={{ borderBottom: `1px solid ${L12}`, color: WHITE7 }}
                    >
                      {queryResult.assessment}
                    </div>
                  )}

                  {/* key facts */}
                  {queryResult.key_facts && queryResult.key_facts.length > 0 && (
                    <div style={{ borderBottom: `1px solid ${L12}` }}>
                      <div
                        className="px-3 py-1.5 font-mono text-xxs tracking-widest"
                        style={{ color: L45 }}
                      >
                        KEY FACTS
                      </div>
                      {queryResult.key_facts.map((f, i) => (
                        <div
                          key={i}
                          className="px-3 py-2 flex gap-2"
                          style={{ borderTop: `1px solid ${L12}` }}
                        >
                          <div
                            className="shrink-0 w-1 rounded-full mt-1"
                            style={{
                              height: 6, width: 6,
                              background: f.impact === 'HIGH' ? '#FF3131'
                                        : f.impact === 'MEDIUM' ? '#FFB800' : LIME
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-mono text-xs leading-snug" style={{ color: WHITE7 }}>
                              {f.claim}
                            </div>
                            <div className="flex gap-2 mt-0.5">
                              <span className="font-mono text-xxs" style={{ color: MUTED }}>
                                {f.source}
                              </span>
                              <span className="font-mono text-xxs" style={{
                                color: f.confidence >= 0.8 ? LIME
                                     : f.confidence >= 0.6 ? '#FFB800' : '#FF3131'
                              }}>
                                {Math.round(f.confidence * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* watch signals */}
                  {queryResult.watch_signals && queryResult.watch_signals.length > 0 && (
                    <div style={{ borderBottom: `1px solid ${L12}` }}>
                      <div
                        className="px-3 py-1.5 font-mono text-xxs tracking-widest"
                        style={{ color: L45 }}
                      >
                        WATCH SIGNALS
                      </div>
                      {queryResult.watch_signals.map((s, i) => (
                        <div
                          key={i}
                          className="px-3 py-1.5 font-mono text-xs flex gap-2"
                          style={{ borderTop: `1px solid ${L12}`, color: WHITE7 }}
                        >
                          <span style={{ color: '#FFB800' }}>›</span>
                          {s}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* graph gap notice */}
                  {queryResult.graph_gaps && (
                    <div
                      className="px-3 py-2 font-mono text-xxs leading-relaxed"
                      style={{ color: MUTED, background: L03 }}
                    >
                      ⚠ GAP: {queryResult.graph_gaps}
                    </div>
                  )}

                </div>
              )
            ) : (
              <div className="p-3 font-mono text-xs leading-loose" style={{ color: MUTED }}>
                {['india israel defense tech', 'china leverage rare earths', 'string of pearls status', 'quad alliance effectiveness'].map(s => (
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
          {/* teal vignette bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none"
            style={{ height: 80, background: 'linear-gradient(to top, rgba(8,69,86,0.15), transparent)' }}
          />
        </div>

        {/* RIGHT — node registry */}
        <div
          className="flex flex-col overflow-hidden"
          style={{ borderLeft: `1px solid ${L12}`, background: '#071218' }}
        >
          {/* header */}
          <div
            className="flex justify-between items-center px-3 py-2.5 shrink-0"
            style={{ borderBottom: `1px solid ${L12}` }}
          >
            <span className="font-mono text-xxs tracking-widest" style={{ color: L45 }}>
              NODE REGISTRY
            </span>
            <span className="font-mono text-xxs" style={{ color: MUTED }}>
              {NODES.length} ENTITIES
            </span>
          </div>

          {/* filter tabs */}
          <NodeRegistryPanel
            nodes={NODES}
            selectedNodeId={selectedNodeId}
            onSelect={setSelectedNodeId}
          />
        </div>

      </div>
    </div>
  )
}
