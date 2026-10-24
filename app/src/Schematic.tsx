// The architecture as a diagram, after the team's whiteboard: feedback → extract → route → context and/or weights → evaluate.

type Node = { x: number; y: number; w: number; title: string; sub: string; accent?: string }

const H = 56
const nodes: Record<string, Node> = {
  feedback: { x: 12, y: 122, w: 136, title: 'Feedback', sub: 'taste · critique · pick' },
  extract: { x: 182, y: 122, w: 136, title: 'Extract', sub: 'atomic lessons' },
  route: { x: 352, y: 122, w: 150, title: 'Route', sub: 'cost · effect · stability' },
  context: { x: 556, y: 34, w: 176, title: 'Context', sub: 'instant · paid per call', accent: 'var(--blue)' },
  weights: { x: 556, y: 210, w: 176, title: 'Weights', sub: 'Mubit adapter · owned', accent: 'var(--cranberry)' },
  evaluate: { x: 784, y: 122, w: 164, title: 'Evaluate', sub: 'frontier · context · weights' },
}

const right = (n: Node) => [n.x + n.w, n.y + H / 2] as const
const left = (n: Node) => [n.x, n.y + H / 2] as const

function Box({ node }: { node: Node }) {
  return (
    <g>
      <rect x={node.x} y={node.y} width={node.w} height={H} rx="12" fill="var(--bg)" stroke="var(--line-strong)" />
      {node.accent ? <rect x={node.x} y={node.y + 14} width="3" height={H - 28} rx="1.5" fill={node.accent} /> : null}
      <text x={node.x + 16} y={node.y + 24} fontSize="14" fontWeight="700" fontFamily="var(--font-display)" fill="var(--text)">{node.title}</text>
      <text x={node.x + 16} y={node.y + 42} fontSize="11.5" fill="var(--text-3)">{node.sub}</text>
    </g>
  )
}

function Label({ x, y, text, color }: { x: number; y: number; text: string; color: string }) {
  const w = text.length * 8 + 14
  return (
    <g>
      <rect x={x - w / 2} y={y - 11} width={w} height="22" rx="6" fill={color} />
      <text x={x} y={y + 4} fontSize="12" fontWeight="600" fill="#fff" textAnchor="middle">{text}</text>
    </g>
  )
}

export function Schematic() {
  const { feedback, extract, route, context, weights, evaluate } = nodes
  const [rx, ry] = right(route)
  const midX = context.x + context.w / 2
  return (
    <svg viewBox="0 0 960 345" width="100%" role="img" aria-label="Hone architecture">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M1 1L9 5L1 9" fill="none" stroke="var(--text-2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>
      <g fill="none" stroke="var(--text-2)" strokeWidth="1.5" markerEnd="url(#arrow)">
        <path d={`M${right(feedback).join(' ')}H${extract.x - 2}`} />
        <path d={`M${right(extract).join(' ')}H${route.x - 2}`} />
        <path d={`M${rx} ${ry}C${rx + 30} ${ry} ${context.x - 40} ${left(context)[1]} ${context.x - 2} ${left(context)[1]}`} />
        <path d={`M${rx} ${ry}C${rx + 30} ${ry} ${weights.x - 40} ${left(weights)[1]} ${weights.x - 2} ${left(weights)[1]}`} />
        <path d={`M${right(context).join(' ')}C${evaluate.x - 30} ${right(context)[1]} ${evaluate.x - 40} ${ry} ${evaluate.x - 2} ${ry}`} />
        <path d={`M${right(weights).join(' ')}C${evaluate.x - 30} ${right(weights)[1]} ${evaluate.x - 40} ${ry} ${evaluate.x - 2} ${ry}`} />
        <path d={`M${midX - 22} ${context.y + H + 2}V${weights.y - 4}`} />
        <path d={`M${midX + 22} ${weights.y - 2}V${context.y + H + 4}`} />
        <path d={`M${evaluate.x + evaluate.w / 2} ${evaluate.y + H + 2}C${evaluate.x + evaluate.w / 2} 350 ${feedback.x + feedback.w / 2} 350 ${feedback.x + feedback.w / 2} ${feedback.y + H + 4}`} strokeDasharray="4 5" stroke="var(--text-3)" />
      </g>
      <text x={midX - 30} y={(context.y + H + weights.y) / 2 + 4} fontSize="11" fill="var(--text-3)" textAnchor="end">train</text>
      <text x={midX + 30} y={(context.y + H + weights.y) / 2 + 4} fontSize="11" fill="var(--text-3)">retire</text>
      <Label x={rx + 26} y={(ry + left(context)[1]) / 2} text="A" color="var(--blue)" />
      <Label x={rx + 26} y={(ry + left(weights)[1]) / 2} text="B" color="var(--cranberry)" />
      <Label x={midX} y={(context.y + H + weights.y) / 2} text="A∧B" color="var(--purple)" />
      {Object.entries(nodes).map(([key, node]) => <Box key={key} node={node} />)}
    </svg>
  )
}
