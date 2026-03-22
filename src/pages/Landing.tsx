import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const L = 'rgba(200,240,37'   // lime shorthand
const T = 'rgba(8,69,86'      // teal shorthand

export default function Landing() {
  const nav          = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef      = useRef<HTMLDivElement>(null)
  const line1Ref     = useRef<HTMLDivElement>(null)
  const line2Ref     = useRef<HTMLDivElement>(null)
  const line3Ref     = useRef<HTMLDivElement>(null)
  const subtitleRef  = useRef<HTMLDivElement>(null)
  const enterRef     = useRef<HTMLButtonElement>(null)
  const scanRef      = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([line1Ref.current, line2Ref.current, line3Ref.current], {
        y: 120, opacity: 0, skewY: 4,
      })
      gsap.set(subtitleRef.current, { y: 40, opacity: 0 })
      gsap.set(enterRef.current,    { y: 20, opacity: 0 })

      const tl = gsap.timeline({ delay: 0.3 })
      tl.to(line1Ref.current, { y: 0, opacity: 1, skewY: 0, duration: 1.0, ease: 'power4.out' })
        .to(line2Ref.current, { y: 0, opacity: 1, skewY: 0, duration: 1.0, ease: 'power4.out' }, '-=0.7')
        .to(line3Ref.current, { y: 0, opacity: 1, skewY: 0, duration: 1.0, ease: 'power4.out' }, '-=0.7')
        .to(subtitleRef.current, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.4')
        .to(enterRef.current,    { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }, '-=0.3')

      gsap.to(scanRef.current, { y: '100vh', duration: 3, repeat: -1, ease: 'none', delay: 1 })

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: '+=300',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress
          gsap.set(heroRef.current, { y: -p * 200, opacity: 1 - p * 2 })
        },
        onLeave: () => {
          if (!heroRef.current) return
          gsap.to(heroRef.current, {
            y: -300, opacity: 0, duration: 0.5,
            onComplete: (): void => { nav('/terminal') },
          })
        },
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      style={{ height: '200vh', background: '#030a0d' }}
    >
      {/* scan line */}
      <div
        ref={scanRef}
        className="fixed top-0 left-0 right-0 z-10 pointer-events-none"
        style={{
          height: 1,
          opacity: 0.4,
          background: 'linear-gradient(90deg, transparent, #c8f025, transparent)',
          transform: 'translateY(-100%)',
        }}
      />

      {/* corner labels */}
      <div
        className="fixed top-4 left-4 font-mono text-xxs tracking-widest"
        style={{ color: `${L},0.4)` }}
      >
        BHARATINTEL // v1.0
      </div>
      <div
        className="fixed top-4 right-4 font-mono text-xxs"
        style={{ color: `${L},0.4)` }}
      >
        {new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC
      </div>

      {/* teal side accent bar */}
      <div
        className="fixed left-0 top-0 bottom-0 pointer-events-none"
        style={{ width: 2, background: `linear-gradient(to bottom, transparent, #084556, transparent)`, opacity: 0.6 }}
      />

      {/* hero */}
      <div
        ref={heroRef}
        className="fixed inset-0 flex flex-col justify-center overflow-hidden"
        style={{ padding: '0 8vw' }}
      >
        {/* BHARAT */}
        <div className="overflow-hidden mb-2">
          <div
            ref={line1Ref}
            className="font-mono font-bold uppercase"
            style={{
              fontSize: 'clamp(60px, 11vw, 130px)',
              lineHeight: 0.9,
              letterSpacing: '-0.02em',
              color: '#c8f025',
            }}
          >
            BHARAT
          </div>
        </div>

        {/* INTEL */}
        <div className="overflow-hidden mb-2">
          <div
            ref={line2Ref}
            className="font-mono font-bold uppercase"
            style={{
              fontSize: 'clamp(60px, 11vw, 130px)',
              lineHeight: 0.9,
              letterSpacing: '-0.02em',
              color: 'rgba(255,255,255,0.85)',
            }}
          >
            INTEL
          </div>
        </div>

        {/* tagline */}
        <div className="overflow-hidden mb-12">
          <div
            ref={line3Ref}
            className="font-mono font-light uppercase tracking-widest"
            style={{
              fontSize: 'clamp(14px, 2vw, 22px)',
              color: `${L},0.45)`,
            }}
          >
            THE WORLD // ON YOUR SCREEN
          </div>
        </div>

        {/* pills */}
        <div ref={subtitleRef} className="flex flex-wrap gap-3 mb-12">
          {['Global Ontology Engine', 'India First', 'Neo4j + GDELT', 'Real-time Intelligence'].map(tag => (
            <span
              key={tag}
              className="font-mono text-xxs tracking-widest px-3 py-1 uppercase"
              style={{
                border: `1px solid ${L},0.3)`,
                color:  `${L},0.5)`,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div>
          <button
            ref={enterRef}
            onClick={() => nav('/terminal')}
            className="font-mono text-sm tracking-widest px-8 py-3 uppercase cursor-pointer transition-all duration-200"
            style={{
              background:  'transparent',
              border:      '1px solid #c8f025',
              color:       '#c8f025',
            }}
            onMouseEnter={e => {
              const b = e.currentTarget
              b.style.background = '#c8f025'
              b.style.color      = '#030a0d'
            }}
            onMouseLeave={e => {
              const b = e.currentTarget
              b.style.background = 'transparent'
              b.style.color      = '#c8f025'
            }}
          >
            [ ENTER TERMINAL ]
          </button>
          <div
            className="mt-3 font-mono text-xxs tracking-widest"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            — OR SCROLL DOWN
          </div>
        </div>

        {/* stat bar */}
        <div
          className="absolute bottom-8 flex gap-8 font-mono text-xxs tracking-widest"
          style={{ left: '8vw', color: 'rgba(255,255,255,0.2)' }}
        >
          {[['NODES', '12'], ['EDGES', '18'], ['ALERTS', '6'], ['SOURCES', '32']].map(([k, v]) => (
            <div key={k}>
              <div
                className="font-mono font-medium mb-0.5"
                style={{ fontSize: 28, color: '#c8f025' }}
              >
                {v}
              </div>
              <div>{k}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
