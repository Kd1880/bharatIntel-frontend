import { useRef, useEffect, useState } from 'react'
import GlobeComponent from 'react-globe.gl'
import { NODES, EDGES, NODE_COLORS } from '../data/mockdata'

interface GlobeProps {
  highlightNodeIds?: string[]
  onNodeClick?: (nodeId: string) => void
  liveEventNode?: string | null
}

export default function Globe({ highlightNodeIds = [], onNodeClick }: GlobeProps) {
  const globeEl  = useRef<any>(null)
  const wrapRef  = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 800, h: 600 })
  const [countries, setCountries] = useState<any[]>([])

  // fetch country polygons
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
      .then(r => r.json())
      .then(geo => setCountries(geo.features))
      .catch(() => {
        fetch('https://cdn.jsdelivr.net/npm/geojson-world-map@1.0.0/index.json')
          .then(r => r.json())
          .then(geo => setCountries(geo.features || geo))
      })
  }, [])

  // resize observer
  useEffect(() => {
    if (!wrapRef.current) return
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setSize({ w: width, h: height })
    })
    ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [])

  // camera + controls after mount
  useEffect(() => {
    if (!globeEl.current) return
    globeEl.current.pointOfView({ lat: 15, lng: 82, altitude: 2.0 }, 0)
    const ctrl = globeEl.current.controls()
    ctrl.autoRotate      = true
    ctrl.autoRotateSpeed = 0.35
    ctrl.enableDamping   = true
    ctrl.dampingFactor   = 0.08
    ctrl.minDistance     = 180
    ctrl.maxDistance     = 550
    ctrl.enablePan       = false
    ctrl.addEventListener('start', () => { ctrl.autoRotate = false })
    ctrl.addEventListener('end',   () => { setTimeout(() => { ctrl.autoRotate = true }, 3000) })
  }, [])

  // points data
  const points = NODES.map(n => ({
    ...n,
    radius:   highlightNodeIds.includes(n.id) ? 0.55 : n.id === 'Q668' ? 0.45 : 0.28,
    color:    highlightNodeIds.includes(n.id) ? '#FF3131' : NODE_COLORS[n.type] || '#c8f025',
    altitude: highlightNodeIds.includes(n.id) ? 0.04 : 0.018,
  }))

  // arcs data
  const arcs = EDGES.flatMap(e => {
    const src = NODES.find(n => n.id === e.source)
    const tgt = NODES.find(n => n.id === e.target)
    if (!src || !tgt) return []
    return [{
      startLat: src.lat, startLng: src.lng,
      endLat:   tgt.lat, endLng:   tgt.lng,
      conflict: e.conflictFlag,
      weight:   0.35 + e.confidence,
      label:    `${e.relation} · ${(e.confidence * 100).toFixed(0)}%`,
    }]
  })

  // rings data
  const india = NODES.find(n => n.id === 'Q668')
  const rings = [
    ...(india ? [{
      lat: india.lat, lng: india.lng,
      maxR: 6, propagationSpeed: 1.2, repeatPeriod: 2200, isIndia: true,
    }] : []),
    ...NODES.filter(n => highlightNodeIds.includes(n.id)).map(n => ({
      lat: n.lat, lng: n.lng,
      maxR: 4, propagationSpeed: 2.5, repeatPeriod: 800, isIndia: false,
    })),
  ]

  return (
    <div ref={wrapRef} className="w-full h-full" style={{ cursor: 'grab' }}>
      <GlobeComponent
        ref={globeEl}
        width={size.w}
        height={size.h}

        // surface
        globeImageUrl={null as any}
        backgroundColor="#020e14"
        atmosphereColor="#c8f025"
        atmosphereAltitude={0.14}
        onGlobeReady={() => {
          const mat = globeEl.current?.globeMaterial() as any
          if (!mat) return
          mat.color.setHex(0x020e14)
          mat.emissive.setHex(0x071820)
          mat.emissiveIntensity = 0.5
          mat.shininess = 8
        }}

        // country polygons
        polygonsData={countries}
        polygonCapColor={() => 'rgba(8,69,86,0.45)'}
        polygonSideColor={() => 'rgba(200,240,37,0.06)'}
        polygonStrokeColor={() => 'rgba(200,240,37,0.25)'}
        polygonAltitude={0.006}

        // points
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointColor="color"
        pointRadius="radius"
        pointAltitude="altitude"
        pointResolution={14}
        pointLabel={(d: any) => `
          <div style="font-family:JetBrains Mono,monospace;font-size:11px;color:#c8f025;
            background:rgba(3,10,13,0.95);border:1px solid rgba(200,240,37,0.35);
            padding:5px 10px;pointer-events:none;line-height:1.6">
            <div style="font-weight:700;letter-spacing:.06em">${d.name}</div>
            <div style="opacity:0.5;font-size:9px;letter-spacing:.1em">
              ${d.type.replace(/_/g, ' ').toUpperCase()} · IMPACT ${d.impactScore}
            </div>
          </div>`}
        onPointClick={(d: any) => onNodeClick?.(d.id)}

        // arcs
        arcsData={arcs}
        arcStartLat="startLat"
        arcStartLng="startLng"
        arcEndLat="endLat"
        arcEndLng="endLng"
        arcColor={(d: any) => d.conflict
          ? ['rgba(255,49,49,0.95)', 'rgba(255,49,49,0.06)']
          : ['rgba(200,240,37,0.9)', 'rgba(200,240,37,0.03)']}
        arcStroke="weight"
        arcDashLength={0.4}
        arcDashGap={0.18}
        arcDashAnimateTime={2400}
        arcAltitudeAutoScale={0.38}
        arcLabel={(d: any) => `
          <div style="font-family:JetBrains Mono,monospace;font-size:10px;
            color:${d.conflict ? '#FF3131' : '#c8f025'};background:rgba(3,10,13,0.92);
            border:1px solid rgba(200,240,37,0.2);padding:3px 8px;pointer-events:none">
            ${d.label}
          </div>`}

        // rings
        ringsData={rings}
        ringLat="lat"
        ringLng="lng"
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
        ringColor={(d: any) => d.isIndia
          ? (t: number) => `rgba(200,240,37,${Math.max(0, 0.7 - t * 0.7)})`
          : (t: number) => `rgba(255,49,49,${Math.max(0, 1 - t)})`}
        ringAltitude={0.022}
      />
    </div>
  )
}
