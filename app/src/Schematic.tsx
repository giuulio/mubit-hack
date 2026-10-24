// The architecture as a diagram, after the team's whiteboard: feedback → extract → route → context and/or weights → evaluate.
// Everything runs in Hone except the dashed region, which Mubit runs. A dot travels the loop the way a lesson does.
import { useEffect, useRef } from 'react'

type Node = { x: number; y: number; w: number; title: string; sub: string; accent?: string; ink?: string }

const H = 56
const nodes: Record<string, Node> = {
  feedback: { x: 12, y: 122, w: 136, title: 'Feedback', sub: 'critique · pick' },
  extract: { x: 182, y: 122, w: 136, title: 'Extract', sub: 'atomic lessons' },
  route: { x: 352, y: 122, w: 150, title: 'Route', sub: 'tokens · effect · stability' },
  context: { x: 552, y: 34, w: 190, title: 'Context', sub: 'Hone · instant · rented', accent: 'var(--context)', ink: 'var(--ink-context)' },
  weights: { x: 552, y: 210, w: 190, title: 'Weights', sub: 'Mubit · trained · owned', accent: 'var(--weights)', ink: 'var(--ink-weights)' },
  evaluate: { x: 784, y: 122, w: 164, title: 'Evaluate', sub: 'held-out · blind judge' },
}

const right = (n: Node) => [n.x + n.w, n.y + H / 2] as const
const left = (n: Node) => [n.x, n.y + H / 2] as const

const { feedback, extract, route, context, weights, evaluate } = nodes
const [rx, ry] = right(route)
const midX = context.x + context.w / 2
const loopY = 350

// Each path once, with its colour; the dots below follow the same ids.
const paths: { id: string; d: string; color: string; dashed?: boolean }[] = [
  { id: 'p1', d: `M${right(feedback).join(' ')}H${extract.x - 2}`, color: 'var(--text-2)' },
  { id: 'p2', d: `M${right(extract).join(' ')}H${route.x - 2}`, color: 'var(--text-2)' },
  { id: 'pa', d: `M${rx} ${ry}C${rx + 30} ${ry} ${context.x - 40} ${left(context)[1]} ${context.x - 2} ${left(context)[1]}`, color: 'var(--context)' },
  { id: 'pb', d: `M${rx} ${ry}C${rx + 30} ${ry} ${weights.x - 40} ${left(weights)[1]} ${weights.x - 2} ${left(weights)[1]}`, color: 'var(--weights)' },
  { id: 'pce', d: `M${right(context).join(' ')}C${evaluate.x - 30} ${right(context)[1]} ${evaluate.x - 40} ${ry} ${evaluate.x - 2} ${ry}`, color: 'var(--text-2)' },
  { id: 'pwe', d: `M${right(weights).join(' ')}C${evaluate.x - 30} ${right(weights)[1]} ${evaluate.x - 40} ${ry} ${evaluate.x - 2} ${ry}`, color: 'var(--text-2)' },
  { id: 'pt', d: `M${midX - 22} ${context.y + H + 2}V${weights.y - 4}`, color: 'var(--both)' },
  { id: 'pr', d: `M${midX + 22} ${weights.y - 2}V${context.y + H + 4}`, color: 'var(--text-3)' },
  { id: 'pl', d: `M${evaluate.x + evaluate.w / 2} ${evaluate.y + H + 2}C${evaluate.x + evaluate.w / 2} ${loopY} ${feedback.x + feedback.w / 2} ${loopY} ${feedback.x + feedback.w / 2} ${feedback.y + H + 4}`, color: 'var(--text-3)', dashed: true },
]

// The dot's journey through one cycle, in seconds: each leg starts when the one before it ends, then the loop repeats.
const CYCLE = 7
const legs: { path: string; start: number; dur: number; color: string }[] = [
  { path: 'p1', start: 0.4, dur: 0.7, color: 'var(--text)' },
  { path: 'p2', start: 1.1, dur: 0.7, color: 'var(--text)' },
  { path: 'pa', start: 1.8, dur: 0.9, color: 'var(--context)' },
  { path: 'pb', start: 1.8, dur: 0.9, color: 'var(--weights)' },
  { path: 'pce', start: 2.7, dur: 0.9, color: 'var(--context)' },
  { path: 'pt', start: 2.9, dur: 0.8, color: 'var(--both)' },
  { path: 'pwe', start: 3.7, dur: 0.9, color: 'var(--weights)' },
  { path: 'pl', start: 4.8, dur: 1.6, color: 'var(--text-3)' },
]
const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2)

function Box({ node }: { node: Node }) {
  return (
    <g>
      <rect x={node.x} y={node.y} width={node.w} height={H} rx="12" fill="var(--bg)" stroke={node.accent ?? 'var(--line-strong)'} strokeOpacity={node.accent ? 0.7 : 1} />
      {node.accent ? <rect x={node.x} y={node.y + 14} width="3" height={H - 28} rx="1.5" fill={node.accent} /> : null}
      <text x={node.x + 16} y={node.y + 24} fontSize="14" fontWeight="700" fontFamily="var(--font-display)" fill={node.ink ?? 'var(--text)'}>{node.title}</text>
      <text x={node.x + 16} y={node.y + 42} fontSize="11.5" fill="var(--text-3)">{node.sub}</text>
    </g>
  )
}

export function Schematic() {
  const svg = useRef<SVGSVGElement>(null)
  const colors = [...new Set(paths.map((p) => p.color))]
  const marker = (color: string) => `sx-arrow-${colors.indexOf(color)}`

  // Move each leg's dot along its path while that leg is running, and hide it otherwise. Still for reduced motion.
  useEffect(() => {
    const root = svg.current
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const parts = legs.map((leg) => {
      const path = root.querySelector<SVGPathElement>(`#sx-${leg.path}-path`)!
      return { leg, path, length: path.getTotalLength(), dot: root.querySelector<SVGCircleElement>(`#sx-${leg.path}-dot`)! }
    })
    const began = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const t = ((now - began) / 1000) % CYCLE
      for (const { leg, path, length, dot } of parts) {
        const k = (t - leg.start) / leg.dur
        if (k < 0 || k > 1) { dot.setAttribute('opacity', '0'); continue }
        const point = path.getPointAtLength(ease(k) * length)
        dot.setAttribute('cx', String(point.x))
        dot.setAttribute('cy', String(point.y))
        dot.setAttribute('opacity', String(Math.min(1, k * 6, (1 - k) * 6)))
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <svg ref={svg} viewBox="0 0 960 360" width="100%" role="img" aria-label="Hone architecture">
      <defs>
        {colors.map((c) => (
          <marker key={c} id={marker(c)} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M1 1L9 5L1 9" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </marker>
        ))}
      </defs>
      <rect x={weights.x - 10} y={weights.y - 28} width={weights.w + 20} height={H + 38} rx="16" fill="var(--mubit-ink)" fillOpacity="0.06" stroke="var(--mubit-ink)" strokeDasharray="5 4" />
      <text x={weights.x + weights.w + 2} y={weights.y - 12} fontSize="12" fontWeight="700" fontFamily="var(--font-display)" fill="var(--mubit-ink)" textAnchor="end">Mubit</text>
      <g fill="none" strokeWidth="1.5">
        {paths.map((p) => <path key={p.id} id={`sx-${p.id}-path`} d={p.d} stroke={p.color} strokeDasharray={p.dashed ? '4 5' : undefined} markerEnd={`url(#${marker(p.color)})`} />)}
      </g>
      <text x="12" y="22" fontSize="15" fontWeight="700" fontFamily="var(--font-display)" fill="var(--text)">Hone</text>
      <text x={midX - 30} y={(context.y + H + weights.y) / 2 + 4} fontSize="11" fill="var(--ink-both)" textAnchor="end">train</text>
      <text x={midX + 30} y={(context.y + H + weights.y) / 2 + 4} fontSize="11" fill="var(--text-3)">retire</text>
      {Object.entries(nodes).map(([key, node]) => <Box key={key} node={node} />)}
      {legs.map((leg) => <circle key={leg.path} id={`sx-${leg.path}-dot`} r="4.5" fill={leg.color} stroke={leg.color} strokeOpacity="0.25" strokeWidth="6" opacity="0" />)}
    </svg>
  )
}
