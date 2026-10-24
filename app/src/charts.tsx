// Minimal inline SVG charts, so the interface needs no chart library.

export function Line({ values, width = 320, height = 96 }: { values: number[]; width?: number; height?: number }) {
  if (values.length < 2) return <div className="empty">—</div>
  const max = Math.max(...values) * 1.1 || 1
  const x = (i: number) => (i / (values.length - 1)) * (width - 8) + 4
  const y = (v: number) => height - 4 - (v / max) * (height - 8)
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img">
      <path d={d} fill="none" stroke="var(--text)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="2.5" fill="var(--text)" />)}
    </svg>
  )
}
